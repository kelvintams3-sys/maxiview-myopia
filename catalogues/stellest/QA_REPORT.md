# Stellest R1.33 verification

Baseline: STELLEST_CATALOGUE_R1_32.zip.

- JavaScript compilation/execution passed.
- 256 financial cases matched the approved prices and totals.
- All four lens/coating choices retained product identity, complete study conditions, specifications, guarantee terms, focus and edit-return state.
- Comparison hide/show preserved selection and totals.
- The separate footer showed on catalogue and hid on summary. It is a sibling of the scroll region, not its descendant.
- Scrollbar gutter measurement and navigation scroll resets passed in simulation.
- The fallback paired measured row heights and cleared imposed heights when cards stacked. This is a simulated function check, not a live old-browser test.
- Customer pages contain no source-warning badges, generic disclaimer footnotes or decorative mechanism numbering. Product data remains identical to R1.32. Source notes remain in expandable optometrist references.
- Structural checks found matching data-align keys across both products: seven clinical rows, nine family rows and two rows across each of the three mechanism cards. The semantic comparison retains 11 shared feature rows.
- Frame entry/removal, individual follow-up selections and 850 ms complimentary controls passed.
- 16 real-canvas label-command cases matched R1.32 byte for byte. The complete printer-code section and all 10 original assets are unchanged.
- Six simulated printer lifecycle cases passed, including errors and restored buttons.
- Local links resolve and generated content has no duplicate IDs. CSS delimiters are balanced.
- Two design agents reviewed the screenshots and final source. They found no remaining blocking structural/content issue.

Live browser rendering and physical Bluetooth printing were unavailable. Native subgrid geometry, zoom and touch behaviour still require a device check; the regression harness does not model browser layout. No screenshot of the new release is claimed.

Results: qa/verification.json. Re-run: node qa/verify.cjs [path-to-R1.32-index.html], with @napi-rs/canvas.
