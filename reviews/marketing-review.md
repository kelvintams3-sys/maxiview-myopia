# Marketing and consultation-flow review

Scope: combined Maxiview myopia catalogue using the exact releases in `sources.json`: STELLEST R1.33, HOYA MiYOSMART R1.6 and ZEISS MyoActive R1.6.

## Copy module

`consultation-copy.js` exports the requested `HubCopy` object in browser and CommonJS environments. Strings are plain text; they do not require placeholder substitution. The module contains no prices or financial calculation logic.

The consultation sequence follows the customer's decision:

- Explore a brand's existing explanations and choose the actual lens/style/coating.
- Add up to three exact options to Compare.
- Compare lens price and consultation total using the same optional frame and biometry follow-ups.
- Read coating and replacement details, lens design and prescription availability, then each clinical study's own details.
- Use this lens to reach the original brand's summary and label-printing flow.

The section headings are “Price, coating and replacement”, “Lens design and prescription range” and “Clinical study details”. There are no decorative step numbers, automated efficacy winners, generic caution banners or source-confirmation badges. `evidenceIntro` is deliberately empty: the table's endpoint, duration, comparator, age, wearing-condition and source rows carry the exact study context.

Role-play feedback also separates the visit charge from the replacement benefit: the practical introduction states that prescription-change replacement is complimentary under the stated terms; the package introduction identifies the optional frame and biometry follow-ups, including refraction. Every option must show its actual lens price and full shared-package total before “Use this lens”.

## Content preservation

Brand notes describe the available choice rather than assign a clinical rank. MyoActive's two coatings are explicitly described as sharing one lens design. Optional family explanations preserve existing source facts:

- STELLEST: H.A.L.T. and 11 concentric rings.
- STELLEST 2.0: increased lenslet power/asphericity and the deeper treatment-light region.
- MiYOSMART: the clear central zone and surrounding D.I.M.S. segments.
- MiYOSMART iQ: treatment closer to the centre, stronger defocus and wider coverage relative to MiYOSMART.
- MyoActive: variable positive powers, a deliberately non-repeating arrangement and the separate ClearFocus back-surface design.

The structured comparison retains complete lens/style/coating names, actual option prices, all existing specifications and source context. Guarantee period, measurement basis and power threshold must remain separate rows. HOYA's sphere-based terms must not be relabelled as spherical equivalent. Missing source fields remain “Not specified”; they are not inferred to be absent from a product.

The ZEISS attachment rule remains unchanged: the existing standard one-page RRP PDF only. The copy module introduces no additional attachment.

## Review status

The copy contract and planned row labels were coordinated with the system analyst. Live browser geometry and physical printing are outside this copy review; no such verification is claimed here.

The optometrist reviewed all five optional family explanations and found no clinical or source blocker. The parent's feedback favoured visible practical terms/total first, explicit separation of follow-up visits from complimentary replacement, and optional technical/evidence detail. The copy uses the native ZEISS term “non-repeating arrangement”.

## Integrated source-level review

Reviewed `index.html`, `hub.js`, `bridge.js` and `catalogue-data.js` after integration.

- The persistent STELLEST, HOYA, ZEISS and Compare tabs preserve a direct route back to each native explanation and consultation flow.
- Each choice card names the exact family/style/coating, shows the current total and underlying lens-pair price, and places “Use this lens” in the same card. A blank frame is explicitly labelled “Frame not added”. No “best” badge or clinical winner is generated.
- The first open comparison table places lens price and complimentary replacement period/basis/trigger alongside separate Frame, Biometry follow-up and Current total rows. The visit row states the number of visits and that refraction is included. The package editor repeats that distinction, shows each RM120 visit separately and identifies the frame/follow-up subtotal rather than presenting it as a complete lens price.
- Design and clinical tables start collapsed. Their headings remain descriptive; expanding them exposes the full structured specifications and study endpoint, duration, comparator, participants, wearing condition and evidence source. An unspecified source field remains “Not specified”. There is no generic disclaimer banner or uncertainty badge in the hub renderer.
- The sphere-based replacement helper explains sphere as the main lens power separate from astigmatism. It does not relabel HOYA's criterion as spherical equivalent.
- “Use this lens” sends the selected option and current shared frame/follow-up state to its original brand summary. The bridge uses the native selection and summary functions, retaining the native label-printing route.
- Price transparency was checked using the role-play's RM200 frame and two paid visits: original STELLEST/Crizal Rock and original MiYOSMART Clear/STX each total RM1,740; MiYOSMART iQ Clear/S.P.A.R.K. totals RM2,140. The lens-only RM1,700 is not labelled as that full package total.
- Optional `brandNotes` and `explanations` remain available in `HubCopy`; native catalogue content supplies the existing product explanations without inserting a second clinical-marketing layer into Compare.

No source-level marketing or navigation-copy blocker remains. This review does not establish live geometry, touch behaviour or physical printer operation.
