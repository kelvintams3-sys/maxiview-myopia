# R1.6 standard RRP attachment validation

- The sole ZEISS PDF is the supplied one-page 2026 Trade & RRP - MyoActive(3).pdf, renamed assets/myoactive-brochure.pdf inside the package.
- Byte-for-byte comparison against the original upload passed.
- The (i) control opens the information panel in simulation; its sole PDF link resolves to the bundled RRP file and requests a new tab.
- The prior RSP brochure, white paper and overview PDF files/links are removed.
- All current local PDFs across Stellest, HOYA and ZEISS opened and rendered: five PDFs, 35 pages. The three primary brochures match their original uploads exactly; the Stellest practitioner guide also matches.
- Existing MyoActive checks passed: 154 checks including 128 financial permutations.
- App, product data, comparison renderer and positive-logo printer code are unchanged from R1.5.
- Live browser navigation was not tested; PDF integrity, package paths and information-panel actions were tested locally/in simulation.

Results: qa/brochure-verification.json.

## Earlier print-logo verification (still applicable; printer code unchanged)

# R1.5 positive print-logo validation

- 154 existing automated checks passed.
- 8 real-canvas label variants passed positive-logo checks across all four output types.
- Decoded TSPL bytes match every physical-raster pixel. Preview and decoded logos both have black foreground on white.
- ZEISS changes are confined to its logo mask and explicit white-background drawing. HOYA retains its positive mask and makes the background explicit.
- No preview pixel outside the ZEISS logo region changed. HOYA output is byte-identical to its baseline.
- All assets, product data, app controls, layout styles, header/text layout, label rotation, raster encoder and Bluetooth transport are unchanged.
- Physical Bluetooth printing was not tested.

Results: qa/verification.json and qa/print-logo-verification.json.

## Previous release record (historical)

# R1.4 validation

- 154 existing automated checks passed, including 128 pricing permutations, state transitions, comparison rendering, TSPL raster roundtrips and simulated Bluetooth transport.
- `printer.js`, `catalogue-data.js`, `comparison.js` and the integration export are byte-identical to R1.2. Pricing, guarantee thresholds/periods and printing logic are preserved.
- All local HTML source links resolve; the bundled original brochure is byte-identical to the supplied six-page PDF. Existing clinical white paper and one-page overview remain bundled.
- Source brochure pages 3–4 were rendered and visually inspected; white-paper first-year findings were checked on pages 3–8. `SOURCES.md` maps the restored points and necessary qualifications.
- Brochure access uses existing information controls; professional study details use a keyboard-focusable native disclosure.
- Live browser preview was unavailable in this execution environment. Automated DOM/canvas/Bluetooth checks use simulated harnesses; they do not verify live browser geometry or hardware output. Physical Bluetooth printing requires the actual printer; no physical test was performed.

- R1.4 visually rechecked supplied ZEISS brochure pp1,4 and restored its efficacy-positioning and 100% eye-growth claims as attributed, flagged information. All JavaScript, data, integration and printer assets are byte-identical to R1.3.
