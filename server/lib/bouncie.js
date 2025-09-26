const fetch = global.fetch || require('node-fetch');
const User = require('./user');
const logger = require('../../logs');

const AUTHORIZE_URL = 'https://auth.bouncie.com/dialog/authorize';
const TOKEN_URL     = 'https://auth.bouncie.com/oauth/token';

function buildRedirectUri(ROOT_URL) {
  if (!ROOT_URL) return (process.env.BOUNCIE_REDIRECT_URI ||
    'https://icontrol.raineyelectronics.com:7000/bouncieAuth/callback');
  return ROOT_URL.includes('/bouncieAuth/callback')
    ? ROOT_URL
    : (ROOT_URL.replace(/\/$/, '') + '/bouncieAuth/callback');
}

// helper used by vehicles.js
const exhangeCodeForToken = async (ROOT_URL, code) => {
  if (!code) { logger.error('Bouncie exchange: missing code'); return false; }
  const clientSecret = process.env.Bouncie_clientsecret;
  if (!clientSecret) { logger.error('Bouncie exchange: missing Bouncie_clientsecret'); return false; }

  const redirect_uri = buildRedirectUri(ROOT_URL);

  try {
    const resp = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: 'scheduling',
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,                       // the long-lived code from portal (or from callback)
        redirect_uri                // must match app settings in the portal
      }),
    });
    const text = await resp.text();
    const json = (() => { try { return JSON.parse(text); } catch { return null; } })();
    if (!resp.ok) { logger.error('Bouncie token exchange failed', resp.status, text); return json || false; }
    return json || false;   // { access_token, token_type: "bearer", expires_in: 3600 }
  } catch (e) {
    logger.error('Bouncie exchange exception:', e);
    return false;
  }
};

// keeps your two routes for manual auth when needed
function bouncie({ ROOT_URL, app, database }) {
  const redirectUri = buildRedirectUri(ROOT_URL);

  app.get('/bouncieAuth', (req, res) => {
    const url = `${AUTHORIZE_URL}?response_type=code&client_id=scheduling&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.redirect(url);
  });

  app.get('/bouncieAuth/callback', async (req, res) => {
    try {
      const code = req.query.code;
      const user_id = req.user && req.user.id;
      if (!code || !user_id) return res.redirect('/error?bouncie=missing_code_or_user');

      const exch = await exhangeCodeForToken(redirectUri, code);
      if (!exch || exch.error || !exch.access_token) return res.redirect('/error?bouncie=exchange_failed');

      try {
        await User.updateUserBouncie(database, code, exch.access_token, exch.expires_in, user_id);
      } catch (persistErr) {
        logger.error('Failed to update Bouncie token:', persistErr);
      }
      res.redirect('/scheduling/?bouncie=connected');
    } catch (e) {
      logger.error('Bouncie callback exception:', e);
      res.redirect('/error?bouncie=exception');
    }
  });
}

module.exports = { bouncie, exhangeCodeForToken };