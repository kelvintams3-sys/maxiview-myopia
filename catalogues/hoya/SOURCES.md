# Source references

## Build framework

- `MYOACTIVE_CATALOGUE_R1.zip`: approved by Kelvin as “Works fine.” Used for consultation flow, optional frame keypad, complimentary biometry behavior, semantic comparisons, four label types and AIMO D520BT-Z transport.
- `HOYA_MiYOSMART_iQ_CATALOGUE_BRIEF.md`, prepared 20 November 2026: module requirements and acceptance criteria.
- Existing HOYA R1 source retained as the working implementation; R1.1 clarifies card replacement wording and evidence publication context.

## Product, clinical and retail data

Supplied `MiYOSMART iQ_Trade Brochure.pdf` (12 pages):

| Page | Used for |
| --- | --- |
| 2 | Original classroom photograph displayed below the Triple Enhanced Design explanation, matching Kelvin's selected image. |
| 3–5 | MiYOSMART iQ D.I.M.S. with Triple Enhanced Design explanation. |
| 6 | 12-month clinical chart: single vision, MiYOSMART and MiYOSMART iQ; study ages 4–12. |
| 7, 9 | Optimized aspherical FreeForm back surface, optical aberration reduction, flatter profile and up to 10% edge-thickness comparison; FreeForm availability for iQ. |
| 8–9 | Clear and Chameleon everyday-use descriptions, individual assessment and follow-up within six months. |
| 10 | S.P.A.R.K. daily-handling benefits, 50% scratch resistance and 5× water resistance versus the previous MiYOSMART generation; nearly three years of wiping described as simulated technical durability rather than a guarantee. |
| 11 | Material, prescription ranges, optical dimensions, defocus powers, coatings and recommended selling amounts. |
| 12 | Clinical source references and context. |

The brochure’s reported iQ differences are 0.58 D and 0.27 mm versus ordinary single vision at 12 months. Original MiYOSMART differences of 0.28 D and 0.14 mm are calculated from the same chart and explicitly labelled as calculations. Prescription outcomes use cycloplegic spherical equivalent; axial outcomes use millimetres.

The brochure cites ARVO 2026 abstract 2523 and HOYA clinical data on file, April 2026. Its reference list also cites APAO 2026 and states that a peer-reviewed publication will follow. The app reports the supplied source’s statement; publication status was not independently rechecked.

The runtime clinical evidence PDF contains the supplied clinical summary and references. R1.4 also bundles the unmodified original trade brochure as `assets/hoya-original-brochure.pdf`, available from (i) → Original HOYA trade brochure. It opens separately rather than exposing trade tables during routine scrolling. The classroom image in R1.2 is the original embedded photograph from page 2, extracted without the brochure's overlaid title or page margins. The HOYA logo and other child imagery are retained from the existing supplied-source HOYA build.

Retail amounts follow the supplied brochure. Maxiview’s catalogue applies them per pair, matching the approved catalogue pricing flow; the brochure table does not explicitly state a per-pair basis. The catalogue screens do not display trade prices. The deliberately opened original professional PDF includes its original trade tables.

## Replacement terms

Supplied `1000228419.jpg` and Kelvin’s instruction that the replacement is complimentary:

| Family | Period | Sphere increase |
| --- | --- | --- |
| MiYOSMART | 6 months | At least 0.75 D more short-sighted, an additional −0.75 D or more. |
| MiYOSMART iQ | 1 year | At least 0.50 D more short-sighted, an additional −0.50 D or more. |

These are the supplied customer-offer terms. No additional manufacturer-policy attribution, administrative start date, claim count, exclusions or single-lens/pair entitlement was invented.

## Maxiview service pricing

The brief specifies two biometry follow-ups including refraction at RM120 each (RM240 total), independent visit selection and a complimentary long-press toggle. Further biometry follow-ups remain RM120 per visit.


## R1.4 source-to-copy map

