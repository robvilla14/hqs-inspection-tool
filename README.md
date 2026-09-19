Replace the existing README with the following. It removes the obsolete single-file and browser-print information and documents the Phase 5 structure accurately.

# Housing Unit Inspection Report

A mobile-first inspection tool for Housing Choice Voucher (HCV) and general housing unit inspections.

The application uses locally hosted PDF, font, document-builder, and icon resources. It has no build pipeline, CDN, remote font, or external runtime-service dependency.

**Live app:** [https://robvilla14.github.io/hqs-inspection-tool/](https://robvilla14.github.io/hqs-inspection-tool/)

---

## Features

* **Full HQS inspection form** — Living Room, Kitchen, Bedrooms, Bathrooms, Other Areas, Sections 6–8, Egress & Fire Safety, and Special Amenities
* **Bedroom-specific checklist** — AFCI protection, egress-window compliance, and closet requirements separate from Other Areas
* **Structured property information** — address, City, State, ZIP, phone number, window material, and window type
* **Automatic result handling** — unresolved failed items automatically force an overall Fail result
* **Per-item photos** — camera capture on mobile and file selection on desktop
* **Copy Forward** — carries property, owner/property-management, request-date, and selected building information into a new unit inspection
* **Collapsible sections** — simplifies navigation through long inspections
* **Direct PDF generation** — creates a formatted report without using the browser print dialog
* **PDF report content** — failed-item summary, inspection tables, inspector notes, signatures, page numbering, and photo appendix
* **Appearance modes** — System, Light, and Dark
* **Local interface icons** — locally hosted SVG icon registry with graceful text fallback
* **Data management** — Backup All, Export One, Import, storage meter, and per-inspection deletion
* **Mobile export support** — compatible file-sharing and download behavior for supported mobile browsers
* **Local record storage** — inspection records remain in the browser under the `hqs_v2` localStorage key

---

## Application Files

The application requires the following production files and directories:

```text
hqs-inspection-tool/
├── index.html
├── build-hqs-doc.js
├── pdfmake.min.js
├── vfs_fonts.js
├── LICENSE-pdfmake.txt
├── README.md
└── lcs-icons/
    ├── lcs-icons.js
    ├── actions/
    ├── sections/
    ├── status/
    ├── utility/
    └── licenses/
```

File and directory names are case-sensitive when deployed through GitHub Pages.

The application loads its runtime scripts in this order:

1. `pdfmake.min.js`
2. `vfs_fonts.js`
3. `lcs-icons/lcs-icons.js`
4. `build-hqs-doc.js`

---

## Deploying an Update

1. Back up existing inspection records using **Backup All**.
2. Update the applicable production files in the GitHub repository.
3. Preserve the required directory structure and case-sensitive filenames.
4. Commit the changes.
5. Allow GitHub Pages time to deploy the update.
6. Open the live application and perform a hard refresh:

   * Windows: `Ctrl+Shift+R`
   * macOS: `Cmd+Shift+R`
7. Confirm the dashboard loads without missing icons or PDF-engine errors.
8. Open an existing inspection and generate a test PDF.

For a release involving runtime or PDF changes, deploy the complete validated package rather than replacing only `index.html`.

A temporary query string can help distinguish a new test build from a cached page:

```text
https://robvilla14.github.io/hqs-inspection-tool/?release=test
```

> **Important:** Always use the GitHub Pages URL for production records. Browser storage is tied to the page origin. Opening `index.html` directly from a desktop folder creates a separate storage context.

---

## Data Storage

Inspection records are stored in browser localStorage under:

```text
hqs_v2
```

Important storage behavior:

* Records are specific to the device, browser, and website origin.
* Records do not automatically synchronize between devices.
* Clearing browser data can erase locally stored inspections.
* Photos increase record size because they are stored with the inspection.
* Browser storage limits vary by browser and device.
* Appearance preferences are stored separately from inspection records.
* Appearance settings are not added to exported inspection JSON.

Use **Backup All** regularly, particularly before:

* Updating the application
* Clearing browser data
* Changing browsers
* Replacing a device
* Performing operating-system or browser maintenance

Test imported backups before relying on them as the only copy.

---

## Generating a PDF

A PDF can be generated from either location:

* Select **Print** from an inspection card on the dashboard.
* Select **Print / Export** while an inspection is open.

The application generates the PDF directly using locally hosted pdfmake resources. The browser print dialog is not used.

The report includes:

* Property and inspection information
* Owner/property-management information
* Failed-items summary
* Inspection sections and results
* Inspector notes
* Signature areas
* Page X of Y numbering
* Photo documentation appendix

PDF styling uses a fixed print palette and does not change with the application’s System, Light, or Dark appearance setting.

---

## Offline Use

The application does not require a server connection for inspection processing, local record storage, or PDF construction after all required files have loaded.

Offline availability after closing the page depends on the browser’s caching behavior. This repository does not currently include a service worker or guaranteed offline-installation package.

Before relying on the application without connectivity:

1. Open the live application while connected.
2. Confirm the dashboard and icon resources load.
3. Open an inspection.
4. Generate a test PDF.
5. Keep a current JSON backup of all records.

---

## Technical Notes

* **No build pipeline** — plain HTML, CSS, and JavaScript
* **Local dependencies** — pdfmake, its matching font VFS, the HQS document builder, and the LCS icon registry are hosted with the application
* **PDF generation** — performed directly through pdfmake
* **UI fonts** — system font stack
* **PDF font** — Roboto supplied by the matching `vfs_fonts.js`
* **Photo storage** — images are resized before storage to help control localStorage use
* **Compatibility layer** — legacy records are normalized when read without silently rewriting unrelated stored inspections
* **Structured data** — newer records store structured location and window information while retaining legacy compatibility
* **Theme handling** — System mode follows the operating-system preference; Light and Dark can be selected manually
* **Graceful icon fallback** — missing icon resources do not prevent labels or application workflows from loading
* **PDF headings** — intentionally text-only; PDF generation does not depend on SVG icon support
* **Backend migration path** — storage access is separated from normalization and presentation logic to support future migration

---

## Third-Party Resources

The application includes locally hosted third-party resources.

* pdfmake licensing information is provided in `LICENSE-pdfmake.txt`.
* Icon source and license records are retained under `lcs-icons/licenses/`.

Do not remove or rename license records in a way that breaks their connection to the included resources.

---

## License

Copyright © 2026 Labor Compliance Solutions. All rights reserved.

The HQS application is not licensed for redistribution or commercial use without permission. Third-party components remain subject to their respective licenses.
