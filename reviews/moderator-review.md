# Moderator review — three-brand consultation

## Scope and method

The moderator followed an internal three-round dialogue between the optometrist agent and parent/customer agent, then requested one focused closing revision. The parent was hypothetical; no diagnosis, prescription or measurements were fabricated. Source figures, prices and warranty distinctions were checked against the bundled catalogue data. The full exchange is in consultation-transcript.md.

These are ratings of the simulated consultation and its proposed handoff, not measured patient outcomes, a live-browser usability trial or a physical-printer test.

## Rating rubric

Each criterion is rated from 1 to 10, where 1 is a blocking failure, 5 requires substantial prompting or repair, 8 is clear with minor friction, and 10 is consistently clear and complete for this scenario.

| Criterion | Initial dialogue | Revised closing | Evidence |
| --- | ---: | ---: | --- |
| Understandable explanation | 8 | 9 | Initially explained the lens/coating distinction and narrowed choices; revision defined sphere in plain language. |
| Fair comparison | 9 | 9 | Separate outcomes, durations and comparators were explained; no cross-study efficacy winner was invented. |
| Source and clinical accuracy | 9 | 9 | Counts, costs, study contexts and warranty basis were preserved; clinical suitability remained subject to actual examination/fitting. |
| Price and guarantee transparency | 9 | 10 | All components were costed; revision distinguished the RM400 upgrade difference from the RM140 budget overrun, and monitoring fees from replacement terms. |
| Non-pressuring recommendation | 10 | 10 | Recommendation respected the budget, retained an alternative, and did not assume free services or promise a better individual outcome. |
| Navigation/handoff clarity in the dialogue | 8 | 9 | Exact family/coating, frame and paid visits were named; revised closing restated the RM1,740 target and visible replacement condition. Actual app navigation is reviewed separately. |

Smoothness is the mean of understandable explanation and dialogue handoff clarity. Professionalism is the mean of fair comparison, source/clinical accuracy, price/guarantee transparency and non-pressuring recommendation.

- Initial smoothness: **8.0/10**.
- Initial professionalism: **9.3/10** (9.25 rounded).
- After the focused revision, smoothness: **9.0/10**.
- After the focused revision, professionalism: **9.5/10**.

## Focused revision and response

There was no material arithmetic, clinical-source or pressure blocker. The parent nevertheless identified *sphere* as a word they could nod at without understanding. The moderator requested one short revision: define sphere as the main plus/minus power separate from astigmatism, state the budget overrun explicitly, then close on the exact chosen package.

The optometrist delivered that shorter closing. The parent confirmed that it clarified both sphere and the two different price comparisons, selected the RM1,740 STELLEST + Crizal Rock package, and said they understood that RM240 buys the two monitoring visits while replacement has separate conditions.

## Required implementation fixture

With a RM200 frame and both RM120 visits paid:

- Original STELLEST + Crizal Rock: **RM1,740**.
- Original MiYOSMART Clear + STX: **RM1,740**.
- MiYOSMART iQ Clear + S.P.A.R.K.: **RM2,140**.

Use this lens must transfer the exact selected family/style/coating and the same shared accessories into the original catalogue summary. A missing frame must be marked as not added rather than implied to be included at RM0. Complimentary controls must not silently alter the scenario.

The original-family example of a 0.50 D increase after eight months does not meet the stated six-month / 0.75 D conditions. HOYA's sphere basis must not be replaced with spherical equivalent or generic prescription change. Biometry follow-up charges and complimentary replacement entitlement should remain separate rows/concepts.

## Final static implementation review

Reviewed `index.html`, `hub.js`, `bridge.js`, `catalogue-data.js` and `consultation-copy.js` after implementation. No blocking consultation-flow or professionalism issue was found in this source review.

| Consultation requirement | Implemented source evidence |
| --- | --- |
| Keep full option identity near the decision | Each choice card repeats the full family/style/coating name, approved lens-pair price and current shared-package total next to Use this lens. |
| Do not imply a missing frame is included | Both the choice card and total row state “Frame not added”; the Frame row states “Not added”. |
| Separate check-up cost from replacement | The practical table has distinct frame, biometry follow-up, complimentary replacement period, measurement basis and prescription-change condition rows. Follow-ups display the selected visit count and include-refraction wording. |
| Explain sphere | The warranty-basis row adds a plain-language explanation that sphere is the main lens power, separate from astigmatism. The exact source-specific basis is preserved. |
| Narrow a practical comparison first | The price/coating/replacement section is visible; design/range and clinical study details are native collapsed disclosures. One to three exact choices can be compared without forcing a clinical ranking. |
| Carry the recommendation accurately | `useLens()` resolves the registered option, selects its brand and sends the exact native selection plus the normalized shared frame/follow-up state with a summary request. The bridge applies shared state and the validated selection before calling the original `openSummary()`. |
| Keep source terms at the final decision | The native summaries retain their selected product identity and replacement condition; the existing printing flow follows that summary. |
| Keep original brochure choice | Comparison brochure links target the local originals. ZEISS targets its sole standard RRP file. |

The source-derived RM1,740 / RM2,140 fixture matches the implemented data engine. Root's separate integration tests cover executable handoff and printing coordination; those results are not substituted for a live-browser observation or used to inflate the consultation scores.

No actual child/parent encounter, live-browser geometry or physical printer was observed by this moderator. The **9.0/10 smoothness and 9.5/10 professionalism scores describe the revised simulated consultation**, while this implementation review is a separate static-source pass.
