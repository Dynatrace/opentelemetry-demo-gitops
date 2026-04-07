'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { normalizeFlagsDocument, applyFlagUpdates, serializeFlagsDocument } = require('./lib');

const appBasePath = normalizeBasePath(process.env.APP_BASE_PATH || '/admin');
const apiBasePath = `${appBasePath}/api`;
const healthPath = `${appBasePath}/healthz`;
const port = Number(process.env.ADMIN_UI_PORT || '8080');

const config = {
  githubOwner: process.env.GITHUB_OWNER || 'wmsegar',
  githubRepo: process.env.GITHUB_REPO || 'opentelemetry-demo-gitops',
  githubBaseBranch: process.env.GITHUB_BASE_BRANCH || 'main',
  githubWorkBranch: process.env.GITHUB_WORK_BRANCH || 'admin/flag-toggles',
  flagsFilePath:
    process.env.FLAGS_FILE_PATH || 'kustomize/components/flagd-config/demo.flagd.json',
  prTitle: process.env.GITHUB_PR_TITLE || 'Admin UI feature flag updates',
  prBody:
    process.env.GITHUB_PR_BODY ||
    'This PR was created by the Astroshop feature flag admin UI to update demo flag defaults.',
  adminUsername: process.env.ADMIN_UI_USERNAME || '',
  adminPassword: process.env.ADMIN_UI_PASSWORD || '',
  githubToken: process.env.GITHUB_TOKEN || '',
};

const textFiles = new Map([
  [`${appBasePath}`, loadTextFile('index.html')],
  [`${appBasePath}/`, loadTextFile('index.html')],
  [`${appBasePath}/flags`, loadTextFile('index.html')],
  [`${appBasePath}/flags/`, loadTextFile('index.html')],
  [`${appBasePath}/client.js`, loadTextFile('client.js')],
  [`${appBasePath}/styles.css`, loadTextFile('styles.css')],
]);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const pathname = trimTrailingSlash(url.pathname, appBasePath);

    if (pathname === trimTrailingSlash(healthPath, appBasePath)) {
      return sendJson(response, 200, { status: 'ok' });
    }

    if (pathname.startsWith(appBasePath)) {
      const authResult = requireAuth(request);
      if (!authResult.ok) {
        return sendAuthError(response, authResult);
      }
    }

    if (pathname.startsWith(apiBasePath)) {
      if (request.method === 'GET' && pathname === `${apiBasePath}/flags`) {
        const payload = await handleGetFlags();
        return sendJson(response, 200, payload);
      }

      if (request.method === 'GET' && pathname === `${apiBasePath}/status`) {
        const payload = await getStatus();
        return sendJson(response, 200, payload);
      }

      if (request.method === 'POST' && pathname === `${apiBasePath}/flags/apply`) {
        const body = await readJsonBody(request);
        const payload = await handleApplyFlags(body);
        return sendJson(response, 200, payload);
      }

      return sendJson(response, 404, { error: 'Not found' });
    }

    if (textFiles.has(pathname)) {
      const content = textFiles.get(pathname);
      const contentType = pathname.endsWith('.css')
        ? 'text/css; charset=utf-8'
        : pathname.endsWith('.js')
          ? 'application/javascript; charset=utf-8'
          : 'text/html; charset=utf-8';
      return sendText(response, 200, content, contentType);
    }

    return sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return sendJson(response, error.statusCode || 500, {
      error: error.message || 'Internal server error',
    });
  }
});

server.listen(port, () => {
  console.log(`Flag admin UI listening on port ${port}`);
});

function loadTextFile(fileName) {
  return fs.readFileSync(path.join(__dirname, fileName), 'utf8');
}

function normalizeBasePath(basePath) {
  const normalized = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return normalized.endsWith('/') && normalized !== '/' ? normalized.slice(0, -1) : normalized;
}

