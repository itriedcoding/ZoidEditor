module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (action === 'device-code') {
    if (!clientId) return res.status(500).json({ error: 'GITHUB_CLIENT_ID not configured' });
    const r = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, scope: 'repo,user,read:org' }),
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  if (action === 'poll-token') {
    if (!clientId) return res.status(500).json({ error: 'GITHUB_CLIENT_ID not configured' });
    const { device_code } = req.body;
    if (!device_code) return res.status(400).json({ error: 'Missing device_code' });
    const tokenBody = { client_id: clientId, device_code, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' };
    if (clientSecret) tokenBody.client_secret = clientSecret;
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(tokenBody),
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  if (action === 'user') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    const r = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  if (action === 'repo-stats') {
    const r = await fetch('https://api.github.com/repos/itriedcoding/ZoidEditor', {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  if (action === 'releases') {
    const r = await fetch('https://api.github.com/repos/itriedcoding/ZoidEditor/releases', {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  res.status(400).json({ error: `Unknown action: ${action}` });
};
