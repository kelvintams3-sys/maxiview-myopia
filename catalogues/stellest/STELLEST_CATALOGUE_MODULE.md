# Stellest Catalogue

## Purpose

Touch-first customer consultation catalogue that compares, builds and prints quotations for:

- STELLEST
- STELLEST 2.0

The application is a standalone static website. It does not alter or depend on ZIC.

## Design reference

The interface uses the shared Maxiview consultation design established by the HOYA and ZEISS catalogues, with Essilor branding:

- iPad-first portrait layout
- deep navy typography and navigation
- rounded white cards on a pale-grey background
- pale-blue Grand Total panels
- large touch targets and concise customer-facing copy
- prominent product identity in the summary and printout

## Product comparison

| Product | Technology | Rings | Study result shown with its conditions |
| --- | --- | ---: | --- |
| STELLEST | H.A.L.T. | 11 | Prescription progression: 67% average reduction over two years vs single vision, for children wearing lenses at least 12 h/day. |
| STELLEST 2.0 | H.A.L.T. MAX | 12 commercially | Estimated cumulative eye-length growth: about 47% less vs original Stellest in the separate one-year crossover trial. |

The different endpoints, comparators and study durations appear with each result. The primary papers are linked from the clinical cards and the information panel. Verified original Stellest count (1,021) is retained; the commercial 2.0 count of 1,190 and +169 comparison are retained. Source status is recorded under expandable optometrist references. The 12th commercial ring's broader-frame benefit is separate from the trial evidence, which tested two 11-ring designs.

## Prices

| Product | Crizal Rock | Crizal Prevencia |
| --- | ---: | ---: |
| STELLEST | RM1,300 | RM1,400 |
| STELLEST 2.0 | RM1,700 | RM1,800 |

Prices are per pair.

## Interaction rules

- The catalogue opens directly on the consultation page: hero, explanation, clinical findings, product/coating choices and detailed comparison.
- The Essilor logo appears in the header. The existing bright, undimmed child hero image appears with the tagline “Clear vision today. A brighter future tomorrow.”
- STELLEST and STELLEST 2.0 titles share one horizontal baseline.
- Two separate clinical cards retain the different study contexts. Lenslets, concentric rings, lenslet design, study results, coating prices and guarantee conditions align in a shared HTML table that opens by default. Hide/show preserves selection.
- Product cards retain the lenslet counts and +169 comparison without warning badges. A dedicated footer names the selected product/coating and opens Review summary. It reserves its own space outside the scrolling catalogue.
- Mechanism cards use unnumbered headings and text. Corresponding card rows share content-based heights when displayed in columns.
- All four lens-and-coating prices are selectable on the consultation page; there is no separate configuration page.
- Each product card shows a pale-amber box below its coating choices: “6 months · Complimentary replacement”, followed by “If prescription power becomes at least 0.75 D more short-sighted within 6 months.”.
- Frame and Biometry follow-up controls appear on Review Summary, not on the comparison page.
- Review Summary uses one consistent typographic hierarchy for section labels, item names and amounts.
- Review Summary uses compact card spacing; the main section text is larger while the two follow-up rows are deliberately quieter.
- Lens coating, frame and follow-up line-item prices use the same font size, weight and colour on Review Summary.
- Frame is optional and omitted when blank.
- Pressing and holding Frame toggles its entered amount to COMPLIMENTARY; the original amount remains visible with a strikethrough and contributes RM0 to the Grand Total.
- Biometry Follow-up 1 is RM120.
- Biometry Follow-up 2 is RM120.
- Each follow-up can be included or excluded independently.
- Pressing and holding the Biometry follow-up title toggles both follow-ups between their normal price and COMPLIMENTARY; RM120 remains visible with a strikethrough.
- Complimentary follow-ups contribute RM0 to the Grand Total.
- The summary updates immediately.

## Print output

- The quotation remains portrait. Its price, frame, follow-up and complimentary states are rendered into the same monochrome bitmap for both the on-screen preview and the printer, so the preview shows the actual sent artwork.
- The guarantee artwork is rendered as a positive-black monochrome image, rotated into the physical 40 × 60 mm raster before sending it to the printer. It does not depend on the printer rotating text or accepting a 60 × 40 mm stock size.
- The logo and selected STELLEST name occupy one line across the landscape guarantee. Its on-screen preview is generated from the same artwork used for the print bitmap.
- Printed labels use a positive black Essilor logo on white. The quotation uses a slightly smaller product name and price details with more spacing between the logo, product and item rows.
- Complimentary frame and follow-up entries retain their struck-through original prices on the printout without printing the word COMPLIMENTARY.
- The separate guarantee label reads: “6-Month Prescription Change Guarantee — If prescription power becomes at least 0.75 D more short-sighted within 6 months. Complimentary replacement.”
- The guarantee sentence uses smaller supporting text than the guarantee title.
- A third landscape booklet label appears below the first two labels and is reached by scrolling down. Like the guarantee, it is pre-rotated as a monochrome bitmap into the physical 40 × 60 mm printer raster, and its preview uses the same artwork.
- The booklet label includes unticked “Follow-up 1” and “Follow-up 2” boxes, with blank space for handwritten follow-up dates and no printed date lines.
- It states that further biometry follow-ups are RM120 per visit and repeats the six-month guarantee wording.
- The booklet guarantee title and supporting sentence are clearly separated, with slightly larger supporting text for readability.
- A fourth print option, “Print Biometry Follow-up Extension”, appears below the booklet label. It retains the booklet header, empty Follow-up 1 and Follow-up 2 checkboxes, blank handwritten date space and RM120-per-visit footer. The right-hand guarantee block is replaced with “BIOMETRY FOLLOW-UP EXTENSION”.
- The extension supports both products and uses the same pre-rotated 40 × 60 mm raster and positive-black polarity as the booklet. Its preview is rendered from exactly the same bitmap pixels sent to the printer.
- Browser printing is omitted.
- Supports AIMO D520BT-Z Bluetooth printing through Bluefy/WebBLE using the same FF00/FF02/FF03 channel pattern as ZIC.
- The print panel shows connecting, sending, success and failure status without closing after a print.
- Bitmap bytes are polarity-corrected for the D520BT-Z so all four labels print as black content on white stock rather than white content on black blocks.

