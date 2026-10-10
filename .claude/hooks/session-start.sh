#!/bin/bash
# Runs when a Claude Code cloud session starts, so `pnpm test`, `pnpm lint` and the other
# scripts work right away. Local sessions skip it: there you install things yourself.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# The cloud image ships an older Node, but package.json's `engines` and `engineStrict`
# want the major version in .nvmrc. Download that Node once; the container is cached after
# this hook, so later sessions find it already there.
NODE_MAJOR="$(tr -d '[:space:]v' < .nvmrc)"
NODE_HOME="$HOME/.cache/node-v$NODE_MAJOR"
if [ ! -x "$NODE_HOME/bin/node" ]; then
  version="$(curl -fsSL https://nodejs.org/dist/index.json |
    grep -o "\"version\":\"v$NODE_MAJOR\.[0-9.]*\"" | head -1 | cut -d'"' -f4)"
  mkdir -p "$NODE_HOME"
  curl -fsSL "https://nodejs.org/dist/$version/node-$version-linux-x64.tar.xz" |
    tar -xJ -C "$NODE_HOME" --strip-components=1
fi
export PATH="$NODE_HOME/bin:$PATH"

# Corepack (bundled with Node 24) provides the exact pnpm named in `packageManager`.
corepack enable --install-directory "$NODE_HOME/bin"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Keep this Node and pnpm first on PATH for every command Claude runs in this session.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo "export PATH=\"$NODE_HOME/bin:\$PATH\""
    echo "export COREPACK_ENABLE_DOWNLOAD_PROMPT=0"
    # The image has a Chromium but can't download Playwright's own (`playwright install`).
    # playwright.config.ts launches this one instead when the variable is set.
    if [ -x /opt/pw-browsers/chromium ]; then
      echo "export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium"
    fi
  } >> "$CLAUDE_ENV_FILE"
fi

# Not --frozen-lockfile: if the lockfile is out of date, still install, and let CI catch it.
pnpm install