function trimTrailingSlash(value, basePathValue) {
  if (value === basePathValue || value === `${basePathValue}/`) {
    return basePathValue;
  }
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function requireAuth(request) {
  if (!config.adminUsername || !config.adminPassword) {
    return { ok: false, status: 503, error: 'Admin UI auth is not configured' };
  }

  const header = request.headers.authorization || '';
  if (!header.startsWith('Basic ')) {
    return { ok: false, status: 401, error: 'Missing basic auth credentials' };
  }

  const decoded = Buffer.from(header.slice('Basic '.length), 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  const username = separator >= 0 ? decoded.slice(0, separator) : '';
  const password = separator >= 0 ? decoded.slice(separator + 1) : '';

  const validUser = safeEqual(username, config.adminUsername);
  const validPassword = safeEqual(password, config.adminPassword);
  if (!validUser || !validPassword) {
    return { ok: false, status: 401, error: 'Invalid credentials' };
  }

  return { ok: true };
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sendAuthError(response, result) {
  if (result.status === 401) {
    response.setHeader('WWW-Authenticate', 'Basic realm="Astroshop Flag Admin"');
  }
  return sendJson(response, result.status, { error: result.error });
}

async function handleGetFlags() {
  const status = await getStatus();
  const ref = status.branchExists ? config.githubWorkBranch : config.githubBaseBranch;
  const remoteFile = await getRemoteFile(ref);
  return {
    source: {
      owner: config.githubOwner,
      repo: config.githubRepo,
      ref,
      path: config.flagsFilePath,
    },
    branchStatus: status,
    flags: normalizeFlagsDocument(remoteFile.document),
  };
}

async function handleApplyFlags(body) {
  if (!config.githubToken) {
    throw new Error('GITHUB_TOKEN must be configured to apply flag changes');
  }

  const updates = body && Array.isArray(body.flags) ? body.flags : null;
  if (!updates) {
    throw new Error('Request body must include a flags array');
  }

  const status = await getStatus();
  await ensureWorkBranch(status);
  const remoteFile = await getRemoteFile(config.githubWorkBranch);
  const { nextDocument, changedFlags } = applyFlagUpdates(remoteFile.document, updates);

  if (changedFlags.length === 0) {
    return {
      changedFlags,
      branch: config.githubWorkBranch,
      pullRequest: status.pullRequest,
      commitSha: null,
      message: 'No flag values changed',
    };
  }

  const commit = await updateRemoteFile({
    branch: config.githubWorkBranch,
    content: serializeFlagsDocument(nextDocument),
    sha: remoteFile.sha,
    message: `Update feature flags: ${changedFlags.join(', ')}`,
  });

  let pullRequest = status.pullRequest;
  if (!pullRequest) {
    pullRequest = await createPullRequest();
  }

  return {
    changedFlags,
    branch: config.githubWorkBranch,
    pullRequest,
    commitSha: commit.commit.sha,
    message: `Updated ${changedFlags.length} flag(s) on ${config.githubWorkBranch}`,
  };
}

async function getStatus() {
  const branch = await getBranch(config.githubWorkBranch);
  const pullRequest = await getOpenPullRequest();
  return {
    branchExists: Boolean(branch),
    branch: branch ? { name: config.githubWorkBranch, sha: branch.object.sha } : null,
    pullRequest,
    baseBranch: config.githubBaseBranch,
  };
}

async function ensureWorkBranch(status) {
  if (status.branchExists) {
    return;
  }

  const baseBranch = await getBranch(config.githubBaseBranch);
  if (!baseBranch) {
    throw new Error(`Base branch ${config.githubBaseBranch} was not found`);
  }

  await githubFetch('/git/refs', {
    method: 'POST',
    body: JSON.stringify({
      ref: `refs/heads/${config.githubWorkBranch}`,
      sha: baseBranch.object.sha,
    }),
  });
}

async function getRemoteFile(ref) {
  const response = await githubFetch(
    `/contents/${encodePath(config.flagsFilePath)}?ref=${encodeURIComponent(ref)}`,
  );

  const content = Buffer.from(response.content, 'base64').toString('utf8');
  return {
    sha: response.sha,
    document: JSON.parse(content),
  };
}

async function updateRemoteFile({ branch, content, sha, message }) {
  return githubFetch(`/contents/${encodePath(config.flagsFilePath)}`, {
    method: 'PUT',
    body: JSON.stringify({
      branch,
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      sha,
    }),
  });
}

async function getBranch(branchName) {
  try {
    return await githubFetch(`/git/ref/heads/${branchName}`);
  } catch (error) {
    if (error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

async function getOpenPullRequest() {
  const response = await githubFetch(
    `/pulls?state=open&head=${encodeURIComponent(
      `${config.githubOwner}:${config.githubWorkBranch}`,
    )}&base=${encodeURIComponent(config.githubBaseBranch)}`,
  );

  const pullRequest = Array.isArray(response) ? response[0] : null;
  if (!pullRequest) {
    return null;
  }

  return {
    number: pullRequest.number,
    url: pullRequest.html_url,
    title: pullRequest.title,
    state: pullRequest.state,
  };
}

async function createPullRequest() {
  const response = await githubFetch('/pulls', {
    method: 'POST',
    body: JSON.stringify({
      title: config.prTitle,
      head: config.githubWorkBranch,
      base: config.githubBaseBranch,
      body: config.prBody,
    }),
  });

  return {
    number: response.number,
    url: response.html_url,
    title: response.title,
    state: response.state,
  };
}

async function githubFetch(pathname, options = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'astroshop-flag-admin',
    ...(options.headers || {}),
  };

  if (config.githubToken) {
    headers.Authorization = `Bearer ${config.githubToken}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}${pathname}`,
    {
      method: options.method || 'GET',
      headers,
      body: options.body,
    },
  );

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error((data && data.message) || `GitHub request failed with ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }
  return data;
}

function encodePath(filePath) {
  return filePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Request body must be valid JSON'));
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(`${JSON.stringify(payload)}\n`);
}

function sendText(response, statusCode, payload, contentType) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', contentType);
  response.end(payload);
}
