#!/usr/bin/env node
/**
 * search_serenity.mjs — fetch what Serenity (@aleabitoreddit) says about a ticker / topic
 * via the official X API v2 full-archive search.
 *
 * Credentials are read ONLY from environment variables (never hardcoded):
 *   X_CONSUMER_KEY     — X app consumer key
 *   X_CONSUMER_SECRET  — X app consumer secret
 * (Optional) X_BEARER_TOKEN — if set, used directly and key/secret are not needed.
 *
 * Usage:
 *   X_CONSUMER_KEY=... X_CONSUMER_SECRET=... node search_serenity.mjs "$AXTI"
 *   node search_serenity.mjs "CPO" --since 2026-01-01 --max 50
 *
 * Requires X API access with full-archive search (Pro/Enterprise). Falls back to
 * recent search if full-archive returns 403.
 */

const USER = 'aleabitoreddit';

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const query = process.argv.slice(2).find((a) => !a.startsWith('--')) || '';
const since = arg('--since', '2025-07-01');
const max = parseInt(arg('--max', '30'), 10);

if (!query) {
  console.error('Usage: node search_serenity.mjs "$TICKER or keyword" [--since YYYY-MM-DD] [--max N]');
  process.exit(1);
}

async function getBearer() {
  if (process.env.X_BEARER_TOKEN) return process.env.X_BEARER_TOKEN.trim();
  const ck = process.env.X_CONSUMER_KEY?.trim();
  const cs = process.env.X_CONSUMER_SECRET?.trim();
  if (!ck || !cs) {
    console.error('ERROR: set X_CONSUMER_KEY and X_CONSUMER_SECRET (or X_BEARER_TOKEN). See README.');
    process.exit(1);
  }
  const creds = Buffer.from(`${encodeURIComponent(ck)}:${encodeURIComponent(cs)}`).toString('base64');
  const res = await fetch('https://api.x.com/oauth2/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json().catch(() => ({}));
  if (!data.access_token) {
    console.error('ERROR: failed to obtain bearer token:', JSON.stringify(data).slice(0, 200));
    process.exit(1);
  }
  return data.access_token;
}

async function search(bearer, endpoint) {
  const q = encodeURIComponent(`from:${USER} ${query}`);
  let url = `https://api.x.com/2/tweets/search/${endpoint}?query=${q}`
    + `&max_results=${Math.min(max, 100)}&tweet.fields=created_at,public_metrics,lang`;
  if (endpoint === 'all') url += `&start_time=${since}T00:00:00Z`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

function fmt(t) {
  const m = t.public_metrics || {};
  const eng = `❤${m.like_count || 0} 🔁${m.retweet_count || 0} 👁${m.impression_count || 0}`;
  return `[${(t.created_at || '').slice(0, 10)}] (${t.lang}) ${eng}\n${(t.text || '').trim()}\n`;
}

const bearer = await getBearer();
let { status, data } = await search(bearer, 'all');
if (status === 403) {
  console.error('(full-archive not available on this tier, falling back to recent 7-day search)');
  ({ status, data } = await search(bearer, 'recent'));
}
if (status !== 200) {
  console.error(`ERROR HTTP ${status}: ${JSON.stringify(data).slice(0, 200)}`);
  process.exit(1);
}
const tweets = data.data || [];
if (!tweets.length) {
  console.log(`No tweets from @${USER} matching "${query}".`);
  process.exit(0);
}
console.log(`# @${USER} on "${query}" — ${tweets.length} result(s)\n`);
for (const t of tweets) console.log(fmt(t) + '\n---');
