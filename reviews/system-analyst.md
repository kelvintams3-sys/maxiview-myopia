# System analyst review

Sources: exact releases recorded in `sources.json` — Stellest R1.33, HOYA R1.6 and ZEISS MyoActive R1.6.

## Implemented comparison contract

`catalogue-data.js` exports the same `MyopiaHubData` model in browser globals and CommonJS. It includes all 15 valid commercial options: four Stellest product/coating combinations, nine HOYA family/style/coating combinations, and two ZEISS coatings. HOYA and ZEISS options derive directly from their native modules; the Stellest product/coating records are exact copies of the bundled R1.33 records and are checked against the original source.

Every option has a stable identity, full family/style/coating name, native selection object, approved price, brochure path, replacement terms, and all 27 comparison fields. Unknown source specifications display `Not specified` rather than implying absence or inventing a value. Each comparison row is defined once for all columns.

The defaults are original STELLEST/Crizal Rock, MiYOSMART iQ/Clear/S.P.A.R.K., and MyoActive/Platinum UV. All three default to two paid RM120 follow-ups and no frame, giving totals RM1,540, RM1,940 and RM2,040.

Comparison selections are deduplicated in selection order and limited to three valid options. Invalid option IDs cannot resolve inherited object properties or unofficial prices. The registry is immutable; the quotation calculation resolves the registered price even if an external object supplies a different amount.

One consultation shares frame and follow-up choices. Lens selections stay brand-specific and convert back to the exact original child-app state. Frame values, complimentary states and individual follow-up selections are normalized without modifying the input or product data.

## Preserved commercial and clinical distinctions

- Stellest and Stellest 2.0 retain the 6-month, at-least-0.75 D prescription-power condition.
- Original MiYOSMART retains the 6-month, at-least-0.75 D sphere-power condition; iQ retains the 1-year, at-least-0.50 D sphere-power condition.
- MyoActive retains the 1-year, at-least-0.50 D prescription-power condition.
- Study outcome, reported result, duration, comparator, study ages, wearing condition and source remain separate fields. The original Stellest 67% result retains its two-year/single-vision/at-least-12-hours context. Stellest 2.0's about-47% result retains its different endpoint, original-Stellest comparator and crossover context.
- Original MiYOSMART's absolute differences remain marked as calculated from the supplied trial chart.
- No clinical efficacy rank, winner or eligibility decision is produced.
- The source brochure path for ZEISS targets its sole standard RRP PDF. No removed ZEISS reference PDFs were restored.

## Verification

`node qa/verify-comparison.cjs` passed:

- 15 source-derived commercial choices.
- 225 ordered comparison pairs and 3,375 ordered triples, including duplicate-selection cases.
- 1,440 financial cases across all options, six frame values, complimentary states and independent follow-up selections. HOYA and ZEISS totals also match their native calculation functions.
- Exact native selection round-trips, source-data fidelity, separate warranty basis/threshold/period, invalid input handling, read-only product data and valid local brochure targets.
- Browser-global and CommonJS catalogue equivalence.

Results are recorded in `qa/comparison-verification.json`. This review verifies the data/calculation contract; root integration tests cover bridge, UI transitions and printing coordination. Live browser geometry and physical printing are not established by these checks.

## Parent-role feedback

The role-play raised a vocabulary issue rather than a data defect: `sphere power` needs a short explanation in the consultation UI as the main lens power, separate from astigmatism. The exact warranty basis must remain visible and must not be replaced by spherical equivalent.

The checked role-play totals are RM1,740 for original STELLEST/Rock or original MiYOSMART/Clear/STX with an RM200 frame and two paid follow-ups, and RM2,140 for MiYOSMART iQ/Clear/S.P.A.R.K. with the same additions.
