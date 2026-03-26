#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const ENV_FILES = ['.env', '.env.local'];

function parseEnvValue(rawValue) {
  const value = rawValue.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

async function loadEnvFile(filename) {
  const filePath = path.join(cwd, filename);

  try {
    const contents = await readFile(filePath, 'utf8');
    const values = {};

    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = parseEnvValue(trimmed.slice(separatorIndex + 1));
      values[key] = value;
    }

    return values;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

function maskSecret(value, visible = 6) {
  if (!value) return '(missing)';
  if (value.length <= visible * 2) return `${value.slice(0, visible)}...`;
  return `${value.slice(0, visible)}...${value.slice(-visible)}`;
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(Buffer.from(normalized + padding, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function getSupabaseProjectRef(url) {
  const match = url?.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co$/i);
  return match?.[1] ?? null;
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, init);
  const text = await response.text();

  try {
    return {
      ok: response.ok,
      status: response.status,
      body: JSON.parse(text),
    };
  } catch {
    return {
      ok: response.ok,
      status: response.status,
      body: text,
    };
  }
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function printItem(label, value) {
  console.log(`${label}: ${value}`);
}

async function verifySupabase(env) {
  printSection('Supabase');

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    printItem('Status', 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return { ok: false };
  }

  const projectRefFromUrl = getSupabaseProjectRef(url);
  const anonPayload = decodeJwtPayload(anonKey);
  printItem('Project URL', url);
  printItem('Anon key', maskSecret(anonKey));
  printItem('Service role key', maskSecret(serviceRoleKey));
  printItem('Project ref from URL', projectRefFromUrl ?? '(unrecognized)');
  printItem('Project ref from anon JWT', anonPayload?.ref ?? '(unavailable)');
  printItem('Role from anon JWT', anonPayload?.role ?? '(unavailable)');

  const authSettingsUrl = `${url}/auth/v1/settings`;

  try {
    const anonResult = await fetchJson(authSettingsUrl, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    printItem('Anon auth settings', `${anonResult.status} ${anonResult.ok ? 'OK' : 'ERROR'}`);

    if (!anonResult.ok && anonResult.body?.message) {
      printItem('Anon auth message', anonResult.body.message);
    }

    if (!serviceRoleKey) {
      return { ok: anonResult.ok };
    }

    const serviceResult = await fetchJson(authSettingsUrl, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    printItem('Service auth settings', `${serviceResult.status} ${serviceResult.ok ? 'OK' : 'ERROR'}`);

    if (!serviceResult.ok && serviceResult.body?.message) {
      printItem('Service auth message', serviceResult.body.message);
    }

    if (!anonResult.ok && serviceResult.ok) {
      console.log(
        'Diagnosis: The Supabase project is live, but NEXT_PUBLIC_SUPABASE_ANON_KEY is stale or incorrect. ' +
        'Copy the current anon key from Supabase Dashboard > Settings > API, update .env.local, and restart Next.js.'
      );
      return { ok: false };
    }

    if (!anonResult.ok && !serviceResult.ok) {
      console.log(
        'Diagnosis: Both Supabase keys are being rejected. The project URL may be wrong, the project may be inaccessible, ' +
        'or both keys were rotated.'
      );
      return { ok: false };
    }

    if (projectRefFromUrl && anonPayload?.ref && projectRefFromUrl !== anonPayload.ref) {
      console.log(
        'Diagnosis: The anon JWT ref does not match the project URL. Update NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY so they point at the same project.'
      );
      return { ok: false };
    }

    console.log('Diagnosis: Supabase URL and keys appear valid.');
    return { ok: true };
  } catch (error) {
    printItem('Network error', error instanceof Error ? error.message : String(error));
    return { ok: false };
  }
}

function getStripeMode(key) {
  if (!key) return null;
  if (key.startsWith('pk_test_') || key.startsWith('sk_test_')) return 'test';
  if (key.startsWith('pk_live_') || key.startsWith('sk_live_')) return 'live';
  return 'unknown';
}

async function verifyStripe(env) {
  printSection('Stripe');

  const publishableKey = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const secretKey = env.STRIPE_SECRET_KEY;
  const monthlyPriceId = env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
  const yearlyPriceId = env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

  printItem('Publishable key', maskSecret(publishableKey));
  printItem('Secret key', maskSecret(secretKey));
  printItem('Monthly price ID', monthlyPriceId ?? '(missing)');
  printItem('Yearly price ID', yearlyPriceId ?? '(missing)');

  const publishableMode = getStripeMode(publishableKey);
  const secretMode = getStripeMode(secretKey);

  printItem('Publishable mode', publishableMode ?? '(missing)');
  printItem('Secret mode', secretMode ?? '(missing)');

  if (!publishableKey || !secretKey || !monthlyPriceId || !yearlyPriceId) {
    console.log('Diagnosis: Stripe variables are incomplete.');
    return { ok: false };
  }

  if (publishableMode !== secretMode) {
    console.log('Diagnosis: Stripe publishable and secret keys are from different modes/accounts.');
    return { ok: false };
  }

  const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;

  async function fetchPrice(priceId) {
    return fetchJson(`https://api.stripe.com/v1/prices/${priceId}`, {
      headers: {
        Authorization: authHeader,
      },
    });
  }

  try {
    const [monthlyResult, yearlyResult] = await Promise.all([
      fetchPrice(monthlyPriceId),
      fetchPrice(yearlyPriceId),
    ]);

    printItem('Monthly price lookup', `${monthlyResult.status} ${monthlyResult.ok ? 'OK' : 'ERROR'}`);
    printItem('Yearly price lookup', `${yearlyResult.status} ${yearlyResult.ok ? 'OK' : 'ERROR'}`);

    if (monthlyResult.ok) {
      printItem(
        'Monthly interval',
        `${monthlyResult.body.recurring?.interval ?? 'unknown'} @ ${monthlyResult.body.unit_amount_decimal ?? 'unknown'}`
      );
    } else if (monthlyResult.body?.error?.message) {
      printItem('Monthly price error', monthlyResult.body.error.message);
    }

    if (yearlyResult.ok) {
      printItem(
        'Yearly interval',
        `${yearlyResult.body.recurring?.interval ?? 'unknown'} @ ${yearlyResult.body.unit_amount_decimal ?? 'unknown'}`
      );
    } else if (yearlyResult.body?.error?.message) {
      printItem('Yearly price error', yearlyResult.body.error.message);
    }

    if (!monthlyResult.ok || !yearlyResult.ok) {
      console.log('Diagnosis: One or more configured Stripe price IDs are invalid for the current secret key.');
      return { ok: false };
    }

    console.log('Diagnosis: Stripe keys and price IDs appear valid.');
    return { ok: true };
  } catch (error) {
    printItem('Network error', error instanceof Error ? error.message : String(error));
    return { ok: false };
  }
}

async function main() {
  const [envFile, envLocalFile] = await Promise.all(ENV_FILES.map(loadEnvFile));
  const env = { ...envFile, ...envLocalFile };

  printSection('Environment Sources');
  for (const file of ENV_FILES) {
    printItem(file, Object.keys(file === '.env' ? envFile : envLocalFile).length > 0 ? 'present' : 'missing/empty');
  }

  const keysToCompare = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID',
    'NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID',
    'STRIPE_SECRET_KEY',
  ];

  const mismatches = keysToCompare.filter(
    (key) => envFile[key] && envLocalFile[key] && envFile[key] !== envLocalFile[key]
  );

  if (mismatches.length > 0) {
    console.log(
      'Warning: .env and .env.local disagree for: ' +
      mismatches.join(', ') +
      '. Next.js will prefer .env.local.'
    );
  } else {
    console.log('No conflicting shared keys detected between .env and .env.local.');
  }

  const [supabaseResult, stripeResult] = await Promise.all([
    verifySupabase(env),
    verifyStripe(env),
  ]);

  printSection('Summary');
  if (supabaseResult.ok && stripeResult.ok) {
    console.log('All checked integrations look healthy.');
    process.exit(0);
  }

  console.log('One or more integration checks failed. Review the diagnoses above.');
  process.exit(1);
}

main().catch((error) => {
  console.error('Unexpected diagnostic failure:', error);
  process.exit(1);
});
