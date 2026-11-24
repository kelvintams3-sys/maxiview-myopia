# Maxiview myopia catalogue: modifications made (23 Nov 2026)

Starting point: MAXIVIEW_MYOPIA_CATALOGUE_R1_4. Latest package: MAXIVIEW_MYOPIA_CATALOGUE_R1_13.zip.

Standing rules from Kelvin:
- Official brochure and IFU images only. No self-drawn diagrams.
- No "wear" or "follow-up / review" tiles on any brand.
- No cross-brand ranking. Results are 12-month group averages, with comparator and endpoint always stated.

---

## 1. ZEISS MyoActive (catalogues/zeiss)

Source: MyoActive_RSP_Nov_26_1.pdf. Priorities were set by a marketing agent and an optometrist agent discussing which points to keep.

**Added**
- "Why" section: four official lifestyle photos (sport, study, explore, outdoor) with the note "Illustrative images. Not trial participants."
- "How it works" section: the official annotated lens picture (cropped from brochure p3). The three macro crops sit in a collapsed "details" block.
- Results section:
  - 0.60 D and 0.22 mm tiles
  - A two-bar chart for −0.23 vs −0.83 D and 0.11 vs 0.33 mm
  - Trial line: 56 vs 56 children
  - 98% adaptation, with the peripheral acuity note
- The brochure PDF is kept in assets.

**Removed**
- The wear / care list and the follow-up / review tiles (R1.8).
- Self-drawn diagrams, replaced by the official crop (R1.9).

**Release marker:** meta release 2026-11-23-r1.9.

## 2. Essilor Stellest and Stellest 2.0 (catalogues/stellest)

Sources: original brochure, plus web research on Stellest 2.0 because the brochure lacked material (notes in discussion/stellest2-web-research.md).

**Added**
- Official IFU figures: central focus, lenslet layout (caption "Stellest 2.0 has 12 rings") and the volume-of-defocus diagram.
- "Results in more detail" tiles:
  - 55% / 0.80 D
  - 67% / 0.99 D
  - 50% / 0.35 mm
  - 60% / 0.41 mm
  - Stellest 2.0 vs original bars: 0.228 vs 0.121 mm
- "More detail" block: lenslet figure, safety, Airwear "up to" tiles, study ages.

**Removed**
- Wear and review blocks (R1.35).
- Self-drawn Stellest 2.0 schematic and the "What is different in Stellest 2.0" block (R1.36).

**Unchanged by choice**
- The existing 67% and 47% cards. An optometrist agent suggested "about 46%" for 2.0, but I couldn't verify the paper wording.

## 3. HOYA MiYOSMART / iQ (catalogues/hoya)

Source: bundled HOYA brochure PDF.

**Added**
- Official lens macro photo with treatment dots and caption, replacing the little-girl classroom photo (hoya-classroom.jpg deleted).
- HOYA's own 12-month trial charts (brochure p6), with the mandatory same-brand / group-average caption.
- A collapsed "more design" block: eye diagram and coating layers.
- Chameleon label: shown as "Chameleon (Photochromic)" via `styleLabel()`.

**Changed**
- Overlay row retitled "Who it is for", with the wear / follow-up sentence deleted.
- Accessibility label now reads "Product information".

## 4. Hub (root files)

- **Compare tab:** removed the "Original brochure" row.
- **Wording:**
  - "Lens pair" is now "Lens", in the Compare price row and the lens-option label.
  - "Print Quotation" is now "Print Label", in the button and the printer row text.
- **Discounted prices:** the strikethrough is black, bold and 2 px thick, so the discount is easy to read.
- **Frame removal:** the "Remove frame" text button is now a compact ✕ in the hub and all three brands.
- **Hidden hint:** the visible "Hold for complimentary" text is removed. The long-press behaviour itself is untouched.

## 5. Release notes and QA

- Notes added to README.md (R1.10–R1.13) and each brand's SOURCES.md (ZEISS R1.7–R1.9, Stellest R1.34–R1.36, HOYA R1.7).
- QA scripts updated for the "Lens" label: zeiss/qa/verify.cjs, hoya/qa/verify-interactions.cjs, and the printer files.
- Checks so far were syntax and render checks only. The full QA scripts were not run.

---

## Not code changes (delivered separately)
- Agent discussions: discussion/ (marketing vs optometrist, per brand).
- Recorded consultation walkthrough (silent and narrated), the audio-only MP3, and consultation_flow.md.
- A shortlist of six YouTube explainers, not added to the app. Not previewed or verified.

## Open items
- ZEISS Platinum UV: brochure RM1,600, catalogue RM1,800.
- Stellest 2.0: 47% in the catalogue vs about 46% suggested. Check the paper.
- Airwear footnote baseline: unchecked.
- Older "wear and monitoring" text may still sit in the brand (i) panels from earlier releases.
- Card title still reads "Quotation".
- The ✕ buttons on Stellest and some hub screens were not visually verified.
