/**
 * Cloudflare Worker: Language Auto-Redirect
 *
 * Detects browser language via Accept-Language header and redirects
 * first-time visitors to their language subdirectory.
 *
 * Behavior:
 * - Only triggers on root path (/) or /index.html
 * - Checks for lang_pref cookie first (user already chose)
 * - Falls back to Accept-Language header detection
 * - Sets a 1-year cookie so redirect only happens once
 * - Supported: en (default), de, pt, nl, es
 *
 * Deploy: wrangler deploy --name sorting-history-lang-redirect
 * Route: sortinghistory.com/*
 */

const SUPPORTED_LANGS = ['de', 'pt', 'nl', 'es'];

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Only auto-redirect on root path
    if (url.pathname !== '/' && url.pathname !== '/index.html') {
      return fetch(request);
    }

    // Check for existing language preference cookie
    const cookies = request.headers.get('Cookie') || '';
    const langMatch = cookies.match(/lang_pref=(\w+)/);

    if (langMatch) {
      const lang = langMatch[1];
      if (SUPPORTED_LANGS.includes(lang)) {
        return Response.redirect(`${url.origin}/${lang}/`, 302);
      }
      // lang_pref=en or unknown — serve English (default)
      return fetch(request);
    }

    // Detect language from Accept-Language header
    const acceptLang = request.headers.get('Accept-Language') || '';
    const detected = detectLanguage(acceptLang);

    if (detected) {
      // Set cookie and redirect to detected language
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${url.origin}/${detected}/`,
          'Set-Cookie': `lang_pref=${detected}; path=/; max-age=31536000; SameSite=Lax`,
        },
      });
    }

    // English or unrecognized — set cookie to prevent re-detection, serve default
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);
    newResponse.headers.append(
      'Set-Cookie',
      'lang_pref=en; path=/; max-age=31536000; SameSite=Lax'
    );
    return newResponse;
  },
};

/**
 * Parse Accept-Language header and return first supported language.
 * Returns null if no supported language found (defaults to English).
 */
function detectLanguage(acceptLang) {
  const langs = acceptLang
    .split(',')
    .map((entry) => {
      const [lang, qStr] = entry.trim().split(';q=');
      return {
        lang: lang.split('-')[0].toLowerCase(),
        q: qStr ? parseFloat(qStr) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of langs) {
    if (SUPPORTED_LANGS.includes(lang)) {
      return lang;
    }
  }

  return null;
}
