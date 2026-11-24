# Essilor Stellest Catalogue — R1.33

Maxiview Stellest catalogue with paired content rows, unnumbered explanation cards and a persistent summary footer that reserves its own space below the scrolling catalogue.

## Install

Extract this ZIP and upload all contents to the existing Stellest catalogue folder. Keep `index.html`, `design.css` and `assets/` together. No build or installation is required. Use HTTPS and Bluefy/WebBLE on iPad for AIMO D520BT-Z printing.

## Consultation flow

1. Essilor header and the existing child hero image.
2. Three explanations: clear vision, treatment-light region and everyday Airwear properties.
3. Separate clinical cards retaining each result's outcome, comparator, duration, participants and primary-paper link.
4. STELLEST and STELLEST 2.0 lens/coating cards with prices and the existing replacement condition.
5. A detailed comparison table, open by default, with shared feature rows. Hide/show preserves the selection.
6. A persistent selected-lens price footer with Review summary, outside the scrolling content.
7. The existing frame, follow-up, complimentary and printing controls on the summary.

Original brochure: top-right **(i) → Original Stellest brochure**. Optometrist references, study limitations and source-confirmation context remain in the same panel.

## Preserved content and behaviour

- STELLEST: 1,021 lenslets and 11 rings.
- STELLEST 2.0: 1,190 lenslets, +169 versus STELLEST and 12 rings. Source status is retained under expandable Optometrist references; customer pages show the specifications without warning badges.
- The complete lenslet-design explanations and wider-diameter/frame benefit remain in the table.
- Both studies retain their different endpoints, comparators, durations and conditions.
- Crizal Rock / Prevencia prices per pair: STELLEST RM1,300 / RM1,400; STELLEST 2.0 RM1,700 / RM1,800.
- Complimentary replacement if prescription power becomes at least 0.75 D more short-sighted within 6 months.
- Optional frame, two individually selectable RM120 biometry follow-ups, long-press complimentary controls and struck-through original prices.
- All four existing print outputs: quotation, guarantee, booklet and biometry follow-up extension.
- All original assets, source PDFs, label-generation code, bitmaps and Bluetooth transport are unchanged from R1.32.

## Verification

256 financial cases, 16 before/after label-command cases, four lens/coating selections, comparison visibility, edit-return state, focus restoration, frame entry/removal, 850 ms complimentary holds and six simulated printer lifecycle cases passed. Dedicated-footer visibility, scrollbar-gutter measurement, navigation scroll reset and alignment-fallback transitions also passed in simulation. Real canvas rendering was used for print-command comparisons.

HTML structure, shared mechanism/clinical/product rows, local links and all 10 original assets were checked by automated checks and two independent design reviews. Live browser preview is blocked in this workspace; responsive layout was reviewed statically. Physical Bluetooth printing was not tested.

Re-run with Node.js and `@napi-rs/canvas`:

```sh
node qa/verify.cjs
```

Pass the extracted R1.32 `index.html` as the first argument to include baseline print-byte and product-data comparisons. Recorded results: `qa/verification.json`.

## Rollback

Restore the complete R1.32 catalogue folder from the previous release or saved file version. This release updates standalone Stellest; it does not combine or modify the HOYA and ZEISS catalogues.

## R1.33 changes

- The summary footer occupies a dedicated page row, so guarantee text and the comparison control cannot scroll beneath it.
- Mechanism headings/text, clinical qualifiers/figures/explanations, and family headings/specifications/coating buttons/guarantees share their corresponding row heights on paired-column layouts.
- A measured-height fallback supports browsers without CSS subgrid and clears imposed heights when cards stack.
- Decorative 01/02/03 labels and visible source-confirmation badges are removed. Product counts, the +169 comparison, study conditions, prices and guarantee terms remain.
- Generic disclaimer footnotes are removed. Detailed study and source references remain under (i).