## Files

    index.html
    design.css
    README.md
    qa/
    assets/
      essilor-logo.png
      stellest-hero.png
      guarantee-stellest.png
      guarantee-stellest2.png
      booklet-stellest.png
      booklet-stellest2.png
      extension-stellest.png
      extension-stellest2.png
      stellest-brochure.pdf
      stellest-practitioner-ifu.pdf
    trigger/
      deploy.txt

The original local brochure and supplied U.S. practitioner instructions are bundled. Primary clinical papers and the ANZ manufacturer press kit open externally. Tap the top-right (i), then Original Stellest brochure to open the local brochure. Practitioner references expand separately.

## Release checks

- The catalogue opens on the comparison page with no intro or configuration step.
- Both product titles and all four lens-and-coating choices display together.
- Coating prices match the 2026 list.
- Frame amount is included only when entered; a complimentary frame keeps its original amount struck through and restores that amount when toggled back.
- Follow-up totals calculate correctly in paid and complimentary states.
- STELLEST 2.0 study link opens the peer-reviewed paper.
- Summary and print label preserve the selected options.
- All D520BT-Z output remains physically 40 × 60 mm. The quotation is printed from its live preview bitmap. The guarantee, booklet and extension are pre-rotated into their transmitted bitmaps, including the logo and text; neither relies on the printer's text rotation.
- No customer or patient data is stored.

## Current release

2026-11-21-r1.33

R1.28 validation: both product cards contain the six-month replacement condition below their coating choices. JavaScript syntax and 64 combinations of product, coating, complimentary states and follow-up selections passed. Existing prices, label artwork and printer code are unchanged. Browser review of this update was unavailable because the preview browser could not reach the workspace.

## R1.29 — Standardised power warranty wording

Both product cards, guarantee labels and follow-up booklet labels use the HOYA sentence structure, with the existing 0.75 D / 6-month terms. Complimentary replacement is explicit. Preview images and embedded printer bitmaps were updated together and verified pixel-for-pixel. Prices, navigation, quotation labels, follow-up extension labels and Bluetooth transport are unchanged.

Validation: JavaScript syntax, 64 pricing permutations, all four revised static label previews against their encoded printer bitmaps, and unchanged-file checks passed. Browser review was unavailable because local Chromium startup was blocked. No physical printer test was performed.

## R1.30 — Brochure findings and direct source access

Restored the explanation of vision correction plus treatment light, child-relevant Airwear properties, study conditions, monitoring purpose and commercial 2.0 ring benefit. Each result names its measured outcome and study context; the unresolved 2.0 lenslet count is retained and visibly flagged for source confirmation. The original brochure opens at the top of the existing (i) panel; a separate expandable optometrist section retains study limitations and the U.S. IFU context.

Source-to-copy mapping is recorded in `SOURCES.md`. Prices, six-month/0.75 D replacement terms, summary calculations, controls, bitmap artwork and Bluetooth transport are preserved from R1.29. Previous ZIP is the rollback source. No live browser or physical printer test is claimed.

Comparison alignment: supported two-column browsers use nested CSS subgrid with one shared header row and six shared body rows, allowing paragraph wrapping to expand each corresponding section across both products. Existing flex layout is retained as fallback; mobile remains one column.


## R1.31 — Restore uncertain specifications and flag them

Restored Stellest 2.0’s 1,190 lenslets and +169 versus original Stellest. An amber “Lenslet count pending source confirmation” note accompanies the count on the comparison and other product/summary screens. Detailed uncertainty context appears under (i) → Optometrist references.

Content-maintenance rule: retain existing content when its source cannot yet be verified, attach a clear review flag and explain the uncertainty. Do not remove a specification solely because a reviewer cannot verify it.


## R1.32 — Visual refresh

The Essilor header, refined hero, three mechanism cards, separate evidence cards, lighter lens/coating choices, default-open comparison table and fixed summary bar follow the newer HOYA/ZEISS structure. Summary typography and touch targets are consistent across the catalogue. Existing detailed claims and uncertainty flags remain available. The original information panel, product data, all 10 assets and all printer functions are unchanged.

Verification: 256 financial cases, 16 before/after print-byte cases, six simulated printer paths and selection/focus/complimentary/visibility controls passed. Live browser preview and physical printing were unavailable. R1.31 is the rollback source. See README.md and QA_REPORT.md for installation and limits.


## R1.33 — Alignment and customer-facing cleanup

Moved persistent summary controls to a separate page-footer row, outside the scrollable catalogue. Native shared card rows and a measured-height fallback align corresponding content as text wraps. Removed decorative mechanism numbering, visible source-confirmation badges and generic disclaimer footnotes, retaining product numbers, detailed study conditions, prices and guarantee terms. Source notes remain under expandable optometrist references.

Two design agents passed the static patch review. Financial, label-byte, footer and fallback simulation checks passed; live browser geometry and physical printing were unavailable. R1.32 is the rollback source.
