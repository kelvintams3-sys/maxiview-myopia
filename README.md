# Maxiview Myopia Catalogue R1.18 — screen styling on supplied R1.15

24 November 2026. Built from Kelvin's supplied MAXIVIEW_MYOPIA_CATALOGUE_R1_15_LOCAL_BLUETOOTH_TEST.zip. The agreed screen styling is applied while every printer file, print logo, label asset and the working Bluetooth path remain exactly as supplied in R1.15. No print-logo inversion is included.

Extract the complete ZIP into a fresh folder and open the root `index.html`. For a hosted copy, replace the complete deployed folder together and retain HTTPS. Each native catalogue can also open from `catalogues/<brand>/index.html`. No build is required. Review product, comparison and summary layouts in Bluefy; physical printing cannot be tested in this environment.

The supplied R1.15 printer files, original checksum manifests and validators, native print overlays, script-loading attributes, artwork, bridge.js and product data are retained unchanged. All original label-output checks must pass without a logo exception. R1.15's local-file Bluetooth permission fix is retained.

## Screen changes applied

- Stellest rich teal; Stellest 2.0 navy-to-blue; MiYOSMART HOYA blue; iQ amber with dark blue text; MyoActive deep navy-to-cobalt. The palettes are defined in one shared model-themes.css.
- Matching coloured model headers and white details through product, comparison, pinned headings and summary, with full model/technology/style/coating identity.
- Subtle model cues in Change lens and the selected-lens footer; separate neutral selection indicators with no initial lens selection.
- Brochure-based brand heroes and subject-specific evidence accents. Existing official charts and illustrations are unchanged.
- Replacement panels use the same pale blue-grey background #EEF3F7, border #CBD7E1 and dark navy text #173A56. Period and threshold receive stronger emphasis; the terms themselves are unchanged.
- HOYA Chameleon (Photochromic) uses the existing native label in comparison and summary. Native detailed comparisons retain readable widths and horizontal scrolling.

## R1.18 verification

The unchanged original printer validators and captured output baseline are used. Tests cover all 645 exact label-byte comparisons and 600 financial handoffs, 15 model routes, 45 comparison identities, 15 chooser identities, 20 calculated contrast pairs, navigation and pinned-heading fixtures, and native HOYA/ZEISS interactions. See QA_REPORT.md and the current verification JSON files for completed results. These are static/simulated checks; actual iPad geometry and physical printing are not established by them.

## Retained R1.14 content

## What changed

- ZEISS: official lifestyle and annotated lens images, expandable macro images, the documented 12-month results, trial group sizes and adaptation/peripheral-vision information.
- Essilor: official IFU figures, the detailed original-Stellest results and same-brand Stellest 2.0 study chart, with expandable design/material information.
- HOYA: official lens macro, 12-month trial figures and expandable design/coating images; Chameleon appears as Chameleon (Photochromic) on screen.
- All three: compact frame ✕ controls, stronger black discount strikethroughs, and the complimentary gesture retained without the visible hint.
- Compare: “Lens” wording and the original-brochure row removed. Tap the current brand’s (i) control to open its brochure; ZEISS has a simple link to the exact supplied six-page PDF.
- Removed the remaining generic wear/review advice tiles from the information panels. Study wearing conditions and safety observations remain available as evidence; paid follow-up controls remain in the summary.

Default ZEISS navigation, deliberate lens selection, selected-brand comparison columns, independent lens choices, shared frame/follow-ups, exact summary handoff, pinned identities and scroll restoration are preserved.

## Printer protection

Each brand keeps its own original printer.js and unchanged PRINTER_SHA256.json. All locked artwork, native print overlays, script loading order/attributes, printer handlers, Bluetooth lifecycle, UUIDs, 20-byte chunks, 35 ms pacing and label layouts are preserved. The bridge remains the working R1.4 integration bridge.

The print overlay keeps its original “Print Quotation” button and “Quotation” title because the overlay belongs to the frozen printer interface. Screen-only wording elsewhere uses “Lens”. The printed lens-row wording and Chameleon label stay exactly as in the confirmed baseline.

Run `node qa/verify-printer-lock.cjs` before and after every update. Never regenerate the supplied printer manifests to conceal a change. See the native PRINTER_LOCK.md files.

## R1.15 checks

- JavaScript syntax and all three original printer locks pass.
- All files inside `catalogues/` and `bridge.js` match the R1.14 archive byte for byte.
- The actual hub initialization was exercised for file, HTTPS, HTTP and absent-location contexts. All three fixed catalogue frames receive their intended permission before insertion; the broader permission is used only for `file:` pages.
- Existing integration checks pass: all 15 lens handoffs, 60 label-byte comparisons, three simulated Bluetooth transmissions, shared settings, navigation and scroll retention. Eight selection-subset and 24 brand-return checks also pass.

The local-file permission change still needs a real iMac and Bluefy printing check. No live browser or physical Bluetooth test was performed in this environment.

## Verification inherited from R1.14

- All three printer locks pass.
- 600 actual summary handoffs across 15 options match the original locked totals; 645 label-command outputs match independent baseline captures byte for byte.
- Comparison checks pass for 225 ordered pairs, 3,375 ordered triples and 1,440 financial combinations.
- Original integration, selection, shared-state, navigation, complimentary, simulated Bluetooth and pinned-heading checks pass.
- HOYA: 794 native checks pass. ZEISS: 154 native checks pass.
- Official assets, packaged links, five PDFs/40 pages, native print interfaces, JavaScript syntax and CSS structure pass package checks.

These are static and simulated checks with real canvas rendering. They do not establish live layout, iPad touch behaviour or a physical Bluetooth connection. Retest the four label types for each brand on the iPad/Bluefy/printer before replacing the working installation.

Development checks use Node.js, @napi-rs/canvas and Arial-compatible fonts. The package check additionally uses Python, lxml and PyMuPDF. The catalogue itself needs none of these dependencies.

```sh
node qa/verify-printer-lock.cjs
node qa/verify-locked-output.cjs
node qa/verify-comparison.cjs
node qa/verify-integration.cjs
node qa/verify-shortlist.cjs
node qa/verify-pinned-headings.cjs
node qa/verify-r14.cjs
node qa/verify-content-port.cjs
python3 qa/verify-package.py
```

The included older reviews describe earlier releases; current results are in QA_REPORT.md and the current verification JSON files.

## Pending confirmation

Unchanged: ZEISS Platinum UV remains RM1,800 despite RM1,600 in the supplied brochure; Stellest 2.0 retains about 47%; the 1,190 lenslet count remains; Airwear material-comparison footnotes still need confirmation. These issues are recorded in the expandable optometrist references. No prices, replacement terms or uncertain product specifications were silently changed.

## Rollback

Restore the exact supplied R1.15 ZIP to roll back this styling update; do not mix files from different releases.

Keep STELLEST_R1_32_PRINT_LOCKED.zip, HOYA_R1_5_PRINT_LOCKED.zip and MYOACTIVE_R1_4_PRINT_LOCKED.zip for the original standalone catalogues. Keep MAXIVIEW_MYOPIA_CATALOGUE_R1_4_PICTURES_UPDATED.zip for the previous combined catalogue. Replace the complete deployed tree when rolling back, avoiding mixed versions.
