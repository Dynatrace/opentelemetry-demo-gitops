const state = {
  flags: [],
  draft: new Map(),
};

const elements = {
  flags: document.getElementById('flags'),
  saveButton: document.getElementById('save-button'),
  message: document.getElementById('message'),
  prLink: document.getElementById('pr-link'),
  branchStatusText: document.getElementById('branch-status-text'),
};

initialize().catch((error) => {
  showMessage(error.message || 'Failed to load admin UI', 'error');
});

async function initialize() {
  await refresh();
  elements.saveButton.addEventListener('click', saveChanges);
}

async function refresh() {
  const response = await fetch('/admin/api/flags', { credentials: 'same-origin' });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load flags');
  }

  state.flags = payload.flags;
  state.draft = new Map(payload.flags.map((flag) => [flag.flagKey, flag.enabled]));
  renderStatus(payload.branchStatus);
  renderFlags();
  updateSaveState();
}

function renderStatus(status) {
  if (status.pullRequest) {
    elements.branchStatusText.textContent = `Working branch ${status.branch.name} has an open PR #${status.pullRequest.number}. New saves will update that PR.`;
    elements.prLink.href = status.pullRequest.url;
    elements.prLink.classList.remove('hidden');
  } else if (status.branchExists && status.branch) {
    elements.branchStatusText.textContent = `Working branch ${status.branch.name} exists but does not currently have an open PR.`;
    elements.prLink.classList.add('hidden');
  } else {
    elements.branchStatusText.textContent = `No admin branch exists yet. Your first save will create a reusable admin branch and open a PR in the fork.`;
    elements.prLink.classList.add('hidden');
  }
}

function renderFlags() {
  elements.flags.innerHTML = '';

  for (const flag of state.flags) {
    const article = document.createElement('article');
    article.className = `flag-card ${flag.supported ? '' : 'flag-card-disabled'}`;

    const title = document.createElement('h3');
    title.textContent = flag.flagKey;
    article.appendChild(title);

    const description = document.createElement('p');
    description.className = 'flag-description';
    description.textContent = flag.description || 'No description provided.';
    article.appendChild(description);

    const meta = document.createElement('p');
    meta.className = 'flag-meta';
    meta.textContent = `State: ${flag.state} • Default variant: ${flag.defaultVariant}`;
    article.appendChild(meta);

    const controls = document.createElement('div');
    controls.className = 'flag-controls';

    const label = document.createElement('label');
    label.className = 'toggle';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = state.draft.get(flag.flagKey);
    input.disabled = !flag.supported;
    input.addEventListener('change', () => {
      state.draft.set(flag.flagKey, input.checked);
      valueText.textContent = input.checked ? 'On' : 'Off';
      updateSaveState();
    });

    const slider = document.createElement('span');
    slider.className = 'slider';

    const valueText = document.createElement('span');
    valueText.className = 'toggle-text';
    valueText.textContent = input.checked ? 'On' : 'Off';

    label.appendChild(input);
    label.appendChild(slider);
    controls.appendChild(label);
    controls.appendChild(valueText);

    if (!flag.supported) {
      const unsupported = document.createElement('span');
      unsupported.className = 'unsupported';
      unsupported.textContent = 'Unsupported flag shape';
      controls.appendChild(unsupported);
    }

    article.appendChild(controls);
    elements.flags.appendChild(article);
  }
}

function updateSaveState() {
  const changedCount = getChangedFlags().length;
  elements.saveButton.disabled = changedCount === 0;
  elements.saveButton.textContent =
    changedCount === 0 ? 'Save changes' : `Save ${changedCount} change${changedCount === 1 ? '' : 's'}`;
}

function getChangedFlags() {
  return state.flags
    .filter((flag) => flag.supported)
    .filter((flag) => state.draft.get(flag.flagKey) !== flag.enabled)
    .map((flag) => ({
      flagKey: flag.flagKey,
      enabled: state.draft.get(flag.flagKey),
    }));
}

async function saveChanges() {
  const flags = getChangedFlags();
  if (flags.length === 0) {
    return;
  }

  elements.saveButton.disabled = true;
  showMessage('Saving changes through GitHub…', 'info');

  try {
    const response = await fetch('/admin/api/flags/apply', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flags }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Failed to save changes');
    }

    showMessage(
      payload.pullRequest
        ? `Saved ${payload.changedFlags.length} change(s). PR #${payload.pullRequest.number} is ready.`
        : payload.message,
      'success',
    );
    await refresh();
  } catch (error) {
    showMessage(error.message || 'Failed to save changes', 'error');
    updateSaveState();
  }
}

function showMessage(text, tone) {
  elements.message.textContent = text;
  elements.message.className = `message message-${tone}`;
}
