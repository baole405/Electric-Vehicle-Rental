# Shadcn MCP Server

This repo is preconfigured to run the shadcn/ui MCP server for AI-assisted UI development.

## Prerequisites
- Node.js with `npx`
- Optional: GitHub Personal Access Token to increase rate limits

## Set GitHub token (PowerShell)
```powershell
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "ghp_your_token_here"
```

## Run the server
```powershell
npm run mcp:shadcn              # React (default)
npm run mcp:shadcn:svelte       # Svelte
npm run mcp:shadcn:vue          # Vue
npm run mcp:shadcn:rn           # React Native
```

## VS Code Integration
- Continue: already configured in `.vscode/settings.json` under `continue.server.mcpServers.shadcn-ui`.
- Claude: already configured in `.vscode/settings.json` under `claude.mcpServers.shadcn-ui`.

If no token is set, the server will run with lower GitHub API rate limits.
