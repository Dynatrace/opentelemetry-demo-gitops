'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeFlagsDocument, applyFlagUpdates, serializeFlagsDocument } = require('./lib');

function buildDocument() {
  return {
    $schema: 'https://flagd.dev/schema/v0/flags.json',
    flags: {
      productCatalogFailure: {
        description: 'Boolean toggle',
        state: 'ENABLED',
        variants: {
          on: true,
          off: false,
        },
        defaultVariant: 'off',
      },
      paymentFailure: {
        description: 'Percentage flag',
        state: 'ENABLED',
        variants: {
          '100%': 1,
          off: 0,
        },
        defaultVariant: 'off',
      },
    },
  };
}

test('normalizeFlagsDocument maps on/off flags to enabled booleans', () => {
  const flags = normalizeFlagsDocument(buildDocument());
  const booleanFlag = flags.find((flag) => flag.flagKey === 'productCatalogFailure');
  const complexFlag = flags.find((flag) => flag.flagKey === 'paymentFailure');

  assert.equal(booleanFlag.enabled, false);
  assert.equal(booleanFlag.supported, true);
  assert.equal(complexFlag.supported, false);
});

test('applyFlagUpdates updates only requested boolean flags', () => {
  const { nextDocument, changedFlags } = applyFlagUpdates(buildDocument(), [
    { flagKey: 'productCatalogFailure', enabled: true },
  ]);

  assert.deepEqual(changedFlags, ['productCatalogFailure']);
  assert.equal(nextDocument.flags.productCatalogFailure.defaultVariant, 'on');
  assert.equal(nextDocument.flags.paymentFailure.defaultVariant, 'off');
});

test('applyFlagUpdates rejects unsupported flag shapes', () => {
  assert.throws(
    () =>
      applyFlagUpdates(buildDocument(), [{ flagKey: 'paymentFailure', enabled: true }]),
    /not a supported on\/off toggle/,
  );
});

test('serializeFlagsDocument preserves trailing newline', () => {
  const serialized = serializeFlagsDocument(buildDocument());
  assert.match(serialized, /\n$/);
});
