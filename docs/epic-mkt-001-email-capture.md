# Epic MKT-001: Website Email Capture System

## Overview

Implement a zero-cost email capture system for launch notifications using Cloudflare Pages Functions and KV storage.

## Business Value

- Capture potential users before launch
- Build launch day audience
- Zero ongoing infrastructure cost
- Own the data (not dependent on third-party service)

## Technical Approach

Use Cloudflare's free tier:
- **Pages Functions:** Serverless endpoints (100K requests/day free)
- **KV Storage:** Key-value store (1K writes/day, 100K reads/day free)

No external dependencies. No recurring costs.

## Stories

| ID | Story | Estimate | Status |
|----|-------|----------|--------|
| MKT-001.1 | Create KV namespace and subscribe function | 30 min | TODO |
| MKT-001.2 | Form integration and UI feedback | 20 min | TODO |
| MKT-001.3 | Admin export endpoint | 15 min | TODO |

**Total Estimate:** ~1 hour

## Tech Spec

See: `docs/tech-spec-email-capture.md`

## Success Criteria

- [ ] Form submissions stored in Cloudflare KV
- [ ] User sees success/error feedback
- [ ] Admin can export CSV of all emails
- [ ] Zero cost at expected usage levels
- [ ] Works on all three pages (index, features, compare)

## Risks

| Risk | Mitigation |
|------|------------|
| Cloudflare changes free tier | Low risk; usage well below limits |
| Spam submissions | Rate limiting built into Cloudflare |
| Lost data | KV is durable; export regularly as backup |

## Definition of Done

- [ ] All three stories complete
- [ ] Tested on production site
- [ ] At least one test submission stored and exported
- [ ] Documentation updated
