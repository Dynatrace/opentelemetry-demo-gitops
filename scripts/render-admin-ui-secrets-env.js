'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const valuesPath = path.join(repoRoot, 'kustomize', 'base', 'values.local.yaml');
const outputPath = path.join(
  repoRoot,
  'kustomize',
  'components',
  'flag-admin-ui',
  'data.env',
);

const values = fs.existsSync(valuesPath) ? parseSimpleYaml(fs.readFileSync(valuesPath, 'utf8')) : {};
const adminConfig =
  (((values || {}).components || {})['flag-admin-ui']) || {};

const lines = [];
appendIfPresent(lines, 'username', adminConfig.authUsername);
appendIfPresent(lines, 'password', adminConfig.authPassword);
appendIfPresent(lines, 'githubToken', adminConfig.githubToken);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join('\n')}${lines.length ? '\n' : ''}`, 'utf8');

if (lines.length === 0) {
  console.warn(
    'render-admin-ui-secrets-env: no flag-admin-ui values found in kustomize/base/values.local.yaml',
  );
}

function appendIfPresent(linesList, key, value) {
  if (value === undefined || value === null || value === '') {
    return;
  }
  linesList.push(`${key}=${String(value)}`);
}

function parseSimpleYaml(text) {
  const root = {};
  const stack = [{ indent: -1, value: root }];
  const linesList = text.split(/\r?\n/);

  for (const rawLine of linesList) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith('#')) {
      continue;
    }

    const match = rawLine.match(/^(\s*)([^:]+):(?:\s*(.*))?$/);
    if (!match) {
      continue;
    }

    const indent = match[1].length;
    const key = match[2].trim();
    const valuePart = stripInlineComment(match[3] || '');

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].value;
    if (!valuePart) {
      parent[key] = {};
      stack.push({ indent, value: parent[key] });
      continue;
    }

    parent[key] = parseScalar(valuePart.trim());
  }

  return root;
}

function stripInlineComment(value) {
  let quoted = false;
  let quoteChar = '';
  let result = '';

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if ((character === '"' || character === "'") && (index === 0 || value[index - 1] !== '\\')) {
      if (!quoted) {
        quoted = true;
        quoteChar = character;
      } else if (quoteChar === character) {
        quoted = false;
      }
    }

    if (!quoted && character === '#') {
      break;
    }

    result += character;
  }

  return result.trim();
}

function parseScalar(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}
