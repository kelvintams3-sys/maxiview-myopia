# R1.17 consistent model styling — 24 November 2026

Implemented the approved palettes in one shared stylesheet: Stellest teal, Stellest 2.0 navy/blue, original MiYOSMART HOYA blue, iQ amber/dark blue, and MyoActive deep navy/cobalt. Model identity is carried through cards, native and cross-brand comparison headings, pinned headings and summaries. Chooser/footer accents remain restrained; model colour is separate from selection. Replacement panels use the same blue-grey treatment across brands, with period and threshold emphasis. Screen additions exclude print overlays.

Verified all 15 selected routes, 45 comparison identities, 15 chooser identities, 20 colour-contrast pairs, and unchanged initial no-selection behaviour. The full chosen style/coating stays visible in headings and summaries. Chameleon (Photochromic) is sourced from HOYA's native label function in both views. Existing tests cover deliberate selection, stale replies, shared frame/follow-up choices, focus, scroll, all eight selection subsets and 13 pinned-heading geometry fixtures. All pass.

Passed the original 600 financial handoffs and 645 label checks (559 unchanged original outputs and 86 retained R1.16 ZEISS logo-only differences), plus 60 integrated/native label comparisons and three simulated Bluetooth transmissions. All R1.16 printer files, print assets, manifests, product data and bridge.js are byte-identical. The original native CSS rules are retained as a prefix, with scoped screen rules appended. Native HOYA 794 and ZEISS 154 checks pass. Root comparisons pass 225 ordered pairs, 3,375 ordered triples and 1,440 financial cases.

Package checks validate original print overlays and script attributes, local links, official assets, JavaScript syntax and CSS structure. No browser was launched because the project instructions prohibit retrying the previously blocked browser routes. DOM/geometry tests are simulated; colour checks are calculations. These do not establish actual iPad wrapping or touch layout. Review product cards, a three-brand comparison, pinned headings and the chosen-model summary in Bluefy.

Rollback by restoring the complete R1.16 package. No prices, commercial replacement conditions, official brochure graphics, print artwork or Bluetooth routines change in R1.17.

## R1.16 black-on-white print logos — retained history

Kelvin explicitly requested black logos on white across all printouts. All brand/type combinations were inspected. Essilor and HOYA already use positive artwork and are unchanged. The 48 × 48 ZEISS logo constant shared by quotation, guarantee, booklet and extension labels was inverted; its footprint is unchanged.

The original PRINTER_SHA256.json manifests and captured label baseline remain unmodified. ZEISS's explicit PRINTER_LOGO_AUTHORIZATION.json records the original and approved hashes and bitmap values. Its checker verifies the exact inversion and reconstructs a source file matching the original frozen hash, proving all non-logo printer bytes remain unchanged. An unrelated edit is rejected.

Passed: all three printer checks with the explicit ZEISS authorization; 60 brand/option/type outputs (52 unchanged Essilor/HOYA outputs and eight ZEISS outputs differing only in the 48 × 48 logo); 600 original financial handoffs; 559 exact original label byte matches plus 86 ZEISS logo-only changes; 15 integrated lens handoffs, 60 integrated/native label comparisons and three simulated Bluetooth transmissions. Visual review covered all 12 brand/type previews and the enlarged ZEISS logo.

For every changed output, decoded printer pixels outside the original logo are identical, and the logo now has black lettering on a white field. Bluetooth functions, service identifiers, chunk sizes, timing, label dimensions, text and prices are preserved. R1.15's working local Bluetooth permission change is preserved. No live browser or R1.16 physical print test was performed.

Rollback: restore the complete R1.15 package. No screen palette proposals are implemented in R1.16.

## R1.15 local Bluetooth test — retained history

User reports that the working catalogues print on iMac and Bluefy, but the combined catalogue fails with a Bluetooth permissions-policy error when opening `index.html` directly. The suspected cause is the local-file origin matching of the embedded brand frames; this has not been reproduced in a live browser here.

The only behavior change is in `hub.js`: for `file:` pages the three fixed brand frames receive `allow="bluetooth *"` before insertion. HTTP/HTTPS pages keep `allow="bluetooth"`. This changes frame permission delegation, without granting a device or changing any Bluetooth or printer routines. The original `bridge.js` and every file under `catalogues/` are byte-identical to R1.14, including the printer files, manifests, markup and artwork.

Rerun checks passed: JavaScript syntax; all three printer locks; actual hub initialization in four location contexts with all three brand frames; 15 lens handoffs; 60 label-command byte comparisons; shared-state and reading-position checks; three simulated Bluetooth transmissions and navigation locks; eight selection subsets and 24 brand-return cases.

Live browser and physical printing were not tested. Extract into a fresh folder and open its root `index.html`. Test one quotation per brand, then the guarantee, booklet and extension labels. If the policy error remains, retain the confirmed standalone catalogues for printing and report the exact error. Restore the complete R1.14 package to undo this test; never mix release folders.

The Permissions Policy draft describes the implicit `src` allowlist and explicit wildcard matching: https://w3c.github.io/webappsec-permissions-policy/#allowlists . This supports the targeted change, but does not establish success on the user's devices.

## R1.14 validation retained for reference

Passed the three untouched printer-lock manifests, 600 summary/financial handoffs against the independent original locked catalogues, and 645 exact label-command comparisons covering all 15 choices and all four label types. Covered absent/paid/complimentary frames, each visit selection and complimentary follow-ups.

The full comparison suite passed: 225 ordered pairs, 3,375 ordered triples and 1,440 financial cases. The existing integration, selection, 13 pinned-heading scenarios and eight selection-subset checks passed, including three simulated Bluetooth transmissions and navigation locks. Native HOYA (794) and ZEISS (154) checks passed. All three content ports render without runtime errors in the in-memory DOM and their previews open through the original handlers.

Package validation checks the native print overlays and script order/attributes against the original locked archives, protected bytes, official assets, local links, five PDFs/40 pages, JavaScript syntax and CSS structure. See qa/package-verification.json for the result.

Live browser geometry, touch gestures on an actual iPad and physical printer transmission were not tested. The next device check is one quotation, guarantee, booklet and extension label per brand. If printing fails, restore the original PRINT_LOCKED baseline or the previous combined R1.4 package.
