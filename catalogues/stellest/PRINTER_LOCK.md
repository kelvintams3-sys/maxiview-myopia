# Frozen printer baseline

Source: STELLEST_CATALOGUE_R1_32_PRINTER_TEST.zip
Physical printing confirmed by user. Stellest R1.32: all four label types passed.

## Mandatory rules
- Never edit, reformat, replace, merge or relocate printer.js without explicit approval.
- Preserve script loading order and attributes, print overlay markup, event handlers, printer-facing state and pricing interfaces, label artwork, Bluetooth lifecycle, UUIDs, transmission parameters, and label layouts.
- Do not change printer-related functions in other files or their calling contracts.
- Narration/content edits must be isolated from printing. Do not share a replacement printer implementation across brands.
- Before and after every update run `node qa/verify-printer-lock.cjs` from the catalogue root. A mismatch blocks release; never regenerate the manifest to hide a change.
- Review diffs for printer-facing dependencies not covered by whole-file hashes. Physical Bluefy printing must be retested after integration or changes near these interfaces.
- Roll back to this exact baseline if printing fails.

Printer SHA-256: `ee3a7824d80bfe81ca3a43e650054ac8a9e0d60d6b9fa880b443c5c70b939960`
