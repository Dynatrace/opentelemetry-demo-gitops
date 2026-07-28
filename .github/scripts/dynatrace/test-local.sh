#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"

: "${DT_URL:?Set DT_URL to the Dynatrace platform URL, for example https://abc12345.apps.dynatrace.com}"
: "${DT_TOKEN:?Set DT_TOKEN to a Dynatrace platform token}"

export DEPLOY_ENV="${DEPLOY_ENV:-playground-dev}"
export TERRAFORM_OUTCOME="${TERRAFORM_OUTCOME:-success}"
export GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-$(git -C "$REPO_ROOT" config --get remote.origin.url | sed -E 's#^git@github.com:##; s#^https://github.com/##; s#\.git$##')}"
export GITHUB_SHA="${GITHUB_SHA:-$(git -C "$REPO_ROOT" rev-parse HEAD)}"
export GITHUB_REF="${GITHUB_REF:-refs/heads/local-test}"
export GITHUB_EVENT_NAME="${GITHUB_EVENT_NAME:-local-test}"
export GITHUB_WORKFLOW="${GITHUB_WORKFLOW:-Local Dynatrace test}"

if [[ ! -d "$SCRIPT_DIR/node_modules" ]]; then
  npm ci --prefix "$SCRIPT_DIR"
fi

node "$SCRIPT_DIR/send-deployment-event.js"
