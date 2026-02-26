# Website Translation Specification

**Created:** 2026-02-26
**Status:** Infrastructure ready, content translation pending

---

## Overview

The sortinghistory.com website serves 5 language versions via subdirectories with automatic language detection. This spec defines what needs translation, how it differs from in-app translation, and the quality standards for each content type.

## Architecture

```
sortinghistory.com/           → English (default, x-default)
sortinghistory.com/de/        → German
sortinghistory.com/pt/        → Portuguese (European)
sortinghistory.com/nl/        → Dutch
sortinghistory.com/es/        → Spanish (Latin American, es-419)
```

**Auto-detection:** Cloudflare Worker reads `Accept-Language` header, sets `lang_pref` cookie, redirects first-time visitors. Manual override via language picker in nav.

**SEO:** Each page has `hreflang` tags pointing to all language variants + `x-default` pointing to English.

---

## Pages Requiring Translation

### Priority 1 — Launch critical
| Page | File | Content type |
|------|------|-------------|
| Landing page | `index.html` | Marketing copy, SEO metadata, structured data |
| About | `about.html` | Brand story, team info |
| Features | `features.html` | Feature descriptions, comparisons |
| Support | `support.html` | Help content, contact info |

### Priority 2 — Pre-launch
| Page | File | Content type |
|------|------|-------------|
| Privacy Policy | `privacy.html` | Legal — may need jurisdiction notes |
| Terms of Service | `terms.html` | Legal — may need jurisdiction notes |

### Priority 3 — Post-launch (staggered)
| Page | File | Content type |
|------|------|-------------|
| Compare: Timeline | `compare/timeline-board-game.html` | Competitor comparison |
| Compare: Trivia Crack | `compare/trivia-crack.html` | Competitor comparison |
| Compare: Best Apps | `compare/best-history-trivia-apps.html` | Roundup article |
| Compare: Landing | `compare/index.html` | Comparison hub |

---

## Translation Requirements by Content Type

### 1. Marketing Copy (hero, features, plans, CTAs)

**NOT a word-for-word translation.** This is transcreation — the message and emotional impact must be equivalent, not the literal words.

| Concern | Guidance |
|---------|----------|
| Tone | Informal, approachable. DE: use "du" not "Sie". ES-419: use "tú" not "usted" for general copy. PT: use "tu" (European Portuguese). NL: use "je". |
| Idioms | Replace English idioms with natural equivalents. Don't translate "game night" literally if the concept doesn't exist in the culture. |
| Competitive references | Timeline board game, Trivia Crack, Chronology — check if these products have localized names in each market. Use the name users would search for. |
| CTAs | "Notify Me" should use the most natural imperative form per language. |
| Value props | The pain points may differ by market. "Trivia apps are too shallow" resonates universally, but "good for homeschooling" may be less relevant in markets with different education systems. |

### 2. SEO Metadata (title, description, OG tags, Twitter cards)

Each language page needs **independently optimized** SEO metadata:

| Element | Requirement |
|---------|-------------|
| `<title>` | Localized, includes primary keywords users would search for in that language. Not a translation of the English title. |
| `meta description` | Localized, 150-160 chars, includes CTA. Optimized for the search terms people actually use in that language. |
| `og:title` / `og:description` | Match the localized title/description. These appear when the URL is shared on social media. |
| `twitter:title` / `twitter:description` | Same as OG. |

**Example:** The English title is "Sorting History - The Best History Trivia Game for iOS". In German, users search for "Geschichtsquiz" or "Geschichte Quiz Spiel", not a direct translation of "History Trivia Game". The German title should target those keywords.

### 3. Structured Data (schema.org JSON-LD)

Each language page needs localized structured data:

| Schema | What to localize |
|--------|-----------------|
| `MobileApplication` | `description`, `featureList` entries |
| `FAQPage` | All `Question.name` and `Answer.text` values |
| `MobileApplication.inLanguage` | Set to page language code |

