export async function onRequestGet(context) {
  const { request, env } = context;

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
          } catch {
            // skip unparseable entries
          }
        }
      }

      cursor = list.list_complete ? null : list.cursor;
    } while (cursor);

    const csv = generateCSV(emails);

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

function generateCSV(emails) {
  const headers = ['email', 'timestamp', 'source'];
  const rows = emails.map((e) =>
    [escapeCSV(e.email), escapeCSV(e.timestamp), escapeCSV(e.source)].join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
