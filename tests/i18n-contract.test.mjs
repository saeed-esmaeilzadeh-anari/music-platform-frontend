import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const [faText, enText, messagesSource, configSource, translateSource] = await Promise.all([
  readFile(path.join(root, 'src/lib/i18n/messages/fa.json'), 'utf8'),
  readFile(path.join(root, 'src/lib/i18n/messages/en.json'), 'utf8'),
  readFile(path.join(root, 'src/lib/i18n/messages.ts'), 'utf8'),
  readFile(path.join(root, 'src/lib/i18n/config.ts'), 'utf8'),
  readFile(path.join(root, 'src/lib/i18n/translate.ts'), 'utf8'),
]);

const fa = JSON.parse(faText);
const en = JSON.parse(enText);

function leafPaths(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const current = prefix ? `${prefix}.${key}` : key;
    return child !== null && typeof child === 'object'
      ? leafPaths(child, current)
      : [current];
  }).sort();
}

test('Persian and English translation dictionaries have identical key paths', () => {
  assert.deepEqual(leafPaths(fa), leafPaths(en));
});

test('both dictionaries have non-empty string leaves', () => {
  for (const [locale, dictionary] of [['fa', fa], ['en', en]]) {
    for (const key of leafPaths(dictionary)) {
      const value = key.split('.').reduce((node, part) => node[part], dictionary);
      assert.equal(typeof value, 'string', `${locale}:${key} must be a string`);
      assert.ok(value.trim().length > 0, `${locale}:${key} must not be empty`);
    }
  }
});

test('required product areas exist in both languages', () => {
  const required = [
    'language',
    'navigation',
    'common',
    'auth',
    'admin',
    'forms',
    'meta',
    'artistProfile',
  ];
  for (const key of required) {
    assert.ok(fa[key], `Persian dictionary must include ${key}`);
    assert.ok(en[key], `English dictionary must include ${key}`);
  }
});

test('artist onboarding keys used by the product exist in both languages', () => {
  const required = [
    'eyebrow', 'title', 'createTitle', 'stageName', 'stageNameRequired',
    'createButton', 'createdToast', 'uploadGateTitle', 'createFailed',
  ];
  for (const key of required) {
    assert.equal(typeof fa.artistProfile[key], 'string', `fa.artistProfile.${key}`);
    assert.equal(typeof en.artistProfile[key], 'string', `en.artistProfile.${key}`);
  }
});

test('translation source contains no unresolved Git merge markers', () => {
  for (const [name, source] of [
    ['messages.ts', messagesSource],
    ['config.ts', configSource],
    ['translate.ts', translateSource],
  ]) {
    assert.doesNotMatch(source, /^(<<<<<<<|=======|>>>>>>>)/m, `${name} contains a merge marker`);
  }
});

test('Persian remains the default locale and the locale direction contract is explicit', () => {
  assert.match(configSource, /defaultLocale:\s*'fa'/);
  assert.match(configSource, /fa:\s*\{\s*dir:\s*'rtl'/);
  assert.match(configSource, /en:\s*\{\s*dir:\s*'ltr'/);
});

test('number formatting uses locale-aware Intl APIs', () => {
  assert.match(translateSource, /new Intl\.NumberFormat\(localeMeta\[locale\]\.intl\)/);
});