**Critical:** FAQ structured data directly powers Google's FAQ rich snippets. These must be natural-sounding questions in each language, not translated English questions.

### 4. Legal Pages (Privacy, Terms)

| Concern | Guidance |
|---------|----------|
| GDPR | Already covered in English version. All EU language versions (DE, PT, NL) inherit the same GDPR framework. |
| Jurisdiction | Add a note if the governing law section needs localization (current: "laws of the State of New York"). This may need country-specific legal review. |
| Cookie consent | If required for specific markets, add localized cookie banner. |
| Translation quality | Legal text requires higher accuracy than marketing copy. Don't transcreate — translate precisely. |

### 5. Comparison & Blog Content

| Concern | Guidance |
|---------|----------|
| Competitor names | Use localized App Store names if different |
| Competitor descriptions | Re-research competitor reviews in each language's App Store. German users may have different complaints than English users. |
| Cultural references | A comparison that references "family game night" may need cultural adaptation per market |

---

## Date & Number Formats

| Language | Date Format | Example |
|----------|-------------|---------|
| EN | Month YYYY | March 2026 |
| DE | Monat YYYY | März 2026 |
| PT | mês de YYYY | março de 2026 |
| NL | maand YYYY | maart 2026 |
| ES-419 | mes de YYYY | marzo de 2026 |

---

## Per-Language Editorial Angles

Each language page can emphasize different aspects:

| Language | Special angle | Why |
|----------|--------------|-----|
| DE | German History category at launch | The game has a category about their history |
| PT | Portuguese History category at launch | Same — direct relevance |
| NL | Dutch History coming in April | First post-launch category, paired with NL language |
| ES-419 | South American History coming in May | Paired with Spanish language launch |

The "Coming in April" / "Coming Next" teaser section should be customized per language page to highlight what's most relevant to that audience.

---

## Language Picker Behavior

- Picker appears in nav on all pages: `EN | DE | PT | NL | ES`
- Active language is highlighted in orange
- Clicking a language sets `lang_pref` cookie and navigates to that subdirectory
- Language picker links on translated pages should point to the equivalent translated page (e.g., DE about page → PT about page), not always to the index

---

## File Naming Convention

```
/de/index.html          — German landing page
/de/about.html          — German about page
/de/features.html       — German features page
/de/support.html        — German support page
/de/privacy.html        — German privacy policy
/de/terms.html          — German terms of service
/de/compare/index.html  — German comparison hub
```

Same pattern for /pt/, /nl/, /es/.

All translated pages use absolute paths for shared assets: `/styles.css`, `/images/`, `/scripts/`.

---

## Quality Checklist (Per Page, Per Language)

- [ ] All visible text translated
- [ ] SEO metadata independently optimized (not just translated)
- [ ] Structured data (JSON-LD) translated
- [ ] hreflang tags present and correct
- [ ] Language picker shows correct active language
- [ ] Date formats localized
- [ ] "Coming in April" teaser customized for this audience
- [ ] CTA buttons use natural imperative form
- [ ] No English remnants in visible text
- [ ] Footer links translated
- [ ] Legal page links point to translated versions (when available) or English fallback
- [ ] All image alt text translated
- [ ] Form placeholder text translated ("your@email.com" is universal)
- [ ] Notify form privacy note translated

---

## What This Spec Does NOT Cover

- In-app UI string translation (handled by `.claude/agents/translation/`)
- Game content translation (handled by translation pipeline)
- App Store listing translation (separate spec needed — Apple has specific requirements)
- Video/short-form content localization

---

## Deployment

1. Translated HTML files go in their subdirectory (`/de/`, `/pt/`, etc.)
2. Deploy via `wrangler pages deploy` (same as English site)
3. Language redirect Worker: `website/workers/language-redirect.js`
   - Deploy: `wrangler deploy --name sorting-history-lang-redirect`
   - Route: `sortinghistory.com/*`
4. Test: Clear cookies, set browser language to DE, visit sortinghistory.com → should redirect to /de/
