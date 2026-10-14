<!-- The rules and commands are in AGENTS.md, shared with other coding agents (Codex reads it). -->
<!-- Claude Code reads the file named after the @ as if it were written here. -->

@AGENTS.md

## Claude Code cloud sessions

`.claude/hooks/session-start.sh` runs when a cloud session starts: it installs the Node version in `.nvmrc`, pnpm and the dependencies, and points Playwright at the image's Chromium (`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`), because `playwright install` can't download browsers there. There is no `gh` there either: use the GitHub MCP tools for pull requests and CI.
