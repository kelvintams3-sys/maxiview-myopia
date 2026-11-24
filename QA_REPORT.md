# R1.18 — screen styling on the supplied R1.15 printing baseline

Built from the actual R1.15 ZIP attached by Kelvin in this request. Its entries were compared with the retained R1.15 archive and match exactly. Only the agreed screen files and corresponding screen tests were ported. The R1.16 print-logo change, authorization record and changed logo validator were not ported.

Every printer.js, print asset, original checksum manifest, printer-lock validator and bridge.js remains byte-identical to the supplied archive. The original qa/verify-locked-output.cjs and captured label baseline remain unchanged. Native print overlays, script-loading attributes and printer-related inline handlers are checked against the supplied archive. No print-logo colour or printer protocol changes are permitted in this release.

Screen scope: the five agreed model palettes carry through product cards, native/cross-brand comparisons, pinned headings and summaries. The chooser and selected footer have small model cues. Replacement terms have a fixed blue-grey treatment and bold period/threshold; model identity and explicit selection remain separate. Product data, prices, clinical references and commercial replacement conditions are unchanged.

Verification covers 645 exact original label outputs, 600 financial handoffs, 15 selected routes, 45 comparison identities, 15 chooser identities, 20 contrast calculations, all eight selection subsets, 24 brand-return cases and 13 pinned-heading geometry fixtures. Original comparison checks cover 225 pairs, 3,375 triples and 1,440 financial cases. Native HOYA and ZEISS checks exercise pricing, state transitions and simulated Bluetooth. Actual completed counts are in the generated verification JSON files.

No browser was launched, in accordance with the project instruction not to retry the previously blocked browser routes. Layout/interaction checks are static or simulated, colour checks are calculations, and no physical printer was available. No claim is made that the earlier silent printing failure has been reproduced or its cause established. This release preserves the user's supplied working print baseline exactly.

Rollback: restore the complete supplied R1.15 archive.

## R1.15 validation — retained history

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
