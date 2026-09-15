# Anchanto RFP Survey — V1

Functional prototype for a guided 3PL WMS + OXM discovery workflow.

## Included
- Anchanto-inspired red/white UI
- Discovery dashboard
- Customer/contact information
- 8-stage guided survey + Review
- Conditional questions
- Auto-save in browser Local Storage
- Save & Exit / Resume
- Edit any completed section
- Draft / Completed status
- Excel-compatible `.xls` export

## Current prototype scope
V1 is focused on 3PL customers using WMS + OXM. Data is stored locally in the browser for prototype testing. A backend/auth layer can be added later for cross-device persistence and team access.


## Analytics
Google Analytics 4 is enabled with Measurement ID `G-9D9JR46ZMV`.

Tracked events:
- `discovery_started`
- `stage_completed`
- `discovery_completed`
- `excel_downloaded`

No customer names, company names, email addresses, mobile numbers, or free-text discovery answers are intentionally sent as event parameters.
