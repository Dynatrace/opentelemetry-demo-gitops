'use strict';

function isBooleanToggleFlag(flag) {
  if (!flag || typeof flag !== 'object') {
    return false;
  }

  const variants = flag.variants;
  return (
    variants &&
    typeof variants === 'object' &&
    variants.on === true &&
    variants.off === false &&
    (flag.defaultVariant === 'on' || flag.defaultVariant === 'off')
  );
}

function normalizeFlagsDocument(document) {
  if (!document || typeof document !== 'object' || !document.flags || typeof document.flags !== 'object') {
    throw new Error('Invalid flag document: missing top-level flags object');
  }

  return Object.entries(document.flags)
    .map(([flagKey, flag]) => {
      const supported = isBooleanToggleFlag(flag);
      return {
        flagKey,
        description: flag.description || '',
        state: flag.state || 'UNKNOWN',
        defaultVariant: flag.defaultVariant,
        variants: flag.variants || {},
        enabled: flag.defaultVariant === 'on',
        supported,
      };
    })
    .sort((left, right) => left.flagKey.localeCompare(right.flagKey));
}

function applyFlagUpdates(document, requestedUpdates) {
  if (!Array.isArray(requestedUpdates) || requestedUpdates.length === 0) {
    throw new Error('At least one flag update is required');
  }

  const nextDocument = JSON.parse(JSON.stringify(document));
  const changedFlags = [];
  const seen = new Set();

  for (const update of requestedUpdates) {
    if (!update || typeof update.flagKey !== 'string' || typeof update.enabled !== 'boolean') {
      throw new Error('Each update must include a flagKey and boolean enabled value');
    }

    if (seen.has(update.flagKey)) {
      throw new Error(`Duplicate update for flag ${update.flagKey}`);
    }
    seen.add(update.flagKey);

    const flag = nextDocument.flags[update.flagKey];
    if (!flag) {
      throw new Error(`Unknown flag ${update.flagKey}`);
    }
    if (!isBooleanToggleFlag(flag)) {
      throw new Error(`Flag ${update.flagKey} is not a supported on/off toggle`);
    }

    const nextVariant = update.enabled ? 'on' : 'off';
    if (flag.defaultVariant !== nextVariant) {
      flag.defaultVariant = nextVariant;
      changedFlags.push(update.flagKey);
    }
  }

  return {
    nextDocument,
    changedFlags,
  };
}

function serializeFlagsDocument(document) {
  return `${JSON.stringify(document, null, 2)}\n`;
}

module.exports = {
  applyFlagUpdates,
  isBooleanToggleFlag,
  normalizeFlagsDocument,
  serializeFlagsDocument,
};
