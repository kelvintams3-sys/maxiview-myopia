# Maxiview Myopia Catalogue R1.17 — consistent model styling

24 November 2026. The agreed model colours now carry through product cards, comparison headings (including pinned copies), summaries, the lens chooser and selected-lens footer. One shared model-themes.css defines the five palettes. White specification panels, neutral selection indicators and fixed pale blue-grey replacement terms keep the same visual meanings across screens.

Stellest uses rich teal; Stellest 2.0 navy-to-blue; MiYOSMART HOYA blue; MiYOSMART iQ amber with dark blue text; MyoActive deep navy-to-cobalt. Full model, technology, style and coating identity remains visible. Chameleon (Photochromic) now uses the existing native label consistently in the comparison and summary.

Extract the complete ZIP into a fresh folder and open the root `index.html`. Check the product, comparison and summary screens on the intended iPad/Bluefy. If using a hosted copy, serve the complete folder over HTTPS. Each native catalogue can also open directly from its own `catalogues/<brand>/index.html`. No build is required.

The R1.15 Bluetooth permission fix and R1.16 black-on-white print logos are retained. Every printer file, print asset, original checksum manifest, data file and the integration bridge matches R1.16 byte for byte. Screen styling and display markup change; prices, replacement conditions, deliberate selection, navigation and print behaviour are preserved.

## Screen styling in R1.17

- Full model-colour header bands and white detail panels, with matching model-name hierarchy in summaries and comparisons.
- Comparison model names, technology, full style/coating and material/index separated into readable lines; repeated and pinned headings use the same palettes.
- Subtle model-colour rails in the existing lens chooser and selected-lens footer. Selection remains a separate tick/radio and neutral outline; all three brands still start unselected.
- Brochure-derived brand hero colours and model-specific evidence accents. HOYA iQ evidence keeps its own subject colour even if original MiYOSMART is selected.
- Replacement terms use background #EEF3F7, border #CBD7E1 and text #173A56 throughout, with stronger period/threshold emphasis. No commercial condition changes.
- Native detailed comparisons carry the model header colours and neutral replacement rows. Long multi-option tables retain horizontal scrolling with enough width for the complete identities.
- Screen additions are scoped away from all native print overlays; original print-related CSS rules remain intact.

## Content retained from R1.14

- ZEISS: official lifestyle and annotated lens images, expandable macro images, the documented 12-month results, trial group sizes and adaptation/peripheral-vision information.
- Essilor: official IFU figures, the detailed original-Stellest results and same-brand Stellest 2.0 study chart, with expandable design/material information.
- HOYA: official lens macro, 12-month trial figures and expandable design/coating images; Chameleon appears as Chameleon (Photochromic) on screen.
- All three: compact frame ✕ controls, stronger black discount strikethroughs, and the complimentary gesture retained without the visible hint.
- Compare: “Lens” wording and the original-brochure row removed. Tap the current brand’s (i) control to open its brochure; ZEISS has a simple link to the exact supplied six-page PDF.
- Removed the remaining generic wear/review advice tiles from the information panels. Study wearing conditions and safety observations remain available as evidence; paid follow-up controls remain in the summary.

Default ZEISS navigation, deliberate lens selection, selected-brand comparison columns, independent lens choices, shared frame/follow-ups, exact summary handoff, pinned identities and scroll restoration are preserved.

## Printer protection

Each brand retains its own printer implementation and unchanged PRINTER_SHA256.json. ZEISS has the explicit logo-only exception recorded in PRINTER_LOGO_AUTHORIZATION.json; every other source byte matches the original hash. Native print overlays, script loading order/attributes, printer handlers, Bluetooth lifecycle, UUIDs, 20-byte chunks, 35 ms pacing and label layouts are preserved. The integration bridge is unchanged.

The print overlay keeps its original “Print Quotation” button and “Quotation” title because the overlay belongs to the frozen printer interface. Screen-only wording elsewhere uses “Lens”. The printed lens-row wording and Chameleon label stay exactly as in the confirmed baseline.

Run `node qa/verify-printer-lock.cjs` before and after every update. Never regenerate the supplied printer manifests to conceal a change. See the native PRINTER_LOCK.md files.

## R1.17 checks

- All 15 selected-lens routes keep the correct model palette and complete identity across comparison, pinned headings and summary; all 15 chooser options carry the correct permanent identity without an initial selection.
- All 20 model/header text contrast pairs meet a computed ratio of at least 4.5:1. This is a colour calculation, not a live browser layout check.
- Existing selection, focus, shared settings, scroll-retention and 13 simulated pinned-heading scenarios pass, including all eight selection subsets and 24 brand returns.
- All 600 original financial handoffs and 645 label cases pass the retained baseline checks. All R1.16 printer bytes and artwork are unchanged.
- Native HOYA 794 checks and ZEISS 154 checks pass; root comparison checks cover 225 ordered pairs, 3,375 ordered triples and 1,440 financial cases.
- Package links, assets, script order, original print overlays, JavaScript syntax and CSS structure are checked. No live browser geometry or physical print was tested in this environment; an iPad visual check remains necessary.

## R1.16 checks — retained print baseline

- All three printer checks pass, including the separately recorded ZEISS logo-only authorization. The original manifests and captured baseline are unchanged.
- All 60 brand/option/type cases pass: 52 Essilor/HOYA outputs are byte-identical, and eight ZEISS outputs change exactly the 48 × 48 logo pixels.
- All 600 original financial handoffs match. Across the original 645 label cases, 559 remain byte-identical and 86 change only the ZEISS logo. Decoded pixels outside the logo are unchanged.
- Existing integration checks pass: 15 lens handoffs, 60 hub/native label comparisons and three simulated Bluetooth transmissions.
- The 12 brand/type previews and enlarged ZEISS logo were inspected visually. Physical printing of R1.16 remains to be confirmed.

## R1.15 checks — retained history

- JavaScript syntax and all three original printer locks pass.
- All files inside `catalogues/` and `bridge.js` match the R1.14 archive byte for byte.
- The actual hub initialization was exercised for file, HTTPS, HTTP and absent-location contexts. All three fixed catalogue frames receive their intended permission before insertion; the broader permission is used only for `file:` pages.
- Existing integration checks pass: all 15 lens handoffs, 60 label-byte comparisons, three simulated Bluetooth transmissions, shared settings, navigation and scroll retention. Eight selection-subset and 24 brand-return checks also pass.

Kelvin subsequently confirmed PC printing when within range. No live browser or physical Bluetooth test was performed in this environment.

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
node qa/verify-print-logos.cjs
node qa/verify-model-themes.cjs
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

For this styling update, restore the complete R1.16 package if needed; do not mix release folders. The R1.15 Bluetooth correction remains the working connection baseline and the R1.16 black-on-white artwork is retained.

Keep STELLEST_R1_32_PRINT_LOCKED.zip, HOYA_R1_5_PRINT_LOCKED.zip and MYOACTIVE_R1_4_PRINT_LOCKED.zip for the original standalone catalogues. Keep MAXIVIEW_MYOPIA_CATALOGUE_R1_4_PICTURES_UPDATED.zip for the previous combined catalogue. Replace the complete deployed tree when rolling back, avoiding mixed versions.
