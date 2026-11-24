# Maxiview Myopia Catalogue R1.4 verification

23 November 2026

## R1.4 refinements

- Compare centres all three clickable brand logos and hides the side navigation and Compare button. Selected brands appear first in full colour; unselected brands follow on the right in a faded style. Each logo returns to its catalogue and restores the two alternative logo tabs plus Compare.
- Only brands with selected lenses appear in the table. All eight subsets of the three brands are checked, including zero, one, two and three selected brands. Change lens remains mapped to the correct brand when preceding columns are omitted.
- Replacement descriptions use HOYA-style Sphere power wording consistently. The displayed periods and numeric thresholds are unchanged. Source data, native quotation calculations and original print commands remain intact.
- The extra ZEISS brochure card shown in the owner's screenshot was removed from the information panel. The genuine supplied PDF remains unchanged and available from comparison brochure links.

## Implemented consultation flow

ZEISS opens by default. No lens is initially selected in any embedded catalogue. Lens selection highlights and the floating selected-price / Review summary bar are suppressed until a deliberate choice. Native option-list prices remain available. Shared frame/follow-up updates, initial loading and current-state scans cannot select a default lens or open a summary.

Compare reads the current deliberate choice from each of Essilor, HOYA and ZEISS. It includes only selected brands; unchosen brands have no table column, specifications, price or Review action. Choose/Change lens is restricted to that brand and updates its native selection. Cancel preserves the previous state. Brand names appear once, followed by the complete model/style/coating. Fresh scans do not render or navigate the native app. Older scan replies cannot overwrite a newer explicit choice.

One shared header replaces duplicate native headers. The selected brand logo is centred, with smaller faded logo buttons for the other two brands and Compare at the right. The selected brand's side button is hidden. The information button is on the left; a back button appears for native summaries. In Compare, the three clickable centred logos replace the single-brand title and side tabs. Controls retain 44px targets. Tablet/desktop uses a 60px header; narrow screens use a two-row fallback to prevent overlap. Responsive geometry was reviewed statically.

Follow-up charges and controls remain absent from Compare, including displayed lens/frame prices. Follow-ups are discussed in the original summary after choosing a lens. Native quotation calculations, complimentary states, strike-through amounts and label rendering are preserved.

## ZEISS brochure replacement

The previous one-page ZEISS attachment was replaced with the exact owner-supplied six-page MyoActive_RSP Nov 26 (1).pdf. It is the only PDF in catalogues/zeiss/assets and is used by all existing brochure links. No alternate or dummy ZEISS PDF is bundled.

- SHA-256: a73590da48f01afb8d6dd41cb45f585f7c9df5bb2b74af776785f8727e079ebd
- Size: 1,080,227 bytes
- Pages: 6

All six pages rendered and were visually inspected. The supplied content is unchanged. The redundant native ZEISS brochure-link card is removed; the comparison opens the genuine supplied PDF. overrides.json records these authorized exceptions to the source release. The earlier standard-RRP-only instruction is superseded by the owner's new attachment instruction.

## Checks

- Source-derived data: 15 options, 225 ordered pairs, 3,375 ordered triples and 1,440 financial permutations passed.
- Integration: all 15 exact native summary handoffs passed; 60 quotation/guarantee/booklet/extension label commands matched unbridged source rendering byte for byte.
- Current-selection tests cover initially unselected catalogues, no premature price bars/summaries, logo switching, information/back forwarding, all 15 native selections and all 15 brand-restricted Change options, cancellation, fresh read-only scans, late replies, unvisited-catalogue loading, follow-up price exclusion and reading/focus restoration.
- Deterministic geometry fixtures cover pinned identity alignment, horizontal clipping, section bounds, text-height changes, expanded sections and retained reading anchors. They do not establish live device rendering.
- Source/package checks verified 72 source files against the input ZIPs, allowing one bridge reference per native HTML, the approved ZEISS brochure-label edits and the exact supplied PDF replacement. All native product data, app logic, styles and printer code remain unchanged. Twenty-one original assets are unchanged; one PDF is the authorized replacement.
- All local links resolve. Five bundled PDFs and 40 pages open/render. Semantic comparison rows align, all replacement period/basis/threshold fields remain visible, and pinned copies contain no interactive controls.
- Three simulated print locks, original transmit bytes and native scroll restoration passed. Invalid message senders are rejected.

The comparison fixture shows STELLEST / Crizal Rock at RM1,300 per pair and RM1,500 with an RM200 frame. Its native summary remains RM1,740 when two RM120 visits are included after lens selection. Compare never includes those visit charges in its displayed prices.

## Sources and rollback

The underlying releases remain STELLEST R1.33, HOYA R1.6 and ZEISS MyoActive R1.6, with exact hashes recorded in sources.json. The new authorized brochure is recorded separately in overrides.json. Keep MAXIVIEW_MYOPIA_CATALOGUE_R1_3.zip for rollback. Older reviews and standalone release notes describe their respective historical versions.

## Scope of validation

Checks executed actual application scripts with an in-memory DOM, postMessage queues, deterministic geometry fixtures, real canvas label rendering and simulated BLE. Live browser geometry, iPad touch and physical printing remain unverified. Previously blocked browser routes were not retried.

Detailed machine-readable results are in qa/comparison-verification.json, qa/integration-verification.json, qa/shortlist-verification.json, qa/pinned-headings-verification.json and qa/package-verification.json and qa/r14-verification.json.
