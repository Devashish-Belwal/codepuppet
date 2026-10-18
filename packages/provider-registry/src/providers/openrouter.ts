import { ProviderToolDefinition, ThinkingLevel } from "@workspace/protocol";
import { ProviderAdapter, ProviderCredentials, ProviderStopReason, ProviderStreamEvent, ProviderStreamRequest } from "@workspace/protocol";
import OpenAI from "openai";
import { getSystemPrompt } from "../utils.js";

type OpenRouterClientGenerator = (apiKey: string) => OpenAI;

export class OpenRouterProvider implements ProviderAdapter {
    readonly id = "openrouter" as const;

    constructor(
        private readonly createClient: OpenRouterClientGenerator = (apiKey) =>
            new OpenAI({
                apiKey,
                baseURL: "https://openrouter.ai/api/v1",
                defaultHeaders: {
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "CodePuppet",
                },
            })
    ) { }

    async *stream(
        request: ProviderStreamRequest,
        credentials: ProviderCredentials,
        signal?: AbortSignal
    ): AsyncGenerator<ProviderStreamEvent, void, unknown> {
        const client = this.createClient(credentials.apiKey);
        const reasoning = toOpenRouterThinking(request.thinkingLevel);

        const stream = await client.chat.completions.create(
            {
                model: request.modelId,
                messages: toOpenRouterMessages(request),
                tools: toOpenRouterTools(request.tools),
                temperature: request.temperature,
                max_tokens: request.maxOutputTokens,
                stream: true,
                stream_options: { include_usage: true },
                ...(reasoning ? { reasoning } : {}),
            },
            { signal }
        );

        interface AccumulatedToolCall {
            id: string;
            name: string;
            arguments: string;
        }

        const toolCallsByIndex = new Map<number, AccumulatedToolCall>();
        let finishReason: string | undefined;
        let usage: any;
        let responseId: string | undefined;

        for await (const chunk of stream) {
            responseId = chunk.id ?? responseId;
            if (chunk.usage) {
                usage = chunk.usage;
            }

            const choice = chunk.choices?.[0];
            if (!choice) continue;

            if (choice.finish_reason) {
                finishReason = choice.finish_reason;
            }

            const delta = choice.delta;
            if (!delta) continue;

            const reasoningText =
                (delta as any).reasoning ??
                (delta as any).reasoning_content ??
                (delta as any).thought;

            if (reasoningText) {
                yield { type: "reasoning_delta", text: reasoningText };
            }

            if (delta.content) {
                yield { type: "text_delta", text: delta.content };
            }

            if (delta.tool_calls) {
                for (const tc of delta.tool_calls) {
                    const index = tc.index ?? 0;
                    let existing = toolCallsByIndex.get(index);
                    if (!existing) {
                        existing = {
                            id: tc.id ?? `openrouter-tool-${responseId ?? "call"}-${index}`,
                            name: tc.function?.name ?? "",
                            arguments: "",
                        };
                        toolCallsByIndex.set(index, existing);
                        yield { type: "tool_call_start", id: existing.id, name: existing.name };
                    } else {
                        if (tc.id && !existing.id) existing.id = tc.id;
                        if (tc.function?.name && !existing.name) existing.name = tc.function.name;
                    }

                    if (tc.function?.arguments) {
                        existing.arguments += tc.function.arguments;
                        yield {
                            type: "tool_call_delta",
                            id: existing.id,
                            argumentsDelta: tc.function.arguments,
                        };
                    }
                }
            }
        }

        let hasToolCalls = false;
        for (const tc of toolCallsByIndex.values()) {
            hasToolCalls = true;
            yield {
                type: "tool_call",
                id: tc.id,
                name: tc.name,
                arguments: parseToolArguments(tc.arguments),
                providerMetadata: {},
            };
        }

        if (usage) {
            yield {
                type: "usage",
                inputTokens: usage.prompt_tokens ?? 0,
                outputTokens: usage.completion_tokens ?? 0,
                cachedTokens: usage.prompt_tokens_details?.cached_tokens ?? 0,
                reasoningTokens: (usage as any).completion_tokens_details?.reasoning_tokens,
            };
        }

        yield {
            type: "done",
            responseId,
            stopReason: hasToolCalls ? "TOOL_USE" : mapOpenRouterStopReason(finishReason),
        };
    }
}

function toOpenRouterMessages(request: ProviderStreamRequest): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    const systemPrompt = getSystemPrompt(request);
    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }

    for (const message of request.messages) {
        if (message.role === "system") {
            continue;
        }

        if (message.role === "user") {
            messages.push({ role: "user", content: message.content });
            continue;
        }

        if (message.role === "tool") {
            messages.push({
                role: "tool",
                tool_call_id: message.toolCallId,
                content: message.isError ? `Error: ${message.content}` : message.content,
            });
            continue;
        }

        if (message.role === "assistant") {
            const assistantMsg: OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam = {
                role: "assistant",
                content: message.content ?? null,
            };

            if (message.toolCalls && message.toolCalls.length > 0) {
                assistantMsg.tool_calls = message.toolCalls.map((call) => ({
                    id: call.id,
                    type: "function" as const,
                    function: {
                        name: call.name,
                        arguments: typeof call.arguments === "string" ? call.arguments : JSON.stringify(call.arguments),
                    },
                }));
            }

            messages.push(assistantMsg);
        }
    }

    return messages;
}

function toOpenRouterTools(tools?: ProviderToolDefinition[]): OpenAI.Chat.Completions.ChatCompletionTool[] | undefined {
    if (!tools || tools.length === 0) {
        return undefined;
    }

    return tools.map((tool) => ({
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema as Record<string, unknown>,
        },
    }));
}

function parseToolArguments(rawArguments: string): Record<string, unknown> {
    if (!rawArguments) {
        return {};
    }

    try {
        return JSON.parse(rawArguments);
    } catch {
        return {};
    }
}

function toOpenRouterThinking(level?: ThinkingLevel) {
    if (!level) return undefined;
    switch (level) {
        case "INSTANT":
            return { effort: "low" as const };
        case "MID":
            return { effort: "medium" as const };
        case "HIGH":
            return { effort: "high" as const };
        default:
            return undefined;
    }
}

function mapOpenRouterStopReason(finishReason: string | undefined): ProviderStopReason {
    if (!finishReason || finishReason === "stop") return "END_TURN";
    if (finishReason === "tool_calls" || finishReason === "function_call") return "TOOL_USE";
    if (finishReason === "length") return "MAX_TOKENS";
    return "UNKNOWN";
}
