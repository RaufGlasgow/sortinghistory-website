export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toLowerCase().trim();

    if (!email || !isValidEmail(email)) {
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

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
