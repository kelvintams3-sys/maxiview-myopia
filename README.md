# Maxiview Myopia Catalogue R1.29 — stable HOYA option changes

25 November 2026. HOYA option changes now update only the affected controls, comparison content, selected details and price regions. The catalogue screen, hero, images, model headers and surrounding explanations remain in place. Unchanged model controls are retained, dropdown handlers attach only once, and open details, focus, reading position and comparison pan are preserved. Actual product/summary navigation still changes the screen normally.

The whole-screen fade is disabled for all three catalogues. The shared header no longer reassigns an unchanged brand-logo image source on each selection update. Clear remains the default style; dropdown rows stay neutral and coatings remain unchosen until tapped. Commercial values, model palettes and label artwork are unchanged.

All three printer.js files, bridge.js, print-feedback.js/CSS, assets, manifests, authorization records, native print overlays and script attributes are byte-identical to R1.28. No Bluetooth, buffer, connection, timing, notification or print-entry changes are included.

Verification exercises all nine HOYA builds without replacing the screen, hero or any image; confirms no duplicate dropdown handlers, preserves open details, focus/scroll and comparison pan, and matches the updated view against canonical content. All nine catalogue text cases match R1.28. Existing selection, financial, comparison, label-byte, simulated Bluefy transport and printer-lock checks pass. Browser layout and physical iPad/printer behavior have not been tested here.

Extract the complete ZIP into a fresh folder. For GitHub Pages, replace the deployed files together and reload Bluefy. This ZIP does not update the live site automatically. Rollback: the complete R1.28 package.

## R1.28 release notes — retained history


25 November 2026. Clear remains the default displayed lens style. Opening a HOYA dropdown shows its current style and the alternatives together inside one blue enclosure: two styles for iQ, three for original MiYOSMART. No row has a selected fill, tick or individual blue border. Light separators distinguish the neutral white rows, and the current style is not repeated in the alternatives.

Coatings start unchosen, including Sunbird's single STX coating. A coating price must be tapped before the build becomes a recommendation, enters comparison or shows its total/summary. Changing lens style resets its coating choice. The default Clear can be retained by tapping a coating directly. Complete choices from Change lens in Compare count as a deliberate style and coating selection. Each model retains its actual choices through navigation, summary and shared updates.

The amber/blue model palettes and commercial values are unchanged. All three printer.js files, logos, label artwork, manifests, authorization records, print overlays, script attributes and print-feedback.js/CSS are byte-identical to R1.27. The bridge changes only HOYA selection-state synchronization; Bluetooth provider, buffer ownership, connection, notifications, writes, chunking, timing and print entry points are unchanged.

Extract the complete ZIP into a fresh folder. For GitHub Pages, replace the deployed files together and reload Bluefy. This ZIP does not update the live site automatically. Rollback: the complete R1.27 package.

Verification covers default Clear with no coating selected, the group border, all eight style transitions, fourteen coating cases, all nine HOYA Compare handoffs, single-coating confirmation, keyboard/touch interactions and per-model memory. Existing selection, financial, original label-output and simulated Bluefy transport checks are retained. These checks use an in-memory DOM and real label renderers; live browser layout and physical printer/iPad operation are not tested here.

## R1.27 release notes — retained history


25 November 2026. The HOYA lens-option dropdown now uses the approved white rounded field, navy text/chevron, matching white option panel and smaller Photochromic subtitle. The current lens style stays in the field and is omitted from the expanded panel: Clear shows Chameleon (and Sunbird for original MiYOSMART); choosing another style makes Clear available again. Model header palettes remain consistent with the product, comparison and summary pages.

Opening or closing the menu does not select a lens. Actual changes use the existing selection, availability and pricing handlers. Includes keyboard navigation, Escape/outside-click dismissal, focus restoration and touch targets. No additional confirmation is needed. All printed artwork, label wording, prices, printer source files, Bluetooth transport and in-button feedback are byte-identical to R1.26.

Extract the complete ZIP into a fresh folder. For GitHub Pages, replace the deployed files together and reload Bluefy. This ZIP does not update the live site automatically. Rollback: the complete R1.26 package.

Verification: all eight HOYA style transitions, neutral initial selection, hidden current choice, keyboard/touch interactions, comparison/summary identity, existing pricing/selection checks and original printer output/transport checks. These checks execute the real code in an in-memory DOM; browser layout and physical iPad/printer operation have not been tested here.

## R1.26 release notes — retained history


25 November 2026. Removed the repeated S.P.A.R.K. Coating subtitle from HOYA quotation labels, retaining the larger S.P.A.R.K. heading. Applies to both Clear and Chameleon S.P.A.R.K. builds. Coating STX remains unchanged. All prices, font sizes, label coordinates, other label types and the R1.25 Bluefy buffer correction are preserved.

