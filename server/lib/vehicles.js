// server/routes/vehicles.js
const express = require('express');
const fetch = global.fetch || require('node-fetch');
const router = express.Router();

const logger = require('../../logs');
const User = require('../lib/user');
const database = require('./db');

// NOTE: your lib already has this; keep the exact export name you use today.
const { exhangeCodeForToken } = require('../lib/bouncie'); // (spelling preserved)

const BOUNCIE_API_BASE = 'https://api.bouncie.dev/v1';
const BOUNCIE_REDIRECT_URI =
  process.env.BOUNCIE_REDIRECT_URI ||
  'https://icontrol.raineyelectronics.com:7000/bouncieAuth/callback';

// ----------------- helpers -----------------
function tokenIsUsable(token, expiresAt) {
  if (!token) return false;
  if (!expiresAt) return true;
  try { return Date.now() < new Date(expiresAt).getTime() - 5_000; } catch { return true; }
}

function sanitizeToken(raw) {
  if (!raw) return null;
  let t = String(raw).trim();
  t = t.replace(/^"+|"+$/g, ''); // strip JSON quotes if any
  if (/^bearer /i.test(t)) t = t.slice(7);
  return t;
}

function decodeJwtPayload(jwt) {
  try {
    const parts = String(jwt).split('.');
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch { return null; }
}

async function fetchVehiclesWithToken(accessToken) {
    const resp = await fetch(`${BOUNCIE_API_BASE}/vehicles`, {
    method: 'GET',
    headers: {
        // IMPORTANT: Bouncie expects the raw token, NOT the "Bearer " scheme.
        'Authorization': accessToken,
        'Accept': 'application/json',
    },
});

  const www = resp.headers?.get?.('WWW-Authenticate');
  const text = await resp.text();
  logger.info(`[bouncie] resp=${resp.status} www-auth=${www || '(none)'} bodyLen=${text?.length ?? 0}`);

  if (!resp.ok) {
    const err = new Error(`Bouncie ${resp.status}`);
    err.status = resp.status;
    err.body = text;
    err.wwwAuthenticate = www;
    throw err;
  }

  try { return JSON.parse(text); }
  catch { throw new Error('Bouncie responded non-JSON: ' + text.slice(0, 500)); }
}

// ----------------- route -----------------
router.post('/getBouncieLocations', async (req, res) => {
  try {
    const user = await User.getUserById(database, req.session?.passport?.user);
    if (!user || !user.id) {
      logger.error('No user in session for getBouncieLocations');
      return res.status(401).json({ error: 'reauthorize_required', authorize: '/bouncieAuth' });
    }

    // 1) If we have a usable token, try it first.
    const currentToken = sanitizeToken(user.bouncieToken);
    if (tokenIsUsable(currentToken, user.bouncieExpiresAt)) {
      // helpful debugging: log token claims (no secrets)
      const claims = decodeJwtPayload(currentToken);
      if (claims) {
        logger.info(`Bouncie token claims aud=${claims.aud || 'n/a'} iss=${claims.iss || 'n/a'} scope=${claims.scope || claims.scp || 'n/a'} exp=${claims.exp || 'n/a'}`);
      }

      try {
        const data = await fetchVehiclesWithToken(currentToken);
        return res.json(data);
      } catch (e) {
        // If the token is rejected (401/403), fall through to re-exchange using saved portal code.
        if (e.status !== 401 && e.status !== 403) {
          logger.error(`getBouncieLocations failed: ${e.message} WWW-Authenticate: ${e.wwwAuthenticate || '(none)'} body: ${e.body || ''}`);
          return res.status(502).json({ error: 'bouncie_fetch_failed' });
        }
        logger.warn(`Bouncie token rejected (${e.status}). WWW-Authenticate: ${e.wwwAuthenticate || '(none)'}`);
      }
    }

    // 2) Try a one-time silent re-exchange using the *persisted* long Authorization Code from the Dev Portal.
    const code = (user.bouncieAuthCode || '').trim();
    if (code) {
      logger.info('Attempting silent token exchange via stored authorization code.');
      const exch = await exhangeCodeForToken(
        BOUNCIE_REDIRECT_URI,
        user.bouncieAuthCode
        );
      if (!exch || !exch.access_token) {
        logger.error('Bouncie token exchange returned no access_token.');
        return res.status(401).json({ error: 'reauthorize_required', authorize: '/bouncieAuth' });
      }

      const newTok = sanitizeToken(exch.access_token);
      const claims = decodeJwtPayload(newTok);
      if (claims) {
        logger.info(`Exchanged Bouncie token claims aud=${claims.aud || 'n/a'} iss=${claims.iss || 'n/a'} scope=${claims.scope || claims.scp || 'n/a'} exp=${claims.exp || 'n/a'}`);
      }

      // Retry the API once with the new token
      try {
        const data = await fetchVehiclesWithToken(newTok);
        return res.json(data);
      } catch (e2) {
        // Still rejected: tell client to reauthorize, do not loop.
        logger.warn(`Bouncie token rejected after exchange (${e2.status}). WWW-Authenticate: ${e2.wwwAuthenticate || '(none)'} body: ${e2.body || ''}`);
        return res.status(401).json({ error: 'reauthorize_required', authorize: '/bouncieAuth' });
      }
    }

    // 3) No token and no stored auth code → need interactive auth once.
    return res.status(401).json({ error: 'reauthorize_required', authorize: '/bouncieAuth' });

  } catch (err) {
    logger.error('getBouncieLocations failed:', err && err.stack ? err.stack : String(err));
    return res.status(502).json({ error: 'bouncie_fetch_failed' });
  }
});

module.exports = router;
