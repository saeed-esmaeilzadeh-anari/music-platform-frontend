import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const port = Number(process.env.FRONTEND_E2E_PORT ?? 3217);
const origin = `http://127.0.0.1:${port}`;
const start = Date.now();
const timeoutMs = 45_000;
const child = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: '127.0.0.1',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001/api/v1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);

let output = '';
child.stdout.on('data', (chunk) => { output += chunk.toString(); });
child.stderr.on('data', (chunk) => { output += chunk.toString(); });

async function waitUntilReady() {
  while (Date.now() - start < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js server exited early (code ${child.exitCode}):\n${output}`);
    }
    try {
      const response = await fetch(`${origin}/login`);
      if (response.status < 500) return;
    } catch {
      // Server is still starting.
    }
    await delay(350);
  }
  throw new Error(`Next.js server did not become ready within ${timeoutMs}ms:\n${output}`);
}

async function checkPage(path, locale, direction, expectedText) {
  const response = await fetch(`${origin}${path}`, {
    headers: { cookie: `NEXT_LOCALE=${locale}` },
    redirect: 'manual',
  });
  assert.equal(response.status, 200, `${path} should render successfully for ${locale}`);
  const html = await response.text();
  assert.match(html, new RegExp(`<html[^>]*lang="${locale}"[^>]*dir="${direction}"|<html[^>]*dir="${direction}"[^>]*lang="${locale}"`));
  assert.ok(html.includes(expectedText), `${path} should contain its ${locale} copy`);
}

try {
  await waitUntilReady();

  await checkPage('/login', 'fa', 'rtl', 'خوش برگشتید');
  await checkPage('/login', 'en', 'ltr', 'Welcome back');
  await checkPage('/register', 'fa', 'rtl', 'ایجاد حساب کاربری');
  await checkPage('/register', 'en', 'ltr', 'Create your account');
  await checkPage('/forgot-password', 'fa', 'rtl', 'بازیابی رمز عبور');
  await checkPage('/forgot-password', 'en', 'ltr', 'Reset your password');

  console.log(JSON.stringify({
    success: true,
    checks: [
      'production Next.js server startup',
      'Persian login SSR renders RTL and Persian copy',
      'English login SSR renders LTR and English copy',
      'Persian registration SSR renders RTL and Persian copy',
      'English registration SSR renders LTR and English copy',
      'Persian password recovery SSR renders RTL and Persian copy',
      'English password recovery SSR renders LTR and English copy',
    ],
  }, null, 2));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  child.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    delay(5_000),
  ]);
  if (child.exitCode === null) child.kill('SIGKILL');
}
