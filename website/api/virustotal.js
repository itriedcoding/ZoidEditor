module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'VIRUSTOTAL_API_KEY not configured' });

  const hash = req.query.hash;
  if (!hash || !/^[0-9a-fA-F]{64}$/.test(hash)) {
    return res.status(400).json({ error: 'Invalid SHA-256 hash' });
  }

  try {
    const vtRes = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
      headers: { 'x-apikey': apiKey },
    });

    if (vtRes.status === 404) {
      return res.json({ hash, scanned: false, error: 'Not found' });
    }

    if (!vtRes.ok) {
      const err = await vtRes.json().catch(() => ({}));
      return res.status(vtRes.status).json({
        hash,
        scanned: false,
        error: err.error?.message || `VirusTotal API error: ${vtRes.status}`,
      });
    }

    const data = await vtRes.json();
    const attrs = data.data.attributes;
    const stats = attrs.last_analysis_stats;

    return res.json({
      hash,
      scanned: true,
      stats: {
        harmless: stats.harmless || 0,
        malicious: stats.malicious || 0,
        suspicious: stats.suspicious || 0,
        undetected: stats.undetected || 0,
        timeout: stats.timeout || 0,
      },
      total: (stats.harmless || 0) + (stats.malicious || 0) + (stats.suspicious || 0) + (stats.undetected || 0) + (stats.timeout || 0),
      lastAnalysisDate: attrs.last_analysis_date || null,
      meaningfulName: attrs.meaningful_name || null,
    });
  } catch (err) {
    return res.status(500).json({ hash, scanned: false, error: 'Failed to reach VirusTotal' });
  }
};