Only one drawing line in catalogues/hoya/printer.js changes. PRINT_ARTWORK_AUTHORIZATION.json records that exact exception and its approved source hash; original printer manifests and captured label baselines remain unchanged. bridge.js and print-feedback.js/CSS are byte-identical to R1.25.

Verification checks four ordinary/large-price Spark cases for exactly one heading, fourteen unchanged STX subtitle cases, full preview artwork regions, original financial totals, strict buffer ownership/transmission and package integrity. Physical output is not tested here. Extract and replace the complete deployed files, then reload Bluefy. Rollback: the complete R1.25 package.

## R1.25 release notes — retained history

25 November 2026. PC printing succeeds, but Kelvin's iPad now reports that writeValue needs an ArrayBuffer or View. R1.25 keeps R1.24's main-page Bluetooth provider and copies outgoing chunks into buffers created by that same page. This addresses the cross-window buffer mismatch reproduced in the regression test. The original label bytes, larger text, logos and in-button feedback are unchanged. Physical iPad success still needs confirmation.

Extract the complete ZIP into a fresh folder and open the root `index.html`. For a hosted copy, replace the complete deployed folder together and retain HTTPS. Each native catalogue can also open from `catalogues/<brand>/index.html`. No build is required. Review product, comparison and summary layouts in Bluefy; physical printing cannot be tested in this environment.

The original manifests and captured label baseline remain unchanged. PRINT_ARTWORK_AUTHORIZATION.json, all three native printer.js files, overlays, script attributes, artwork files, commercial data and the local-file permission fix are unchanged from R1.24. Only the buffer-ownership handling in bridge.js and root release metadata change in this release. R1.24's print-feedback.js/CSS remain byte-identical.

## Buffer correction in R1.25

- Embedded Bluefy still selects/connects through the main page. Its native write method now receives an ArrayBuffer created in that same window, rather than an iframe-owned typed array.
- Each packet is copied without changing its bytes, including zeros/high-bit bitmap values, offsets and final partial chunks. The original characteristic method and receiver are used; both writeValue and writeValueWithoutResponse are supported.
- The adapter returns the native write promise directly. The existing 20-byte chunks, 35 ms pacing, final one-second delay, notification activation and disconnect are unchanged. There are no extra write timeouts or automatic retries/resends.
- Desktop and standalone same-window paths retain their original native characteristic and typed-array writes. Every label and the in-bar feedback remain as in R1.24.

Replace the complete deployed files, reload the catalogue in Bluefy and test one label. The QR/public address remains the same; downloading the ZIP does not deploy it.

## Bluefy change in R1.24

- In the combined page on Bluefy/iPad, requestDevice uses the accessible top-level page's Bluetooth provider. R1.25 retains the device/service/notification sequence and adapts only cross-window write buffers. Desktop and direct standalone pages retain their existing providers. Inaccessible or missing parent providers fall back to the local provider.
- The selected button displays Choose printer…, Connecting…, Preparing printer…, Activating printer… and Printing label… inside the same bar. The separate busy status/percentage card remains hidden. Original button wording returns after completion/error.
- The fill starts only when native writes report actual transfer progress. No fake progress is shown during connection. Errors remain visible and timed-out setup stages release the original controls.
- UUIDs, request filters, notification activation, native write-method selection, chunks, pacing, disconnect, artwork and commercial calculations are unchanged. Cross-window packet ownership is corrected as described above. There is no automatic retry or resend.

Replace the complete deployed files with this release, close the old Bluefy tab and reopen the same GitHub/QR address. The button shows a setup stage and transfer fill. If it stops, report the words inside the button or the visible error. This ZIP is not automatically deployed.

## Type size in R1.23

- HOYA Chameleon style line: 22 px in quotation and landscape label headers. Clear stays at its original size.
- Quotation item/price rows: 20 to 21 px, approximately 5% larger, across Essilor, HOYA and ZEISS. Totals, title sizes and row coordinates stay as before.
- Existing fit-to-width behavior and complimentary strikethroughs are preserved. Checks cover all 15 options with ordinary and five-digit frame prices.
- Only the authorized artwork inputs change. No Bluetooth routine, notification step, byte conversion, chunk size, pacing, rasterization, connection guard or button-progress code is modified.

## Logo change in R1.22

- The same original ZEISS lettering appears black on white in quotation, guarantee, booklet and biometry-extension labels, including their previews. It retains its original size and position.
- The logo's 288 bitmap bytes are inverted, with R1.23's typography edits applied separately. Label polarity, Bluetooth routines, UUIDs, 20-byte chunks, 35 ms pacing, notification setup and disconnect remain unchanged.
- Pixel comparisons allow changes only in the original ZEISS logo region, quotation row text, and HOYA Chameleon line. All other preview pixels remain identical. Static Essilor landscape labels are byte-identical.
- The original manifests are not regenerated. PRINT_ARTWORK_AUTHORIZATION.json is current; catalogues/zeiss/PRINTER_LOGO_AUTHORIZATION.json retains the earlier R1.22 logo-only record as history.

