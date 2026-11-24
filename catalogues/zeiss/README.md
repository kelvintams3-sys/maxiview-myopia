# ZEISS MyoActive Catalogue — R1.6

Standalone Maxiview consultation catalogue, based on the supplied catalogue framework. This release contains ZEISS MyoActive only.

## Use

Upload the contents of `dist/` together to your web host. In the release ZIP these files are already at the top level, so copy the ZIP's extracted contents directly. No installation or build is required. Use HTTPS for Bluetooth printing. On iPad, open the catalogue in Bluefy/WebBLE to print to AIMO D520BT-Z.

## Confirmed prices and terms

| Item | Price / term |
| --- | --- |
| MyoActive 1.59 + DuraVision Plus Platinum UV | RM1,800 per pair |
| MyoActive 1.59 + DuraVision Plus BlueProtect UV | RM1,900 per pair |
| Biometry follow-up 1, including refraction | RM120 |
| Biometry follow-up 2, including refraction | RM120 |
| Prescription change guarantee | Complimentary replacement if prescription power becomes at least 0.50 D more short-sighted within 1 year |

Frame pricing is optional. Tap Frame to enter an amount. Hold Frame to make the entered amount complimentary; the original price remains struck through. Hold the Biometry follow-up heading to make both visits complimentary or restore their normal prices. Either visit can be deselected independently. The summary and quotation update immediately.

## Clinical content

One MyoActive clinical design is shared by both coating options. Results are shown with their endpoint, 12-month duration and single-vision comparator: 0.60 D less prescription progression and 0.22 mm less axial elongation on average. Evidence is identified as ZEISS data on file, July 2026. The standard RRP PDF is the sole attachment in the information panel; the approved clinical text remains available inline. The catalogue does not assert a cross-brand efficacy ranking; manufacturer positioning is retained separately as flagged source information.

Prescription availability is separate from the powers of the treatment elements. Available prescription: sphere 0.00 D to −9.00 D, cylinder up to −6.00 D, combined prescription up to −9.00 D. Final ordering availability is verified in VISUSTORE.

## Printing

Four monochrome label types are included: portrait quotation, landscape replacement guarantee, landscape follow-up booklet, and landscape biometry follow-up extension. Each preview uses the same monochrome pixels sent to the printer. Landscape artwork is pre-rotated into the physical 40 × 60 mm raster. The printer connection retains the FF00/FF02/FF03 services, 20-byte writes and 35 ms pacing.

Physical Bluetooth printing requires a check with the actual printer; it cannot be verified in this development environment.

## Later Myopia Control integration

The catalogue remains independent. `integration/myoactive-catalogue.json` exports the MyoActive options and stable comparison field keys for a later Myopia Control hub. `catalogue-data.js` exposes the same data as `MyoActiveData`; `comparison.js` exposes `CatalogueComparison.render(options, rows)` for browser use and CommonJS testing.

The comparison renderer uses one semantic table: every row is generated once across every selected option. Study duration/comparator and warranty duration/prescription threshold have distinct fields. Missing values display as “Not specified”; repeated options are deduplicated and selection order is preserved. Other catalogues are not bundled into this release.

## Validation

154 existing automated checks passed for R1.4, including 128 price permutations, selection-order and long-copy comparisons, frame and complimentary state transitions, TSPL monochrome roundtrips and simulated BLE transmission. All local source links resolve and the original brochure is byte-identical to the supplied PDF. Live browser preview was unavailable in this execution environment; DOM/canvas checks use simulated harnesses and do not verify live browser geometry or physical printing. No patient data is stored.

## R1.1 update

The coating choices now have a pale-amber box directly below them: “1 year · Complimentary replacement”, followed by the condition that prescription power becomes at least 0.50 D more short-sighted within 1 year. This replaces the previous blue guarantee panel above the coating section.

Release: 2026-11-21-r1.6

## R1.2 — Standardised power warranty wording

Uses the HOYA card sentence structure: “If [sphere/prescription] power becomes at least [threshold] D more short-sighted within [period].” Cards, comparisons, information, summary and guarantee/booklet labels use consistent wording. Complimentary replacement is explicit. Existing thresholds, periods, measurement basis, prices and follow-up behaviour are preserved.

## R1.3 — Brochure findings and original brochure access

Restores both M.O.V.E. innovations (variable positive powers and deliberately non-repeating alignment), their design rationale, and the separate ClearFocus back-surface feature. The consultation screen now includes the study’s 98% adaptation result. The information panel retains the clinical tradeoff, first-year source status, full-study means and relative reductions, interval and age subgroup results, emmetropic reference comparison, observed shortening and subjective wear findings. Professional detail is expandable. No cross-brand superiority or myopia-reversal claim is made.

Current attachment: tap either existing **i** button, then **Standard ZEISS RRP brochure**. It opens the unmodified one-page `2026 Trade & RRP - MyoActive(3).pdf` in a separate tab. The former six-page RSP brochure, white paper and one-page overview are not bundled in R1.6. See `SOURCES.md` for the clinical-copy source history.

Pricing, replacement thresholds/periods, paid follow-up entitlement, complimentary controls, comparison calculations and all printing code are unchanged. Rollback package: `MYOACTIVE_CATALOGUE_R1_2.zip`.


## R1.4 — Retain and flag uncertain brochure claims

The manufacturer’s highest-efficacy/most-effective positioning and 100% emmetropic-like-growth wording are retained as attributed claims under (i) → Optometrist study details & flagged brochure claims. Amber cards explain the comparison and individual-level interpretation questions. Existing consultation copy, trial figures, product data, pricing, terms, controls and printing remain unchanged.

When source support is uncertain, preserve the existing point and flag it for review. The same rule applies to all three catalogues; see AGENTS.md.


## R1.5 — Positive print logos

The print-only ZEISS mask now uses black lettering on white in place of the former white-on-black block. The logo keeps its existing footprint.

All four outputs use the same positive logo: quotation, guarantee, booklet and biometry follow-up extension. Screen logos, label dimensions, text layout, pricing, replacement terms, pre-rotation, raster encoding and Bluetooth transport are preserved.

154 existing checks and 8 real-canvas positive-logo cases passed. Decoded printer bytes match the physical rasters; both preview and decoded print logos have black foreground on white. Physical printing was not tested. Run `node qa/verify-print-logo.cjs [baseline-folder]` with `@napi-rs/canvas` and Arial-compatible fonts.


## R1.6 — Standard RRP attachment only

Replaced the attached November/RSP brochure with the supplied unmodified standard `2026 Trade & RRP - MyoActive(3).pdf`. It is one page, with the standard price and prescription-range table. The sole PDF link is **(i) → Standard ZEISS RRP brochure**. Removed the white-paper and overview links and their PDF assets.

Product text, product data, lens/coating prices, guarantee terms, positive print logo, labels and Bluetooth behaviour are unchanged. The RRP PDF was opened, rendered and compared byte-for-byte with the original upload; the information-panel path and packaged PDF target were checked. Brochure checks for the existing HOYA and Stellest packages also passed.

Rollback: restore the complete R1.5 package.
