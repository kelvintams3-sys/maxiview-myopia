# R1.6 positive print-logo validation

- 794 existing automated checks passed.
- 36 real-canvas label variants passed positive-logo checks across all four output types.
- Decoded TSPL bytes match every physical-raster pixel. Preview and decoded logos both have black foreground on white.
- ZEISS changes are confined to its logo mask and explicit white-background drawing. HOYA retains its positive mask and makes the background explicit.
- No preview pixel outside the ZEISS logo region changed. HOYA output is byte-identical to its baseline.
- All assets, product data, app controls, layout styles, header/text layout, label rotation, raster encoder and Bluetooth transport are unchanged.
- Existing real-artwork checks also passed for 36 variants and 378 text runs with no out-of-bounds text; six simulated printer-lifecycle cases passed.
- Physical Bluetooth printing was not tested.

Results: qa/verification.json and qa/print-logo-verification.json.

## Previous release record (historical)

# R1.5 validation

- 794 existing automated checks passed: 576 pricing permutations, 81 comparison pairs, 81 app transitions and 36 label cases, including gesture handling, label cache, TSPL and simulated Bluetooth.
- Six existing printer-lifecycle checks passed with simulated BLE.
- Actual canvas rendering passed for all 36 labels and physical rasters, with 378 text runs and no out-of-bounds text.
- `printer.js` is byte-for-byte identical to R1.3 (SHA-256 `173651f511c58f3cdea373585bd8f2c657736cc8e02d2dc64776a541c41b588e`). All print art, transport, quotation calculations and warranty criteria are preserved.
- Original PDF pages 3–10 and 12 were visually inspected for the restored copy; source-to-copy mapping is in `SOURCES.md`.
- The original brochure is included unmodified and opens through (i) → Original HOYA trade brochure. The existing clinical summary remains directly accessible.
- Both separate sphere-only replacement policies and integration export copy are retained. No eligibility or package entitlement logic changes.
- Application layout was reviewed from HTML/CSS. Live browser geometry could not be tested in this workspace. No physical printer test was performed.

- R1.5 content-preservation audit found no existing HOYA specification removed because of uncertainty. All application code, data, controls, assets and customer copy are byte-identical to R1.4, apart from release metadata. The shared preserve-and-flag instruction is now bundled in AGENTS.md.
