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

# Playwright records videos with its own ffmpeg build, in a folder named after the revision
# its version wants (like ffmpeg-1013). The image's /opt/pw-browsers may hold an older one,
# and `playwright install ffmpeg` can't download here. So build a browsers folder of our own:
# links to everything in the image, plus that ffmpeg folder pointing at a working ffmpeg.
if [ -d /opt/pw-browsers ]; then
  PW_BROWSERS="$HOME/.cache/pw-browsers"
  mkdir -p "$PW_BROWSERS"
  for entry in /opt/pw-browsers/*; do
    ln -sfn "$entry" "$PW_BROWSERS/"
  done

  # Ask Playwright where it looks for ffmpeg, so this keeps working after an upgrade.
  ffmpeg_dir="$(PLAYWRIGHT_BROWSERS_PATH="$PW_BROWSERS" pnpm exec playwright install --dry-run ffmpeg |
    sed -n 's/^ *Install location: *//p')" || ffmpeg_dir=""
  if [ -n "$ffmpeg_dir" ] && [ ! -e "$ffmpeg_dir" ]; then
    # Playwright pipes frames in and encodes them as VP9 WebM, so that encoder must be there.
    # (Not `grep -q`: it stops reading early, ffmpeg then fails to write, and pipefail fails the check.)
    if command -v ffmpeg > /dev/null && ffmpeg -hide_banner -encoders 2> /dev/null | grep libvpx-vp9 > /dev/null; then
      mkdir -p "$ffmpeg_dir"
      ln -sfn "$(command -v ffmpeg)" "$ffmpeg_dir/ffmpeg-linux"
      touch "$ffmpeg_dir/INSTALLATION_COMPLETE"
    else
      echo "session-start: no ffmpeg with libvpx-vp9 found, so Playwright can't record videos." >&2
    fi
  fi

  if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    echo "export PLAYWRIGHT_BROWSERS_PATH=\"$PW_BROWSERS\"" >> "$CLAUDE_ENV_FILE"
  fi
fi
