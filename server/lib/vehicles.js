// server/lib/vehicles.js
const fetch = global.fetch || require('node-fetch');
const router = require('express').Router();
const logger = require('../../logs');
const User = require('../lib/user');
const database = require('./db');
const { exhangeCodeForToken } = require('../lib/bouncie');

const BOUNCIE_API_BASE =
  (process.env.BOUNCIE_API && process.env.BOUNCIE_API.trim()) ||
  'https://api.bouncie.dev/v1';

const BOUNCIE_REDIRECT_URI =
  process.env.BOUNCIE_REDIRECT_URI ||
  'https://icontrol.raineyelectronics.com:7000/bouncieAuth/callback';


const LINXUP_HOST =
  (process.env.LINXUP_HOST && process.env.LINXUP_HOST.trim().replace(/\/+$/, ''))
const LINXUP_API_BASE = LINXUP_HOST + '/ibis/rest/api/v2';

function sanitizeToken(raw) {
  if (!raw) return null;
  var t = String(raw).trim();
  t = t.replace(/^"+|"+$/g, '');
  if (/^bearer\s/i.test(t)) t = t.replace(/^bearer\s+/i, '');
  return t;
}

function tokenIsUsable(token, expiresAt) {
  if (!token) return false;
  if (!expiresAt) return true;
  var exp = new Date(expiresAt).getTime();
  if (isNaN(exp)) return true;
  return Date.now() < (exp - 5000);
}

function decodeJwtPayload(jwt) {
  try {
    var parts = String(jwt).split('.');
    if (parts.length < 2) return null;
    var b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    var json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (_) { return null; }
}

function getWwwAuthenticate(resp) {
  try {
    if (resp && resp.headers && typeof resp.headers.get === 'function') {
      return resp.headers.get('www-authenticate') || resp.headers.get('WWW-Authenticate') || null;
    }
  } catch (_) {}
  return null;
}

async function fetchVehiclesWithToken(accessToken) {
  var token = sanitizeToken(accessToken);
  if (!token) throw new Error('No Bouncie access token');

  var url = BOUNCIE_API_BASE + '/vehicles';
  logger.info('[bouncie] GET ' + url);

  var resp = await fetch(url, {
    method: 'GET',
    headers: {
      // Bouncie expects the raw token (no "Bearer " prefix)
      Authorization: token,
      Accept: 'application/json'
    }
  });

  var www = getWwwAuthenticate(resp);
  var text = await resp.text();
  logger.info('[bouncie] resp=' + resp.status + ' www-auth=' + (www || '(none)') + ' bodyLen=' + (text ? text.length : 0));

  if (!resp.ok) {
    var err = new Error('Bouncie ' + resp.status);
    err.status = resp.status;
    err.body = text;
    err.wwwAuthenticate = www;
    throw err;
  }

  var json;
  try { json = JSON.parse(text); }
  catch (_) {
    logger.error('[bouncie] non-JSON body: ' + (text ? text.slice(0,200) : ''));
    throw new Error('Bouncie responded non-JSON');
  }
  return json;
}

router.post('/getBouncieLocations', async (req, res) => {
  try {
    var sessUserId = req.session && req.session.passport && req.session.passport.user;
    var user = await User.getUserById(database, sessUserId);
    if (!user || !user.id) {
      return res.status(401).json({ error: 'reauthorize_required', authorize: '/bouncieAuth' });
    }

    // 1) Try current token
    if (tokenIsUsable(user.bouncieToken, user.bouncieExpiresAt)) {
      try {
        var data1 = await fetchVehiclesWithToken(user.bouncieToken);
        logger.info('[bouncie] returning vehicles=' + (Array.isArray(data1) ? data1.length : (Array.isArray(data1 && data1.data) ? data1.data.length : 'n/a')));
        return res.json(data1);
      } catch (e) {
        if (e.status !== 401 && e.status !== 403) {
          logger.error('getBouncieLocations failed: ' + e.message + ' WWW-Authenticate: ' + (e.wwwAuthenticate || '(none)'));
          return res.status(502).json({ error: 'bouncie_fetch_failed' });
        }
        logger.warn('Bouncie token rejected (' + e.status + '). WWW-Authenticate: ' + (e.wwwAuthenticate || '(none)'));
      }
    }

    // 2) Silent exchange using stored Authorization Code
    var code = (user.bouncieAuthCode || '').trim();
    if (code) {
      logger.info('Attempting silent token exchange via stored authorization code.');
      var exch = await exhangeCodeForToken(BOUNCIE_REDIRECT_URI, code);
      if (!exch || !exch.access_token) {
        logger.error('Bouncie token exchange returned no access_token: ' + JSON.stringify(exch));
        return res.status(401).json({ error: 'reauthorize_required', authorize: '/bouncieAuth' });
      }

      var newTok = sanitizeToken(exch.access_token);
      var claims = decodeJwtPayload(newTok) || {};
      logger.info('Exchanged token exp=' + (claims.exp || 'n/a'));

      try {
        await User.updateUserBouncie(database, code, newTok, exch.expires_in, user.id);
      } catch (persistErr) {
        logger.warn('Could not persist new Bouncie token: ' + persistErr);
      }

      var data2 = await fetchVehiclesWithToken(newTok);
      logger.info('[bouncie] returning vehicles after exchange=' + (Array.isArray(data2) ? data2.length : (Array.isArray(data2 && data2.data) ? data2.data.length : 'n/a')));
      return res.json(data2);
    }

    // 3) Need interactive auth
    return res.status(401).json({ error: 'reauthorize_required', authorize: '/bouncieAuth' });

  } catch (err) {
    logger.error('getBouncieLocations failed: ' + (err && err.stack ? err.stack : String(err)));
    return res.status(502).json({ error: 'bouncie_fetch_failed' });
  }
});

router.post('/getLinxupLocations', async (req, res) => {
  try {
    // Ensure user is logged in (same pattern you use elsewhere)
    var sessUserId = req.session && req.session.passport && req.session.passport.user;
    var user = await User.getUserById(database, sessUserId);
    if (!user || !user.id) {
      return res.status(401).json({ error: 'login_required' });
    }

    // Get token (prefer DB per-user; fallback to env)
    var token = (user.linxupApiToken || process.env.LINXUP_API_TOKEN || '').trim();
    if (!token) {
      logger.error('[linxup] missing API token');
      return res.status(400).json({ error: 'linxup_token_missing' });
    }

    var url = LINXUP_API_BASE + '/locations';
    logger.info('[linxup] POST ' + url);

    // Linxup expects Bearer <token> in the Authorization header
    // (their Swagger says enter "Bearer <token>" when authorizing).
    // Body can be empty JSON for "all locations".
    var resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    var text = await resp.text();
    if (!resp.ok) {
      logger.error('[linxup] ' + resp.status + ' ' + (text ? text.slice(0,200) : ''));
      return res.status(resp.status).send(text || '');
    }

    var json;
    try { json = JSON.parse(text); }
    catch (_) {
      logger.error('[linxup] non-JSON body: ' + (text ? text.slice(0,200) : ''));
      return res.status(502).json({ error: 'linxup_non_json' });
    }

    // (Optional) tiny summary log
    var count = (json && json.data && json.data.locations && json.data.locations.length) ? json.data.locations.length : 0;
    logger.info('[linxup] locations=' + count);

    return res.json(json);
  } catch (err) {
    logger.error('getLinxupLocations failed: ' + (err && err.stack ? err.stack : String(err)));
    return res.status(502).json({ error: 'linxup_fetch_failed' });
  }
});

module.exports = router;
