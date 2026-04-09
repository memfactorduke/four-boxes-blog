import { getStore } from '@netlify/blobs';

export default async function handler(req) {
  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
  };

  try {
    // Fetch GoatCounter analytics
    let gcStats = { totalViews: 0, totalVisitors: 0, topPages: [], dailyViews: [] };
    const gcToken = process.env.GOATCOUNTER_API_KEY;
    if (gcToken) {
      try {
        const gcHeaders = { 'Authorization': `Bearer ${gcToken}` };
        const [totalResp, hitsResp] = await Promise.all([
          fetch('https://memfactor.goatcounter.com/api/v0/stats/total', { headers: gcHeaders }),
          fetch('https://memfactor.goatcounter.com/api/v0/stats/hits?limit=10', { headers: gcHeaders }),
        ]);
        if (totalResp.ok) {
          const total = await totalResp.json();
          gcStats.totalViews = total.total || 0;
          gcStats.totalVisitors = total.total_unique || 0;
          // Extract daily view data for sparkline
          gcStats.dailyViews = (total.stats || []).map(s => s.daily || 0);
        }
        if (hitsResp.ok) {
          const hits = await hitsResp.json();
          gcStats.topPages = (hits.hits || []).slice(0, 10).map(p => ({
            path: p.path,
            count: p.count || 0,
          }));
        }
      } catch (err) {
        console.warn('GoatCounter API error:', err.message);
      }
    }

    // Load API usage data
    const store = getStore('api-usage');
    const { blobs } = await store.list();
    const days = [];
    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: 'json' });
      if (data) days.push(data);
    }
    days.sort((a, b) => b.date.localeCompare(a.date));

    const totals = days.reduce((acc, d) => ({
      requests: acc.requests + d.requests,
      grok_input_tokens: acc.grok_input_tokens + d.grok_input_tokens,
      grok_output_tokens: acc.grok_output_tokens + d.grok_output_tokens,
      perplexity_calls: acc.perplexity_calls + d.perplexity_calls,
      voyage_calls: acc.voyage_calls + d.voyage_calls,
      est_cost_cents: acc.est_cost_cents + d.est_cost_cents,
      total_duration_ms: acc.total_duration_ms + d.total_duration_ms,
    }), { requests: 0, grok_input_tokens: 0, grok_output_tokens: 0, perplexity_calls: 0, voyage_calls: 0, est_cost_cents: 0, total_duration_ms: 0 });

    const avgDuration = totals.requests > 0 ? Math.round(totals.total_duration_ms / totals.requests) : 0;
    const today = days.find(d => d.date === new Date().toISOString().slice(0, 10));

    // Sparkline SVG generator
    function sparkline(data, w = 200, h = 40) {
      if (!data.length || data.every(v => v === 0)) return '';
      const max = Math.max(...data) || 1;
      const step = w / Math.max(data.length - 1, 1);
      const points = data.map((v, i) => `${i * step},${h - (v / max) * h * 0.85}`).join(' ');
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block"><polyline points="${points}" fill="none" stroke="#c8a55a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dashboard — The Four Boxes Diner</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', -apple-system, sans-serif; background: #0a1221; color: #c9cdd4; min-height: 100vh; }

  /* Layout */
  .container { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem; }
  .header h1 { font-family: 'Playfair Display', serif; color: #fff; font-size: 1.6rem; }
  .header h1 span { color: #c8a55a; }
  .timestamp { font-size: 0.75rem; color: #4b5563; background: #111b2e; padding: 0.4rem 0.8rem; border-radius: 8px; }

  /* Section headers */
  .section-header { display: flex; align-items: center; gap: 0.6rem; margin: 2.5rem 0 1.25rem; }
  .section-header h2 { font-size: 0.85rem; font-weight: 600; color: #c8a55a; text-transform: uppercase; letter-spacing: 0.12em; }
  .section-header .line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(200,165,90,0.3), transparent); }
  .section-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; }
  .icon-analytics { background: rgba(59,130,246,0.15); color: #60a5fa; }
  .icon-bot { background: rgba(200,165,90,0.15); color: #c8a55a; }
  .icon-cost { background: rgba(16,185,129,0.15); color: #34d399; }

  /* Cards grid */
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 0.75rem; }
  .card { background: linear-gradient(135deg, #111b2e 0%, #0f1729 100%); border-radius: 14px; padding: 1.25rem; border: 1px solid rgba(255,255,255,0.06); position: relative; overflow: hidden; transition: border-color 0.2s; }
  .card:hover { border-color: rgba(200,165,90,0.2); }
  .card-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 0.6rem; font-weight: 600; }
  .card-value { font-size: 1.7rem; font-weight: 700; color: #fff; line-height: 1; }
  .card-value.gold { color: #c8a55a; }
  .card-value.green { color: #34d399; }
  .card-value.blue { color: #60a5fa; }
  .card-sub { font-size: 0.7rem; color: #4b5563; margin-top: 0.35rem; }
  .card-sparkline { position: absolute; bottom: 0; right: 0; opacity: 0.4; }
  .card-wide { grid-column: span 2; }

  /* Tables */
  .table-wrap { background: #111b2e; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 0.75rem 1rem; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: #4b5563; font-weight: 600; background: rgba(0,0,0,0.2); }
  td { padding: 0.65rem 1rem; font-size: 0.82rem; border-top: 1px solid rgba(255,255,255,0.04); }
  tr:hover td { background: rgba(200,165,90,0.03); }
  .cost { color: #34d399; font-weight: 600; font-variant-numeric: tabular-nums; }
  .mono { font-variant-numeric: tabular-nums; }
  .dim { color: #4b5563; }
  .pill { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.7rem; font-weight: 600; }
  .pill-gold { background: rgba(200,165,90,0.15); color: #c8a55a; }
  .pill-blue { background: rgba(59,130,246,0.15); color: #60a5fa; }
  .pill-green { background: rgba(16,185,129,0.15); color: #34d399; }

  /* Today highlight */
  .today-row td { background: rgba(200,165,90,0.06); }
  .today-badge { font-size: 0.6rem; background: #c8a55a; color: #0a1221; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 700; margin-left: 0.4rem; vertical-align: middle; }

  /* Empty state */
  .empty { text-align: center; padding: 3rem 1rem; color: #4b5563; }
  .empty-icon { font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.5; }
  .empty p { font-size: 0.85rem; }

  /* Status indicators */
  .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; margin-top: 1.25rem; }
  .status-item { display: flex; align-items: center; gap: 0.6rem; background: #111b2e; border-radius: 10px; padding: 0.7rem 1rem; border: 1px solid rgba(255,255,255,0.04); }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; }
  .dot-green { background: #34d399; box-shadow: 0 0 6px rgba(52,211,153,0.4); }
  .dot-yellow { background: #fbbf24; box-shadow: 0 0 6px rgba(251,191,36,0.4); }
  .dot-gray { background: #4b5563; }
  .status-label { font-size: 0.78rem; color: #9ca3af; }
  .status-label strong { color: #e5e7eb; font-weight: 600; }

  @media (max-width: 640px) {
    .cards { grid-template-columns: repeat(2, 1fr); }
    .card-wide { grid-column: span 2; }
    .card-value { font-size: 1.4rem; }
    .container { padding: 1.25rem 1rem 3rem; }
  }
</style>
</head>
<body>
<div class="container">

  <div class="header">
    <h1><span>4B</span> Dashboard</h1>
    <div class="timestamp">${new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
  </div>

  <!-- Service Status -->
  <div class="status-grid">
    <div class="status-item">
      <div class="status-dot dot-green"></div>
      <div class="status-label"><strong>Grok API</strong> — Active</div>
    </div>
    <div class="status-item">
      <div class="status-dot ${gcToken ? 'dot-green' : 'dot-gray'}"></div>
      <div class="status-label"><strong>GoatCounter</strong> — ${gcToken ? 'Connected' : 'No API key'}</div>
    </div>
    <div class="status-item">
      <div class="status-dot ${process.env.PERPLEXITY_API_KEY ? 'dot-green' : 'dot-yellow'}"></div>
      <div class="status-label"><strong>Perplexity</strong> — ${process.env.PERPLEXITY_API_KEY ? 'Active' : 'Not configured'}</div>
    </div>
    <div class="status-item">
      <div class="status-dot ${process.env.VOYAGE_API_KEY ? 'dot-green' : 'dot-yellow'}"></div>
      <div class="status-label"><strong>Voyage AI</strong> — ${process.env.VOYAGE_API_KEY ? 'Active' : 'Using TF-IDF fallback'}</div>
    </div>
  </div>

  <!-- Site Analytics -->
  <div class="section-header">
    <div class="section-icon icon-analytics">📊</div>
    <h2>Site Analytics</h2>
    <div class="line"></div>
  </div>

  <div class="cards">
    <div class="card">
      <div class="card-label">Pageviews</div>
      <div class="card-value blue">${gcStats.totalViews.toLocaleString()}</div>
      <div class="card-sub">All time</div>
      ${gcStats.dailyViews.length > 0 ? `<div class="card-sparkline">${sparkline(gcStats.dailyViews)}</div>` : ''}
    </div>
    <div class="card">
      <div class="card-label">Unique Visitors</div>
      <div class="card-value blue">${gcStats.totalVisitors.toLocaleString()}</div>
      <div class="card-sub">All time</div>
    </div>
  </div>

  ${gcStats.topPages.length > 0 ? `
  <div style="margin-top:1rem">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Top Pages</th><th style="text-align:right">Views</th></tr></thead>
        <tbody>
          ${gcStats.topPages.map(p => `<tr><td>${p.path}</td><td style="text-align:right" class="mono">${p.count}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>` : ''}

  <!-- Chatbot API Usage -->
  <div class="section-header">
    <div class="section-icon icon-bot">🤖</div>
    <h2>Professor 2A — Chatbot</h2>
    <div class="line"></div>
  </div>

  <div class="cards">
    <div class="card">
      <div class="card-label">Total Conversations</div>
      <div class="card-value gold">${totals.requests.toLocaleString()}</div>
      ${today ? `<div class="card-sub">${today.requests} today</div>` : ''}
    </div>
    <div class="card">
      <div class="card-label">Grok Tokens Used</div>
      <div class="card-value">${((totals.grok_input_tokens + totals.grok_output_tokens) / 1000).toFixed(1)}K</div>
      <div class="card-sub"><span class="pill pill-blue">${(totals.grok_input_tokens / 1000).toFixed(1)}K in</span> <span class="pill pill-gold">${(totals.grok_output_tokens / 1000).toFixed(1)}K out</span></div>
    </div>
    <div class="card">
      <div class="card-label">Web Searches</div>
      <div class="card-value">${totals.perplexity_calls.toLocaleString()}</div>
      <div class="card-sub">${totals.requests > 0 ? Math.round(totals.perplexity_calls / totals.requests * 100) : 0}% of conversations</div>
    </div>
    <div class="card">
      <div class="card-label">Avg Response</div>
      <div class="card-value">${avgDuration > 1000 ? (avgDuration / 1000).toFixed(1) + '<span style="font-size:0.9rem">s</span>' : avgDuration + '<span style="font-size:0.7rem">ms</span>'}</div>
    </div>
  </div>

  <!-- Costs -->
  <div class="section-header">
    <div class="section-icon icon-cost">💰</div>
    <h2>Estimated Costs</h2>
    <div class="line"></div>
  </div>

  <div class="cards">
    <div class="card">
      <div class="card-label">Total Spend</div>
      <div class="card-value green">$${(totals.est_cost_cents / 100).toFixed(2)}</div>
      <div class="card-sub">Since tracking started</div>
    </div>
    <div class="card">
      <div class="card-label">Cost per Chat</div>
      <div class="card-value green">${totals.requests > 0 ? '$' + (totals.est_cost_cents / totals.requests / 100).toFixed(4) : '—'}</div>
      <div class="card-sub">Average</div>
    </div>
    ${today ? `<div class="card">
      <div class="card-label">Today's Spend</div>
      <div class="card-value green">$${(today.est_cost_cents / 100).toFixed(3)}</div>
      <div class="card-sub">${today.requests} conversation${today.requests !== 1 ? 's' : ''}</div>
    </div>` : ''}
    <div class="card">
      <div class="card-label">Days Tracked</div>
      <div class="card-value">${days.length}</div>
    </div>
  </div>

  <!-- Daily Breakdown -->
  <div class="section-header">
    <div class="section-icon icon-bot">📅</div>
    <h2>Daily Breakdown</h2>
    <div class="line"></div>
  </div>

  <div class="table-wrap">
    ${days.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th style="text-align:right">Chats</th>
          <th style="text-align:right">Tokens</th>
          <th style="text-align:right">Searches</th>
          <th style="text-align:right">Avg Time</th>
          <th style="text-align:right">Cost</th>
        </tr>
      </thead>
      <tbody>
        ${days.map(d => {
          const isToday = d.date === new Date().toISOString().slice(0, 10);
          return `<tr class="${isToday ? 'today-row' : ''}">
            <td>${d.date}${isToday ? '<span class="today-badge">TODAY</span>' : ''}</td>
            <td style="text-align:right" class="mono">${d.requests}</td>
            <td style="text-align:right" class="mono">${((d.grok_input_tokens + d.grok_output_tokens) / 1000).toFixed(1)}K</td>
            <td style="text-align:right" class="mono">${d.perplexity_calls}</td>
            <td style="text-align:right" class="dim mono">${d.requests > 0 ? Math.round(d.total_duration_ms / d.requests) : 0}ms</td>
            <td style="text-align:right" class="cost">$${(d.est_cost_cents / 100).toFixed(3)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>` : `
    <div class="empty">
      <div class="empty-icon">💬</div>
      <p>No usage data yet.<br>Chat with Professor 2A to start tracking.</p>
    </div>`}
  </div>

</div>
</body>
</html>`;

    return new Response(html, { status: 200, headers });

  } catch (error) {
    console.error('Admin usage error:', error);
    return new Response(`Error: ${error.message}`, { status: 500, headers });
  }
}

export const config = {
  path: '/api/admin',
};
