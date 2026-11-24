# HOYA MiYOSMART Catalogue — R1.6

Maxiview consultation catalogue for MiYOSMART and MiYOSMART iQ. Built from the approved consultation framework with HOYA branding, product data, clinical context and separate sphere-based replacement terms.

## Install

Extract the release ZIP and copy its contents into a separate HOYA catalogue folder on your web host. `index.html` and all runtime files are at the archive root; no build or installation is required. Keep the existing catalogues in their own folders.

Use HTTPS for Bluetooth printing. On iPad, open the catalogue in Bluefy/WebBLE to connect the AIMO D520BT-Z.

## Lens prices

Retail amounts follow page 11 of the supplied HOYA brochure. Maxiview’s catalogue uses these amounts per pair. The brochure table itself does not explicitly label the price basis.

| Lens | Standard coating | Full Control Coating STX |
| --- | --- | --- |
| MiYOSMART Clear | MiYOSMART STX · RM1,300 | RM1,400 |
| MiYOSMART Chameleon | MiYOSMART STX · RM1,500 | RM1,500 |
| MiYOSMART Sunbird | MiYOSMART STX · RM1,600 | Not available |
| MiYOSMART iQ Clear | S.P.A.R.K. · RM1,700 | RM1,800 |
| MiYOSMART iQ Chameleon | S.P.A.R.K. · RM1,800 | RM1,900 |

The two lens-family cards retain independent style/coating choices for comparison. Tap a coating price to make that option the active quotation. The shared comparison table opens by default and can be hidden. It uses actual table rows so corresponding features remain aligned when text wraps.

## Replacement terms

These distinct terms come from Kelvin's supplied replacement-terms image and instruction that replacement is complimentary.

| Family | Period | Sphere criterion |
| --- | --- | --- |
| MiYOSMART | 6 months | Sphere becomes at least 0.75 D more short-sighted: an additional −0.75 D or more. |
| MiYOSMART iQ | 1 year | Sphere becomes at least 0.50 D more short-sighted: an additional −0.50 D or more. |

The selected family's policy appears in its card, comparison, summary, guarantee label and follow-up booklet label. Sphere is explicit; the trial's spherical-equivalent outcomes are not used as the warranty criterion. Switching family refreshes label artwork and cache entries.

## Frame and biometry

- Frame is optional. Tap to enter an amount, hold to make it complimentary, hold again to restore its original price, or remove it.
- Two biometry follow-ups, including refraction, cost RM120 each: RM240 total.
- Each visit can be included or excluded independently.
- Hold **Biometry follow-up** for approximately 850 ms to make both visits complimentary or restore their normal prices.
- Complimentary amounts retain their original struck-through prices. They add RM0 to the total and print with the same struck-through amounts.
- Returning to edit preserves the current frame, follow-up and lens choices.

## Clinical and prescription information

MiYOSMART iQ uses D.I.M.S. with Triple Enhanced Design. The catalogue shows the source's 6.9 mm clear zone, 41 mm treatment zone and +4.5 D defocus, compared with 9.4 mm, 33 mm and +3.5 D for MiYOSMART.

The iQ results are labelled 0.58 D less prescription progression and 0.27 mm less eye-length growth on average versus single vision over 12 months. Study ages are 4–12; the evidence is an ARVO 2026 presentation and HOYA data on file, April 2026. Original-family values of 0.28 D / 0.14 mm are explicitly identified as calculated differences from the same supplied trial chart. There is no promise of an individual outcome or cross-brand superiority claim.

Prescription availability is style-specific. Original Clear supports a minus sphere/combined limit of −13.00 D; original Chameleon and Sunbird have a −10.00 D limit. iQ Clear and Chameleon have a −13.00 D minus limit, plus +0.25 D to +4.00 D sphere subject to maximum spherical equivalent +2.00 D. Cylinder is up to −4.00 D. Diameter and final ordering availability remain subject to prescription and frame.

Tap either existing (i) button to open information. The clinical summary link is at the top. Tap “Original HOYA trade brochure” for the bundled original source, which contains professional information and trade prices. Both PDFs open in a separate browser tab.

## Printing

Four print outputs are retained: portrait quotation; landscape guarantee; landscape follow-up booklet; landscape biometry follow-up extension. All show the selected family and style. Guarantee and booklet use the selected family's sphere-based policy; the extension remains an extension label.

Preview and transmission share monochrome pixels. Physical stock is 40 × 60 mm, using a 320 × 480 pixel raster; landscape artwork is pre-rotated. The existing FF00 / FF02 / FF03 connection, 20-byte chunks and 35 ms pacing are retained.

Actual Bluetooth printing on the user's printer remains to be checked. Simulation and visual review do not establish physical print success.

## Future Myopia Control integration

`integration/hoya-catalogue.json` exports both families and all nine available options, with stable shared comparison field keys. `catalogue-data.js` exposes `HoyaCatalogueData`; the generic renderer exposes `CatalogueComparison`. Both also support CommonJS tests.

