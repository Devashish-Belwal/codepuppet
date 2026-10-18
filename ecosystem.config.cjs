const path = require("path");

module.exports = {
  apps: [
    {
      name: "codepuppet-api",
      cwd: path.resolve(__dirname, "apps/api"),
      script: "bun",
      args: "start",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "codepuppet-web",
      cwd: path.resolve(__dirname, "apps/web"),
      script: "bun",
      args: "start -- -p 3000",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
