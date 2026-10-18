import Anthropic from "@anthropic-ai/sdk";
import {
    ProviderAdapter,
    ProviderCredentials,
    ProviderStopReason,
    ProviderStreamEvent,
    ProviderStreamRequest,
    ProviderToolDefinition,
    ThinkingLevel,
} from "@workspace/protocol";
import { getSystemPrompt } from "../utils.js";

type AnthropicClientGenerator = (apiKey: string) => Anthropic;

export class AnthropicProvider implements ProviderAdapter {
    readonly id = "anthropic" as const;

    constructor(
        private readonly createClient: AnthropicClientGenerator = (apiKey) => new Anthropic({ apiKey })
    ) { }

    async *stream(
        request: ProviderStreamRequest,
        credentials: ProviderCredentials,
        signal?: AbortSignal
    ): AsyncGenerator<ProviderStreamEvent, void, unknown> {
        const client = this.createClient(credentials.apiKey);
        const thinking = toAnthropicThinking(request.thinkingLevel);

        const stream = await client.messages.create(
            {
                model: request.modelId,
                messages: toAnthropicMessages(request),
                system: getSystemPrompt(request),
                tools: toAnthropicTools(request.tools),
                max_tokens: request.maxOutputTokens || 4096,
                temperature: thinking ? undefined : request.temperature,
                ...(thinking ? { thinking } : {}),
                stream: true,
            },
            { signal }
        );

        let responseId: string | undefined;
        let stopReason: Anthropic.Message["stop_reason"] | undefined;
        let inputTokens = 0;
        let outputTokens = 0;
        let cachedTokens = 0;

        interface AccumulatedToolCall {
            id: string;
            name: string;
            json: string;
        }

        const toolCallsByIndex = new Map<number, AccumulatedToolCall>();

        for await (const event of stream) {
            if (event.type === "message_start") {
                responseId = event.message.id;
                inputTokens = event.message.usage?.input_tokens ?? 0;
                cachedTokens = (event.message.usage as any)?.cache_read_input_tokens ?? 0;
            } else if (event.type === "content_block_start") {
                const block = event.content_block;
                if (block.type === "tool_use") {
                    toolCallsByIndex.set(event.index, {
                        id: block.id,
                        name: block.name,
                        json: "",
                    });
                    yield { type: "tool_call_start", id: block.id, name: block.name };
                }
            } else if (event.type === "content_block_delta") {
                const delta = event.delta;
                if (delta.type === "text_delta") {
                    yield { type: "text_delta", text: delta.text };
                } else if (delta.type === "input_json_delta") {
                    const call = toolCallsByIndex.get(event.index);
                    if (call) {
                        call.json += delta.partial_json;
                        yield { type: "tool_call_delta", id: call.id, argumentsDelta: delta.partial_json };
                    }
                } else if ((delta as any).type === "thinking_delta") {
                    yield { type: "reasoning_delta", text: (delta as any).thinking };
                }
            } else if (event.type === "message_delta") {
                stopReason = event.delta.stop_reason ?? stopReason;
                if (event.usage) {
                    outputTokens = event.usage.output_tokens ?? outputTokens;
                }
            }
        }

        let hasToolCalls = false;
        for (const call of toolCallsByIndex.values()) {
            hasToolCalls = true;
            let args: Record<string, unknown> = {};
            try {
                args = call.json ? JSON.parse(call.json) : {};
            } catch {
                args = {};
            }
            yield {
                type: "tool_call",
                id: call.id,
                name: call.name,
                arguments: args,
                providerMetadata: {},
            };
        }

        yield {
            type: "usage",
            inputTokens,
            outputTokens,
            cachedTokens,
        };

        yield {
            type: "done",
            responseId,
            stopReason: hasToolCalls ? "TOOL_USE" : mapAnthropicStopReason(stopReason),
        };
    }
}

function toAnthropicMessages(request: ProviderStreamRequest): Anthropic.MessageParam[] {
    const messages: Anthropic.MessageParam[] = [];

    for (const msg of request.messages) {
        if (msg.role === "system") {
            continue;
        }

        if (msg.role === "user") {
            messages.push({ role: "user", content: msg.content });
            continue;
        }

        if (msg.role === "tool") {
            const toolResult: Anthropic.ToolResultBlockParam = {
                type: "tool_result",
                tool_use_id: msg.toolCallId,
                content: msg.content,
                is_error: msg.isError,
            };

            const prev = messages[messages.length - 1];
            if (prev && prev.role === "user" && Array.isArray(prev.content)) {
                (prev.content as Anthropic.ToolResultBlockParam[]).push(toolResult);
            } else {
                messages.push({
                    role: "user",
                    content: [toolResult],
                });
            }
            continue;
        }

        if (msg.role === "assistant") {
            const contentBlocks: (Anthropic.TextBlockParam | Anthropic.ToolUseBlockParam)[] = [];
            if (msg.content) {
                contentBlocks.push({ type: "text", text: msg.content });
            }
            if (msg.toolCalls && msg.toolCalls.length > 0) {
                for (const tc of msg.toolCalls) {
                    contentBlocks.push({
                        type: "tool_use",
                        id: tc.id,
                        name: tc.name,
                        input: tc.arguments,
                    });
                }
            }
            if (contentBlocks.length > 0) {
                messages.push({ role: "assistant", content: contentBlocks });
            }
        }
    }

    return messages;
}

function toAnthropicTools(tools?: ProviderToolDefinition[]): Anthropic.Tool[] | undefined {
    if (!tools || tools.length === 0) {
        return undefined;
    }

    return tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
    }));
}

function toAnthropicThinking(level?: ThinkingLevel) {
    if (!level) return undefined;
    switch (level) {
        case "INSTANT":
            return { type: "enabled" as const, budget_tokens: 1024 };
        case "MID":
            return { type: "enabled" as const, budget_tokens: 4096 };
        case "HIGH":
            return { type: "enabled" as const, budget_tokens: 16384 };
        default:
            return undefined;
    }
}

function mapAnthropicStopReason(reason?: Anthropic.Message["stop_reason"] | null): ProviderStopReason {
    if (!reason || reason === "end_turn") return "END_TURN";
    if (reason === "tool_use") return "TOOL_USE";
    if (reason === "max_tokens") return "MAX_TOKENS";
    if (reason === "stop_sequence") return "STOP_SEQUENCE";
    return "UNKNOWN";
}
