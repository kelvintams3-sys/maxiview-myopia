# R1.23 — Chameleon and quotation row size

25 November 2026. Kelvin's latest request adds larger Chameleon wording and very slightly larger items/prices to the logo-only update. HOYA's Chameleon style line is now 22 px in portrait and landscape label headers; Clear retains its original size. Every brand's quotation row labels and amounts increase from 20 to 21 px. Titles, totals, coordinates, commercial data, row selections and strikethrough formulas remain unchanged. R1.22's black-on-white ZEISS bitmap is retained.

PRINT_ARTWORK_AUTHORIZATION.json records nine exact replacements across three native printer files (including the retained bitmap). Reversing only these replacements reconstructs the complete original printer sources to their unchanged manifest hashes. A transport mutation is explicitly tested and rejected. All bridge, button-progress, UI/script interface, artwork asset and other runtime files remain byte-identical to confirmed R1.21, apart from release metadata and the approved printer artwork inputs.

Completed artwork checks cover 120 label cases across 15 options with normal and five-digit frame amounts; 96 full preview pixel comparisons; 24 byte-identical static Essilor landscape labels; 120 row/price fit checks; and 14 freshly rendered Chameleon line checks at 22 px. Pixel differences are confined to quotation row text, the Chameleon line and the ZEISS logo. The original 645 captured label hashes remain reproducible from reconstructed frozen code, and all 600 current financial handoffs retain their original totals. Source manifests and baseline captures are not rewritten.

The 36 native-versus-bridged BLE sequence checks, setup timeout/retry suite, 12 active-button transfer checks, integration, native HOYA/ZEISS and package checks pass. Updated HOYA Chameleon, ZEISS and Essilor quotation previews were visually inspected. No browser or physical printer was used here. R1.21 remains user-confirmed for physical printing; R1.23 artwork still needs its first device check. Rollback: complete R1.22 for logo-only output or confirmed R1.21 for the earlier artwork.

## R1.22 — black-on-white printed ZEISS logo only (history)

25 November 2026. Kelvin confirms R1.21 prints and explicitly requests only the logo polarity change. The single runtime printer-source change is the 288-byte ZEISS_LOGO_HEX bitmap inversion. It changes white lettering on black to black lettering on white in all four MyoActive label types. Essilor and HOYA already use positive artwork and are unchanged. The original letter shapes, size and drawing location are retained.

The whole original ZEISS source is reconstructed by restoring that one constant and checked against the unchanged original PRINTER_SHA256.json. Every other printer-source byte therefore remains identical, including all Bluetooth, rasterization, chunking, pacing and disconnect code. bridge.js, print-feedback.js/CSS, native overlays/script attributes, screen logos/assets and the complete Essilor/HOYA printer files stay byte-identical to confirmed R1.21. The authorization record is explicit; original manifests and captured label baselines are not regenerated.

Decoded output checks compare all pixels, requiring exactly 2,304 inverted pixels in one 48x48 ZEISS logo region and no changes elsewhere. All four label types and both ZEISS coatings are checked. The original captured-label suite also audits the logo-only delta across its financial/label permutations while retaining all original expected hashes for reconstructing the baseline. All 600 financial handoffs remain unchanged. Current completed counts appear in qa/print-logo-verification.json and qa/locked-output-verification.json.

The confirmed sequence is exercised in 36 native-versus-bridged BLE traces, with all four label types, both write APIs and optional-notification rejection. Existing setup timeout/retry, button-progress, integration, native brand and package checks are rerun. The rendered quotation and guarantee previews were visually inspected, together with existing HOYA/Essilor examples. No browser was launched and no physical printer was available for this update. R1.21 physical success is user-reported; R1.22 still needs its first device label. Rollback: restore the complete confirmed R1.21 ZIP.

## R1.21 — Print Label button progress (history)

25 November 2026. Kelvin confirms that R1.20 physically prints. This release adds a screen-only print-feedback helper and stylesheet after the existing scripts/styles in each brand. The confirmed bridge.js, native printer.js files, logos/artwork, manifests, native overlay markup and all original script attributes remain unchanged. Bluetooth operations, chunk bytes, pacing, activation and disconnect are not modified.