## Print feedback in R1.21

- Progress fills the actual active print button, with its text remaining readable. The primary action reads Print Label; guarantee, booklet and extension buttons retain their descriptive names and use the same progress treatment.
- The separate busy status/percentage card is hidden. Sending quotation is replaced in screen feedback; errors remain visible and completion reads Label sent to printer.
- Progress resets for a new attempt or preview. Duplicate taps remain blocked during printing. Accessible progress and reduced-motion styling are included.
- print-feedback.js/CSS provide presentation after the original bridge/styles. R1.24 adds in-button setup wording; the native handlers, label generators and byte transmission remain intact.

## Printer correction in R1.20

- Setup still distinguishes choosing the printer, connecting, preparing and sending internally and for accessible progress. R1.21 shows busy progress on the button. Choosing a printer is not timed out.
- The successful sequence again matches R1.15: select device, connect, obtain FF00 service, obtain FF02 write channel, obtain FF03 notification channel, await startNotifications, write chunks, wait one second and disconnect.
- The original native write characteristic is returned directly. R1.19's per-write adapters and timeouts remain removed. Artwork bytes reflect the authorized logo and typography changes; 20-byte chunks, 35 ms pacing, UUIDs, filters and every native transmission function remain unchanged.
- Only setup waits are bounded: connection 20 seconds, service preparation 10 seconds, each characteristic discovery and notification activation 8 seconds. A setup timeout displays an error, stops before sending a label, clears the device and releases the controls for a deliberate retry. Explicit notification rejection is tolerated as in R1.15.
- There is no automatic retry or resend. A timed-out setup resolving later cannot resume its abandoned label. The progress bar measures completion of browser write calls; it is not a physical print acknowledgement.

Extract into a fresh folder and close the old catalogue tab before using this complete release. If publishing to the existing GitHub Pages address, replace the complete package together; a ZIP download does not update that address. R1.21 printing was confirmed by Kelvin. This release's artwork and transmission are checked statically/in simulation here; test a quotation on the device.

## Screen changes applied

- Stellest rich teal; Stellest 2.0 navy-to-blue; MiYOSMART HOYA blue; iQ amber with dark blue text; MyoActive deep navy-to-cobalt. The palettes are defined in one shared model-themes.css.
- Matching coloured model headers and white details through product, comparison, pinned headings and summary, with full model/technology/style/coating identity.
- Subtle model cues in Change lens and the selected-lens footer; separate neutral selection indicators with no initial lens selection.
- Brochure-based brand heroes and subject-specific evidence accents. Existing official charts and illustrations are unchanged.
- Replacement panels use the same pale blue-grey background #EEF3F7, border #CBD7E1 and dark navy text #173A56. Period and threshold receive stronger emphasis; the terms themselves are unchanged.
- HOYA Chameleon (Photochromic) uses the existing native label in comparison and summary. Native detailed comparisons retain readable widths and horizontal scrolling.

## Current verification

The artwork suite covers 120 label cases, 96 preview pixel comparisons, 24 unchanged static-landscape outputs, 120 row-fit checks and Chameleon font checks. The unchanged original source is reconstructed to reproduce all 645 captured label hashes, while all 600 current financial handoffs remain unchanged. The sequence suite compares 36 complete successful native-versus-bridged Bluetooth/pacing/byte traces using approved artwork. Setup timeout/retry and button-progress checks also pass. See QA_REPORT.md and current verification JSON files. These are static/simulated checks; physical output of this release is not established by them.

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

Each brand keeps its R1.23 printer.js and unchanged PRINTER_SHA256.json. Earlier authorized font/bitmap inputs are retained exactly. Native interfaces, transmission code and layout coordinates are unchanged. The bridge retains R1.24's provider selection and adds only cross-window buffer adaptation; feedback remains byte-identical to R1.24.

The static overlay and event handlers remain original. The unchanged screen helper retains Print Label and button progress. Printed wording is unchanged; only the approved type sizes and ZEISS logo polarity differ.

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
node qa/verify-print-logos.cjs
node qa/verify-print-artwork.cjs
node qa/verify-bluefy-handoff.cjs
node qa/verify-bluefy-buffer-owner.cjs
node qa/verify-connection-guard.cjs
node qa/verify-r15-ble-sequence.cjs
node qa/verify-print-feedback.cjs
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

Restore complete R1.24 to undo only this buffer correction, or R1.23 for the earlier provider path. These earlier releases succeeded on desktop but were reported to fail on the iPad. Do not mix files from different releases.

Keep STELLEST_R1_32_PRINT_LOCKED.zip, HOYA_R1_5_PRINT_LOCKED.zip and MYOACTIVE_R1_4_PRINT_LOCKED.zip for the original standalone catalogues. Keep MAXIVIEW_MYOPIA_CATALOGUE_R1_4_PICTURES_UPDATED.zip for the previous combined catalogue. Replace the complete deployed tree when rolling back, avoiding mixed versions.