Warranty duration, numeric threshold and measurement basis are separate data. Study duration and comparator remain separate comparison rows. Repeated selections are deduplicated, selection order is preserved and missing fields display as “Not specified.” Other working catalogue modules are not overwritten or merged in this release.

## Source and verification

- Product, price and prescription source: `MiYOSMART iQ_Trade Brochure.pdf`, especially pages 6, 11 and 12.
- Replacement source: Kelvin's supplied `1000228419.jpg` and complimentary-replacement instruction.
- Baseline: approved `MYOACTIVE_CATALOGUE_R1.zip`.
- Automated checks: **794 passed**, including 576 financial permutations, 81 comparison pairs, 81 app transitions and 36 label cases.
- This release: 6 additional simulated printer lifecycle checks passed. Both families’ actual label artwork was rendered and visually checked.
- Fresh browser geometry and real pointer checks were blocked by this environment’s browser restrictions; the prior release’s browser claims were not counted as new verification.
- `QA_REPORT.md` records verification scope. Tests run with `node qa/verify.cjs` from either the source project or extracted release.

Release: 2026-11-21-r1.6

## R1.2 changes

- Replaced the centred portrait below the Triple Enhanced Design explanation with the classroom photograph from page 2 of the supplied HOYA trade brochure.
- Used the original embedded photograph with a wide, responsive display that includes the surrounding children. The brochure's printed heading and page margins are not included in the image asset.

## R1.1 changes

- Clarified the sphere-based replacement sentence and its time period on each lens card.
- Added the supplied brochure’s evidence publication context to the information panel.
- Rechecked prices, calculations, comparison combinations, artwork and simulated printer lifecycle.
- Retained the approved consultation flow, prices and Bluetooth transport.

## Re-run verification

The catalogue itself has no install or build step. Development checks require Node.js:

```sh
node qa/verify.cjs
node qa/verify-printer-lifecycle.cjs
```

An optional real-canvas artwork check requires `@napi-rs/canvas` and Arial-compatible fonts:

```sh
npm install --no-save @napi-rs/canvas
node qa/verify-artwork.cjs
```

The optional check reports `skipped` if its dependency or fonts are missing. Font overrides are documented in the script. See `SOURCES.md` for content provenance and `QA_REPORT.md` for the current verification limits.

## R1.3 — Standardised power warranty wording

Uses the HOYA card sentence structure: “If [sphere/prescription] power becomes at least [threshold] D more short-sighted within [period].” Cards, comparisons, information, summary and guarantee/booklet labels use consistent wording. Complimentary replacement is explicit. Existing thresholds, periods, measurement basis, prices and follow-up behaviour are preserved.


## R1.4 — Restored brochure findings

- The three TED design updates now explain their optical purpose: closer signal delivery, stronger defocus and wider coverage, including larger frames.
- A separate everyday-vision block restores the optimized FreeForm back surface and flatter lens profile. FreeForm is included for iQ; no new paid option is added.
- S.P.A.R.K. now explains its improved scratch resistance and lasting easy cleaning compared with the previous MiYOSMART generation.
- Information retains precise 10% edge-thickness, 50% scratch-resistance and 5× water-resistance comparisons, source/testing context and the distinction between simulated durability and a guarantee.
- The 9-in-10 clinical finding includes ages 4–12, 12 months and the 0.50 D spherical-equivalent threshold. It does not claim zero progression.
- Follow-up within six months monitors prescription and eye length; suitability and package entitlements stay separate.
- `SOURCES.md` maps the restored copy to original PDF pages. R1.3 remains the rollback source.

Validation: 794 existing data/interaction/comparison/label checks, 6 simulated printer-lifecycle checks and 36 real canvas/raster label cases passed. Printer code is byte-for-byte unchanged from R1.3. Browser review is completed separately before packaging; physical Bluetooth printing was not tested here.


## R1.5 — Preservation review

Compared current copy against the pre-brochure R1.3 release: existing product specifications, TED dimensions/powers, results, replacement terms and source details were retained. No uncertain existing point required restoration. All consultation content and behavior are unchanged from R1.4.

The project instruction to preserve uncertain existing content and flag it for review is included in AGENTS.md.


## R1.6 — Positive print logos

The HOYA print mark is explicitly drawn as black lettering on a white background. Its existing positive artwork is retained; all 36 tested label outputs remain byte-identical to R1.5.

All four outputs use the same positive logo: quotation, guarantee, booklet and biometry follow-up extension. Screen logos, label dimensions, text layout, pricing, replacement terms, pre-rotation, raster encoding and Bluetooth transport are preserved.

794 existing checks and 36 real-canvas positive-logo cases passed. Decoded printer bytes match the physical rasters; both preview and decoded print logos have black foreground on white. Physical printing was not tested. Run `node qa/verify-print-logo.cjs [baseline-folder]` with `@napi-rs/canvas` and Arial-compatible fonts.
