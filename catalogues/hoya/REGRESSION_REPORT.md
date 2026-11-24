# R1.6 print-logo regression

Baseline: HOYA_MIYOSMART_IQ_CATALOGUE_R1_5.zip.

36 actual-canvas label variants passed. All original assets, catalogue data and consultation controls are unchanged. From drawLabelHeader() onward, printer.js is byte-identical to the baseline: text placement, totals, guarantee wording, rotation, binary polarity and BLE behaviour are preserved.

ZEISS uses the positive version of its existing mask. HOYA already used a positive mask; its output remains identical with an explicit white-background renderer.

Physical printing was not tested. Restore the complete R1.5 release for rollback.

## Previous regression record (historical)

# Before-and-after regression review — 21 November 2026

Compared with `HOYA_MIYOSMART_IQ_CATALOGUE_R1_3.zip`.

- All 9 available product/coating combinations were checked.
- 576 pricing, frame, follow-up, complimentary and summary-control combinations matched the prior release.
- 36 label-command cases matched the prior release for quotation, guarantee, booklet and extension outputs.
- All 6 existing source assets are byte-identical. Existing printer functions, label bitmaps and Bluetooth transport logic are unchanged.
- Source PDF links resolve to valid bundled PDFs. Original source PDFs are included unchanged.
- Core calculations, summary controls and printing functions remain unchanged. Existing catalogue specifications are retained.

The comparison used a JavaScript VM with simulated DOM and canvas. Existing separate catalogue checks also cover their documented simulated printer transport and raster cases. Live browser geometry and physical Bluetooth printing were not tested. Source pages were visually inspected; application layout was reviewed from the HTML/CSS. No live deployment was changed.

## Rollback

Restore the prior catalogue ZIP, or the prior saved file version, and replace the complete hosted catalogue folder. Each release retains its own source map and verification report.
