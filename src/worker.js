export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/subscribe') {
      if (request.method === 'OPTIONS') return handleCORS();
      if (request.method === 'POST') return handleSubscribe(request, env);
      return new Response('Method not allowed', { status: 405 });
    }

    if (url.pathname === '/api/unsubscribe') {
      if (request.method === 'GET') return handleUnsubscribe(request, env);
      return new Response('Method not allowed', { status: 405 });
    }

    if (url.pathname === '/api/export-emails') {
      if (request.method === 'GET') return handleExport(request, env);
      return new Response('Method not allowed', { status: 405 });
    }

    return env.ASSETS.fetch(request);
  },
};

function handleCORS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function handleSubscribe(request, env) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email address',
      }), { status: 400, headers });
    }

    const metadata = {
      email,
      timestamp: new Date().toISOString(),
      source: request.headers.get('Referer') || 'direct',
      userAgent: request.headers.get('User-Agent') || 'unknown',
    };

    await env.LAUNCH_EMAILS.put(email, JSON.stringify(metadata));

    return new Response(JSON.stringify({
      success: true,
      message: "You'll be notified at launch!",
    }), { status: 200, headers });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Something went wrong. Please try again.',
    }), { status: 500, headers });
  }
}

async function handleUnsubscribe(request, env) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email')?.toLowerCase().trim();

  if (!email) {
    return new Response(unsubscribePage('Missing email address.', false), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    await env.LAUNCH_EMAILS.delete(email);
    return new Response(unsubscribePage('You have been unsubscribed. You will no longer receive emails from us.', true), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    return new Response(unsubscribePage('Something went wrong. Please try again later.', false), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

function unsubscribePage(message, success) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Unsubscribe — Sorting History</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1a1a2e; color: #e0e0e0; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
  .card { background: #16213e; border-radius: 12px; padding: 2rem; max-width: 400px; text-align: center; }
  .card h1 { font-size: 1.3rem; margin-bottom: 1rem; color: ${success ? '#4CAF50' : '#f44336'}; }
  .card p { line-height: 1.6; }
  .card a { color: #e07850; text-decoration: none; }
</style>
</head><body>
<div class="card">
  <h1>${success ? 'Unsubscribed' : 'Error'}</h1>
  <p>${message}</p>
  <p><a href="/">Back to Sorting History</a></p>
</div>
</body></html>`;
}

async function handleExport(request, env) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key || key !== env.EXPORT_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const emails = [];
    let cursor = null;

    do {
      const listOptions = cursor ? { cursor } : {};
      const list = await env.LAUNCH_EMAILS.list(listOptions);

      for (const entry of list.keys) {
        const value = await env.LAUNCH_EMAILS.get(entry.name);
        if (value) {
          try {
            emails.push(JSON.parse(value));
          } catch { /* skip unparseable */ }
        }
      }

      cursor = list.list_complete ? null : list.cursor;
    } while (cursor);

    const csvHeaders = ['email', 'timestamp', 'source'];
    const rows = emails.map((e) =>
      [escapeCSV(e.email), escapeCSV(e.timestamp), escapeCSV(e.source)].join(',')
    );
    const csv = [csvHeaders.join(','), ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="launch-emails.csv"',
      },
    });
  } catch (error) {
    return new Response('Export failed: ' + error.message, { status: 500 });
  }
}

function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
