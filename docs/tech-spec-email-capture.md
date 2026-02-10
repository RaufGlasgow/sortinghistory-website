# Tech Spec: Email Capture System

## Overview

Implement a serverless email capture system using Cloudflare Pages Functions and KV storage. Zero ongoing cost within Cloudflare's generous free tier.

## Architecture

```
[Website Form] → [Cloudflare Pages Function] → [Cloudflare KV Store]
                         ↓
                 [Email notification to owner]
```

## Components

### 1. Cloudflare KV Namespace
- **Name:** `LAUNCH_EMAILS`
- **Purpose:** Store captured email addresses
- **Schema:** Key = email address, Value = JSON metadata

```json
{
  "email": "user@example.com",
  "source": "features-page",
  "timestamp": "2026-02-10T15:30:00Z",
  "userAgent": "Mozilla/5.0...",
  "ip": "hashed"
}
```

### 2. Pages Function (`/functions/api/subscribe.js`)

Handles POST requests from the form:
1. Validate email format
2. Check for duplicates (optional)
3. Store in KV
4. Return success/error JSON
5. Optionally send notification email via Resend/Mailgun

### 3. HTML Form Updates

Replace Formspree placeholder with local API endpoint:

```html
<form action="/api/subscribe" method="POST" class="notify-form">
  <input type="email" name="email" required>
  <button type="submit">Notify Me</button>
</form>
```

### 4. Admin Export Function (`/functions/api/export-emails.js`)

Password-protected endpoint to export all emails as CSV:
- `GET /api/export-emails?key=SECRET_KEY`
- Returns CSV of all stored emails

## Free Tier Limits

| Resource | Free Limit | Our Expected Usage |
|----------|------------|-------------------|
| KV Reads | 100,000/day | ~100/day (admin checks) |
| KV Writes | 1,000/day | ~50/day (signups) |
| KV Storage | 1 GB | < 1 MB (email list) |
| Workers Requests | 100,000/day | ~100/day |

**Verdict:** Will never exceed free tier for pre-launch email capture.

## Implementation Steps

### Story 1: Create KV Namespace and Basic Function
1. Create `LAUNCH_EMAILS` KV namespace in Cloudflare dashboard
2. Bind KV to Pages project
3. Create `/functions/api/subscribe.js` with basic email storage
4. Test locally with `wrangler pages dev`

### Story 2: Form Integration and Validation
1. Update HTML forms to POST to `/api/subscribe`
2. Add client-side email validation
3. Add success/error UI feedback
4. Handle duplicate submissions gracefully

### Story 3: Admin Export and Notifications
1. Create `/functions/api/export-emails.js` with secret key auth
2. Add optional email notification on new signup (via Resend free tier)
3. Document how to export emails for launch announcement

## Security Considerations

1. **Rate limiting:** Cloudflare's built-in protection handles basic abuse
2. **Email validation:** Server-side regex + MX record check (optional)
3. **No PII beyond email:** Don't store names, only email + metadata
4. **Hashed IPs:** Store hashed IP for duplicate detection, not raw
5. **Export protection:** Secret key required for CSV export

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `functions/api/subscribe.js` | Create | Email capture endpoint |
| `functions/api/export-emails.js` | Create | Admin CSV export |
| `wrangler.toml` | Create | KV binding config |
| `index.html` | Modify | Update form action |
| `features.html` | Modify | Update form action |
| `compare/timeline-board-game.html` | Modify | Update form action |
| `styles.css` | Modify | Add form feedback styles |

## Testing Plan

1. Local: `wrangler pages dev` with KV preview
2. Staging: Deploy to preview URL, test real submissions
3. Production: Verify KV writes appear in dashboard

## Rollback Plan

If issues arise, revert forms to mailto links (functional but doesn't capture).

## Success Criteria

- [ ] Form submissions stored in KV
- [ ] No errors on submission
- [ ] CSV export works with secret key
- [ ] Zero cost at current usage levels
