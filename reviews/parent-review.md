# Parent/customer consultation review

## Scenario

Internal role-play: a hypothetical parent of a nine-year-old, with an approximate RM2,000 budget including frame and planned follow-ups. Clear, easy-clean lenses are preferred. No prescription, examination findings or real patient information were supplied.

## Parent turns

**Parent round 1:** “Around RM2,000 including the frame and follow-ups would be comfortable. My child is nine, and clear, easy-clean lenses are enough. I do not want to pay more just because a number looks bigger: does 67%, 47%, 0.58 D or 0.60 D tell me which brand works best? Could you narrow this to two clear-lens choices, and tell me the complete cost with, say, a RM200 frame?”

The optometrist distinguished outcomes, comparators, durations and the Stellest wear condition; the separate studies were not used to declare a brand winner. Two choices were narrowed to original STELLEST / Crizal Rock and original MiYOSMART Clear / MiYOSMART STX, both with RM1,300 lens pairs. The same RM200 frame and RM240 for two monitoring visits gave RM1,740 for each. A conditional Stellest / Rock starting recommendation was offered for the stated everyday-handling preference, retaining the other option and prescription/frame-fit checks.

**Parent round 2:** “RM1,740 with those items makes sense, and I like keeping this within budget. Please show the exact summary. Before I choose, if the power changes by 0.50 D after eight months, would either of these two lenses get a free replacement? Is the RM240 paying for the guarantee, or for the check-ups? I also noticed iQ has a one-year term—what would its complete clear-lens package cost, so I can decide whether the extra is worth considering?”

The optometrist separated the paid visits from complimentary replacement. The two original-family choices require a change of at least 0.75 D within six months; the example does not meet that period or threshold. HOYA's sphere basis and Stellest's prescription-power wording were distinguished. MiYOSMART iQ Clear / S.P.A.R.K. was transparently priced at RM2,140 with the same frame and visits, with its different sphere-based 0.50 D / one-year replacement condition. Its clinical study figures were not used to prove superiority for the child.

**Parent round 3:** “That is clear now. The RM240 is for the two check-ups, and the free replacement has its own power-change and time conditions. I understand iQ is RM400 above the RM1,740 choices and RM140 above my original budget. Please keep the STELLEST + Crizal Rock recommendation at RM1,740: RM1,300 lenses, RM200 frame and both RM120 visits. I would expect Use this lens to take me straight to that exact summary, with the six-month / 0.75 D replacement condition visible before printing. I did not feel pressured, and I would not need the technical design rows expanded unless I asked.”

## Moderator-requested closing revision

The optometrist added a plain explanation that HOYA's sphere is the main plus/minus power figure, separate from astigmatism. The concise closing explicitly distinguished the iQ price being RM140 over the budget and RM400 over the RM1,740 choice, then repeated the exact selected package and replacement condition.

**Parent response:** “Yes—that explains the sphere term and the two different price comparisons clearly. Please use the RM1,740 STELLEST / Crizal Rock package exactly as stated. I understand what the visits cost and that replacement has separate conditions.” The shorter closing felt easier to follow, with no remaining question in this scenario.

## Source-derived price check

The implemented `MyopiaHubData.total()` was independently checked against the role-play package:

| Exact option | Lens pair | Frame | Two follow-ups | Total |
| --- | ---: | ---: | ---: | ---: |
| Essilor STELLEST / Crizal Rock | RM1,300 | RM200 | RM240 | RM1,740 |
| HOYA MiYOSMART Clear / MiYOSMART Coating STX | RM1,300 | RM200 | RM240 | RM1,740 |
| HOYA MiYOSMART iQ Clear / S.P.A.R.K. | RM1,700 | RM200 | RM240 | RM2,140 |

Exact engine selections were also checked: `stellest/rock`, `miyosmart/clear/stx`, and `iq/clear/spark` respectively.

## Practical findings passed to root and marketing

- Show the complete current total close to **Use this lens**, with lens, frame and paid visits distinguishable.
- Keep paid biometry follow-ups separate from complimentary prescription-change replacement. This was the parent's main initial misunderstanding.
- Narrow choices before discussing technical mechanisms. One or two practical choices felt easier than reading every coating option.
- Keep the endpoint, comparator, period and wear conditions reachable with each study result. The parent initially assumed the largest headline number meant the best brand.
- Keep exact family, style and coating identity through the summary handoff; preserve the same frame and both selected visits.
- Leave technical design and evidence sections collapsible for an ordinary parent discussion.
- State price increments against the correct reference: iQ is RM400 above the RM1,740 options, but RM140 above this parent's RM2,000 budget.
- Explain “sphere” once in plain language. The moderator requested a final short clarification that it is the main lens-power figure, separate from astigmatism.

No pressured selling was perceived in the role-play. The parent accepted the conditional RM1,740 recommendation after understanding cost and terms.

## Actual shell review

Reviewed `index.html`, `hub.js`, `bridge.js` and the current consultation copy after the shell was implemented.

- Each comparison choice shows its complete current total beside **Use this lens**, states whether a frame has been added, and separately shows the lens-pair price. This addresses the all-in budget question.
- Full family/style/coating identity remains visible. The selectors group options by brand, and removing the third comparison choice supports narrowing to two practical choices.
- The practical comparison separates frame, paid biometry follow-ups and complimentary replacement terms. The visit count and inclusion of refraction remain visible.
- The sphere helper defines the main lens power separately from astigmatism, addressing the one remaining jargon issue in the role-play.
- Design and study details begin collapsed but remain accessible. There is no automatically promoted efficacy winner.
- **Use this lens** selects the option's exact original state, carries the shared frame/follow-up choices, switches to its brand and requests the original summary. The source-level message payload matches the parent's expected handoff; root is testing the actual simulated native-summary result separately.

No blocking parent-flow issue was found in the implemented written flow. One small wording suggestion was passed to root: label unselected complimentary controls as actions (“Make frame complimentary” / “Make follow-ups complimentary”) so they do not sound like already-included entitlements. The existing restore labels are clear.

## Verification boundary

This review covers the role-play, the implemented data-engine amounts and the actual shell's source-level written flow. It does not claim live-browser geometry, touch operation or real patient consultation validation. The final native-summary handoff is covered by root's executable simulation rather than by this parent's source review.
