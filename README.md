# Housing Unit Inspection Report

A mobile-first, offline-capable inspection tool for Housing Choice Voucher (HCV) and general housing unit inspections. Built as a single-file HTML app with no dependencies or build pipeline.

**Live app:** https://robvilla14.github.io/hqs-inspection-tool/

---

## Features

- **Full HQS inspection form** — Living Room, Kitchen, Bedrooms, Bathrooms, Other Areas, Sections 6–8, Egress & Fire Safety, Special Amenities
- **Bedroom-specific checklist** — AFCI (arc-fault), egress window compliance, closet requirement; separate from Other Areas (GFCI)
- **Per-item photos** — camera capture on mobile, file picker on desktop; stored as base64
- **Copy Forward** — carry property address, owner/PM info, and building sections (6, 7, selected 8) across multiple units at the same complex
- **Print report** — clean PDF-ready layout with failed items summary, photo documentation appendix, inspector notes, and signature page
- **Data management** — JSON export/import/backup, storage meter, per-inspection delete
- **Works offline** — no network required after first load; data stored in browser localStorage

---

## Deploying an Update

1. Make changes to `index.html`
2. Go to the repo on GitHub: https://github.com/robvilla14/hqs-inspection-tool
3. Click `index.html` → pencil icon (Edit) → paste updated file content → **Commit changes**
4. GitHub Pages auto-deploys in ~1 minute
5. Hard-refresh the browser (`Ctrl+Shift+R` / `Cmd+Shift+R`) to clear cache

> **Important:** Always access the app via the GitHub Pages URL above — not as a local file. localStorage data is tied to the URL origin. Opening `index.html` directly from your desktop creates a separate storage context.

---

## Data Storage

All inspection data is stored in **browser localStorage** under the key `hqs_v2`. This means:

- Data is device and browser specific — it does not sync across devices
- Clearing browser data will erase inspections — use **Backup All** (JSON export) regularly
- The 5MB localStorage quota supports approximately 50–100 inspections depending on photo count

### Backup recommended before:
- Updating the app
- Clearing browser cache
- Switching devices

---

## Print Tips

When printing a report:

1. In the print dialog, uncheck **"Headers and footers"** (Chrome/Edge: More settings → Headers and footers; Safari: Show Details → Print headers and footers)
2. This removes the browser-generated URL and timestamp from each page
3. Page numbers are printed by the report itself and will remain

---

## Tech Notes

- **No build pipeline** — single `index.html`, plain JS, system fonts only
- **WebKit compatibility** — `CSS.escape()` replaced with regex key sanitization; Google Fonts removed to prevent spinner on local file loads
- **Photo storage** — images resized to max 800px / JPEG 75% before base64 encoding to manage localStorage quota
- **SaaS migration path** — only `getAll()` and `saveAll()` functions need to change; entire UI is backend-agnostic

---

## License

Copyright © 2026 Labor Compliance Solutions. All rights reserved.  
Not licensed for redistribution or commercial use without permission.
