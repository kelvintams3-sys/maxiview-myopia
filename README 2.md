# Maxiview Myopia Catalogue — R1.4

One tabbed consultation system for Essilor STELLEST, HOYA MiYOSMART and ZEISS MyoActive, with cross-brand comparison and the original quotation/label printing flows.

## Open or install

Extract the complete ZIP and open the root `index.html` to preview the catalogue. To host it, upload the entire extracted tree, including `catalogues/`, to the website folder. There is no build step or installation dependency for the app.

Bluetooth printing uses the existing AIMO D520BT-Z flow. Use HTTPS and Bluefy/WebBLE on iPad. The original individual catalogues are retained under `catalogues/stellest/`, `catalogues/hoya/` and `catalogues/zeiss/`; each can also be opened directly. Keep every asset and its relative path intact.

## Consultation

The catalogue opens on ZEISS with no lens selected. A single header shows the current brand logo centred, with smaller faded buttons for the other two brands and Compare at the right. Information is at the left; the native headers are hidden to avoid duplication. In Compare, all three clickable logos move to the centre and the side navigation, including Compare, disappears. Brands with selected lenses appear first in full colour; the remaining brands follow on the right in a faded style. Tap any logo to return to that catalogue. All navigation controls retain comfortable tap targets.

Explain the lens first. Nothing is preselected, and the floating selected-price / Review summary bar stays hidden until an actual lens choice is made. Listed coating-option prices remain available where the lens options are explained.

Compare automatically reads the current deliberate selection from Essilor, HOYA and ZEISS. Only brands with a selected lens appear as columns. Two selected brands produce two lens columns; no selection produces an empty comparison. Use the centred logos to choose another brand. Change lens opens options from its actual brand and updates its catalogue too; cancelling changes nothing. No separate Add/Remove workflow is needed.

Brand appears once above its model/style/coating. The complete identities stay pinned during vertical and horizontal scrolling. The main table retains source-derived design explanations, coating/material information, complete replacement conditions using the same Sphere power phrasing as HOYA, and original brochure links. Each lens retains its source period and numeric change threshold. Technical and clinical study details remain expandable.

Compare shows lens-pair prices and, if entered, an explicitly labelled Lens + frame subtotal. Follow-up charges and controls are excluded from Compare and its prices. Review summary opens the exact selected lens in its original summary, where follow-ups are discussed and the complete quotation and original label controls remain available. Complimentary settings and struck-through values are preserved.

The comparison keeps its reading position and expanded sections across edits and summary round trips. Tabs are locked during label transmission. Current-selection scans do not render or navigate the native catalogue; older replies cannot overwrite a newer explicit choice.

## Source releases and brochures

| Catalogue | Bundled release | Original main attachment |
| --- | --- | --- |
| Essilor STELLEST | R1.33 | Original Stellest brochure, 4 pages |
| HOYA MiYOSMART | R1.6 | Original HOYA trade brochure, 12 pages |
| ZEISS MyoActive | R1.6 | User-supplied MyoActive brochure, 6 pages |

Use the comparison's brochure row for the original PDFs. The extra ZEISS information-panel brochure card has been removed. ZEISS now has the exact six-page PDF supplied on 23 November 2026; it replaces the prior one-page attachment. There is no alternate or dummy ZEISS brochure. HOYA retains its original brochure and clinical summary, and Essilor its Stellest brochure and practitioner guide. overrides.json records the authorized replacement and source hash.

`sources.json` records the exact input ZIP filenames, versions and hashes. The native HTML files receive one integration-script reference; their app/data/styles/printer source files are retained. The bridge coordinates selection and shared accessories without replacing native price calculations or label renderers.

## Verification and agent review

- 15 valid options; 225 ordered pairs and 3,375 ordered triples passed comparison checks.
- 1,440 shared-accessory financial cases passed against source prices and commercial terms.
- All 15 exact native-summary handoffs passed, including the parent's RM1,740 STELLEST / Crizal Rock case with an RM200 frame and two paid RM120 visits.
- 60 label-command comparisons matched the corresponding unbridged native rendering byte for byte.
- Shared-state propagation, lazy loading, scroll restoration, duplicate prevention, frame-only editing, invalid amounts, complimentary controls, message-source validation and three simulated print locks passed.
- Automatic current-selection scanning, initially unselected catalogues, brand-restricted Change/cancel, header logo switching, reading/focus restoration and exclusion of follow-up charges have focused regression checks.
- Original file integrity, local links, aligned table structure and all retained PDF pages were checked.
- Thirteen deterministic heading checks cover vertical and sideways scrolling, narrow viewports, expanded sections, changed selections, one/two/three choices and leaving or emptying Compare.
- Analyst, design, marketing, optometrist, parent and moderator reports are included in `reviews/`.
- The moderator rated the revised simulated consultation 9.0/10 for smoothness and 9.5/10 for professionalism. Those scores describe the role-play, not measured device performance.

The checks execute actual application scripts with an in-memory DOM and real canvas label rendering. They do not establish live responsive geometry, iPad touch behaviour or physical Bluetooth printing. Browser preview was restricted in the execution environment, so the design agent's app review was static. A live iPad/Bluefy/printer check remains necessary.

Development checks use Node.js; integration checks additionally need `@napi-rs/canvas` and Arial-compatible fonts:

```sh
node qa/verify-comparison.cjs
node qa/verify-integration.cjs
node qa/verify-pinned-headings.cjs
node qa/verify-shortlist.cjs
node qa/verify-r14.cjs
```

For the optional archive/link/PDF check, run `python3 qa/verify-package.py /path/to/the/original/ZIPs` after the integration test; it requires `lxml` and `PyMuPDF`.

The app itself loads no external libraries, fonts or runtime services. Native study links open externally only when deliberately selected. No patient names or clinical records are collected or stored by this hub.

## Rollback

Keep the previous combined R1.3 ZIP to roll back this update. Keep the original three ZIPs listed in `sources.json` to return to independent catalogues. The saved standalone releases remain available.

## R1.10 — comparison table (23 Nov 2026)
Removed the "Original brochure / Open brochure" row from the Compare table (Kelvin). Brochure PDFs remain bundled and linked from each brand's (i) panel.

## R1.11 — display tweaks (23 Nov 2026)
Black struck-through price (hub and brand screens); "Hold for complimentary" hint removed (long-press still works); HOYA Chameleon labelled "Photochromic".

## R1.12 (23 Nov 2026)
Remove frame is now a compact ✕ beside the frame (hub and brand summaries).

## R1.13 (23 Nov 2026)
"Lens pair" is now "Lens" in the hub compare table, lens pickers, brand summaries and printed quotation label; "Print Quotation" is now "Print Label".