The primary button reads Print Label in all three brands. The actual active label button fills from native progress, while the separate busy status/percentage card is hidden. Guarantee, booklet and extension names remain descriptive and receive the same button progress. Errors remain visible; success reads Label sent to printer. Progress resets on a new attempt or preview; accessible progress and reduced-motion handling are included.

New UI checks run real native label generation/transfers against a paused simulated BLE characteristic. They cover 12 partially complete transfers (all four label types across three brands), 12 duplicate taps, three failed-send recovery cases and three preview/idle resets. The current sequence suite still passes 36 exact baseline API/UUID/chunk-byte/pacing/disconnect comparisons. All original label, financial, lock, connection, integration, screen and package checks are rerun. See qa/print-feedback-verification.json and the other current result files.

No browser was launched and no physical printer was available for this UI update. Physical R1.20 success is user-reported; R1.21 checks here are static/simulated. Rollback is the complete confirmed R1.20 package.

## R1.20 — restore R1.15 activation and direct writes (history)

25 November 2026. Kelvin confirms the extracted R1.19 folder reaches 100% without producing a label, whereas R1.15 still prints. R1.19 removed FF03 discovery/startNotifications and wrapped the FF02 characteristic's write methods. The new correction restores FF03 activation in the baseline order and returns the native characteristic directly. This is a targeted repair based on the reported regression; its physical cause has not been established here.

The setup guard retains 20-second connect, 10-second service, and 8-second characteristic-discovery/notification-activation deadlines. It no longer wraps individual writes. Native chunk size, pacing, bytes, final delay/disconnect, labels and logos remain unchanged. A setup timeout stops before any write. Explicitly rejected optional notification operations are tolerated as in the native baseline.

The new baseline-sequence suite passes 36 exact API/UUID/chunk-byte/pacing/disconnect comparisons against unmodified native printer.js protected by the original R1.15 manifests: three brands, four label types and three transport cases (without-response, legacy write and notification rejection). Native write methods receive their actual characteristic as this. The revised setup suite passes 18 successful sends, 15 stalled setup stages, 15 fresh retries, three tolerated notification-rejection cases, three native-characteristic identity checks, three late-connect ownership cases, three chooser/duplicate-tap cases, nine error cases and six standalone cases.

All 645 independent original label-output comparisons and 600 financial handoffs are rerun, together with all original screen, comparison, native brand, integration, lock and package checks. These are static/simulated checks; no live browser or physical printer is available. Browser send progress does not establish a physical print. The first device test remains one MyoActive quotation from the fresh R1.20 folder. Supplied R1.15 is the confirmed fallback.

## R1.19 — connection guard after the reported Connecting hang (history; superseded)

25 November 2026. The reported endless Connecting state has not been reproduced against physical hardware. Source inspection found unbounded GATT connect/service/channel promises and an awaited optional notification subscription before the first label write. The same visible status can also precede a stalled first write. R1.19 addresses these failure paths in bridge.js, without changing any native printer source or printed output.

The connection guard skips unused notification setup, bounds connect at 20 seconds, service preparation at 10 seconds, channel discovery and individual writes at 8 seconds, and retains unbounded user time in the chooser. Failed attempts clear the cached handle and release controls. Late abandoned completions cannot resume label sends; retries remain deliberate to avoid duplicate labels. Both embedded and standalone flows use the guard.

New simulated tests pass for 18 successful label transmissions across all three brands and four label kinds, 12 stalled-stage cases, 12 fresh retries, three partial-send recovery cases, three late-connect ownership cases, three chooser/duplicate-tap cases, nine cancellation/unsupported-context/connection-rejection cases and six standalone success/failure cases. The test characteristic would hang forever if notification setup were requested. Both native write APIs, cached devices and already-connected GATT are covered. See qa/connection-guard-verification.json.

The unchanged printer-lock checks pass for every native printer.js and protected artwork. The independent original baseline still passes all 645 exact label-output comparisons and 600 financial handoffs. Screen, comparison, native brand, integration and package checks are rerun. No live browser was launched and no physical printer is available; these checks do not prove the user's hardware now prints. The first device test is a quotation, followed by the other label types if successful. A stopped send may leave a partial label; inspect before retrying.

R1.19 preserves all R1.18 styling and supplied R1.15 print logos. Rollback: restore complete R1.18 for previous connection behavior, or supplied R1.15 for the original screen/print baseline.

## R1.18 — screen styling on the supplied R1.15 printing baseline (history)

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