| Original PDF page | Catalogue placement | Meaning retained |
| --- | --- | --- |
| 4–5 | Main TED panel and information | Closer defocus elements target near-peripheral retina, higher power strengthens the optical signal, larger zone extends coverage and frame compatibility; design intent stays distinct from an individual outcome. |
| 7, 9 | Main “Everyday vision and appearance” block; information | Optimized aspherical FreeForm back surface, reduced optical aberrations and flatter profile. Availability table lists FreeForm for iQ; no separate TF price/option invented. |
| 7, 12 (reference 10) | Information | Up to 10% lower edge thickness versus a standard spectacle lens; HOYA technical data, April 2026. Not guaranteed for every prescription or pair. |
| 10, 12 (references 12–13) | Main coating-benefit block, S.P.A.R.K. option copy; information | 50% greater scratch resistance and 5× greater water resistance versus the previous MiYOSMART generation; technical testing, not a clinical treatment improvement. S.P.A.R.K. results May 2026 and STX MiYOSMART Green PAR assessment June 2025. |
| 10, 12 | Information | Nearly three years of wiping is simulated durability, not a three-year guarantee. |
| 3, 6, 12 | Information | 9 in 10 below the brochure’s clinically relevant threshold: spherical-equivalent progression of at least 0.50 D over the first 12 months; ages 4–12; individual variation. |
| 6, 12 | Main outcomes retained; information | 0.58 D / 0.27 mm average differences versus single vision over 12 months, with conference/data-on-file status; spherical equivalent is separate from sphere-only replacement terms. |
| 8–9 | Information | Assessment from age four is individual; follow-up within six months monitors prescription and eye length. No automatic enrolment or extra paid visit is created. |

No main-screen award or cross-brand superiority headline was added. The quantitative coating/profile benefits do not establish additional myopia-control efficacy. The complete original brochure remains byte-for-byte unchanged.


## R1.5 — Content-preservation review

The earlier R1.3 customer copy was compared with R1.4. Existing HOYA specifications and substantive information were retained, expanded or clarified; no specification was removed on grounds of uncertain source support. Existing evidence labels remain attributed to the supplied brochure and its stated dates. No extra verification flag is added where the audit found no unresolved omitted point. The preserve-and-flag maintenance instruction is bundled in AGENTS.md.

## R1.7 — official brochure images (23 Nov 2026)
Source: bundled `hoya-original-brochure.pdf` (MiYOSMART iQ trade brochure, 12 pp); agent review in `discussion/`.
Replaced the classroom photo (p2) with the HOYA lens macro photo (p3 embedded image). Added the official p6 trial charts (single vision, MiYOSMART, iQ) with same-brand/group-average/evidence caption. Behind a tap: p5 design schematic (cropped above the "Smart Zone" label) and p10 coating-layer diagram. Only official images used; nothing self-drawn.
Removed from the info panel: the sentence "Wear as advised and arrange follow-up within six months…" (row retitled "Who it is for"); the "i" button label no longer says "wear information". Biometry follow-up price rows, labels and guarantees unchanged.
Not used: "Smart Zone" term, Chameleon portrait (child in black sunglasses misrepresents a photochromic lens), Kaymak quote, awards, "stop"/"strongest" headlines, p4 TED circle (unreadable without its callouts). Clear portrait not added to option cards.

### 23 Nov 2026 display tweaks (Kelvin)
Struck-through price (frame and follow-up when complimentary) is now black, 2 px, bold so the discount is easy to see. Visible "Hold for complimentary" hint removed (long-press behaviour unchanged). 
HOYA Chameleon lens option now shows "(Photochromic)" in the lens option list, selected-lens label, summary and Compare names. Printed label artwork unchanged.

Remove-frame button replaced by a compact ✕ beside the Frame row (Kelvin, 23 Nov 2026).

"Lens pair" shortened to "Lens" (summary row, sticky total, printed quotation label row); "Print Quotation" button renamed "Print Label" (Kelvin, 23 Nov 2026). QA expectations updated to match.
