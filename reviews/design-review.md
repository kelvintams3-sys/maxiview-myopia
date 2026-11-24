# Three-brand hub design review

## Scope

Parent shell and shared-comparison styling only. Native Stellest R1.33, HOYA R1.6 and ZEISS R1.6 styles are retained in isolated iframes. No native source file is edited by the design agent.

## Layout decisions

- The shell has two grid rows: content-sized header and remaining-height main. The document itself does not scroll.
- An active brand iframe fills the main row exactly. The parent adds no scroll container around the iframe. Each child retains its own native scrolling and viewport calculations.
- The shared comparison content is its own vertical scrolling region. Its table scrolls horizontally inside its bordered region.
- Tabs stay visible. At narrow widths they use a two-by-two layout with at least 48 px touch targets so all four destinations remain available at 320 px.
- Selector cards share five structural rows on supported tablet/desktop browsers: brand, picker/identity, price, removal and recommendation action. Mobile cards use independent stacked flow.
- Tables use shared semantic rows, so wrapped text cannot separate corresponding feature baselines.
- Persistent price/summary controls are not floated over the parent comparison content. The package modal and transient status toast are the only intentional overlay surfaces.
- Brand accents use inherited CSS variables inside the parent only; no score colour or cross-brand efficacy ranking is introduced.
- Mechanism step numbers, source-warning badges and generic disclaimer banners are not introduced.

## Native collision review

- Native files reuse generic selectors, element IDs and global function names. Iframe isolation prevents these from colliding with the parent or another brand.
- Stellest uses a fixed-height body grid with its own scrolling catalogue and reserved footer. Giving its iframe an exact remaining height preserves this structure; sizing an iframe to its full document height would break the intended footer behaviour.
- HOYA and ZEISS keep native document scrolling, sticky headers and native summary bars. The parent panel must remain non-scrolling and the iframe must stay full-height so there is only one brand scrolling surface.
- Native modals use fixed positioning relative to the iframe viewport. Parent height containment is therefore required; no extra ancestor transform or artificial zoom is applied.
- Native sources contain same-named comparison/table/modal classes. Parent styles cannot cross the iframe document boundary.

## Final markup audit

The implemented `index.html`, `hub.js` and `bridge.js` were reviewed against `hub.css`.

- `#comparisonBody` is the direct child of the comparison scrolling region. It receives the 1,200 px content cap and centring; its nested comparison sections retain the available width.
- The parent contains one main scrolling region at a time: the active brand document inside its iframe, or `.comparison-content`. The parent document, main region and brand-panel wrappers do not scroll.
- The shell header is a normal content-sized grid row. It cannot overlap the iframe or comparison row; iframe sizing does not depend on subtracting a guessed header height.
- Every selector card has the five expected direct rows. The picker contains its label, native select and full, wrapping identity. The row-sharing rules align picker, current total and action baselines when product names wrap differently. `data-count` selects the proper one-, two- or three-card column count.
- Current totals are labelled and identify whether a frame was added. Lens-only prices remain visible beneath the current totals. Practical-table totals have a distinct, restrained background.
- Each comparison table has one feature-heading column and at most three option columns, with the same number of cells in corresponding rows. Study detail sections are collapsed on entry and do not introduce efficacy rankings.
- The package dialog has a labelled heading, frame input, individually selectable follow-ups, clear complimentary controls and apply/cancel actions. The close icon was normalized to a genuine 44 px button so inherited secondary-button padding cannot distort it.
- The modal script restores focus to its opener, traps Tab at its first/last controls and handles Escape. Pointer interaction with the covered comparison is intercepted by the overlay.
- The bridge restores Stellest's internal viewport scroll and HOYA/ZEISS document scroll independently. Native print functions, artwork, positive logo rendering and native styles are outside the design agent's edits.
- Native `[hidden]` remains authoritative. There is no offscreen-panel workaround that could leave another catalogue visible or interactive.
- No source-warning badge, generic disclaimer banner or decorative mechanism number is introduced by the parent.

The audit led to CSS-only refinements for the practical-section heading, current-total row, close icon, spacing between detail sections, and a contained keyboard-focus outline around the comparison viewport. Root JavaScript and native catalogue files were not edited by the design agent.

## Verification status and limits

Source structure and CSS delimiter checks passed. Live browser geometry, touch behaviour and older-browser subgrid fallback layout cannot be established from these checks. At very short viewport heights, the persistent header leaves less space for native catalogue controls; actual device/keyboard behaviour remains a live-browser check. Blocked browser routes were not retried.
# R1.1 refinement — 23 November 2026

Replaced the full-width tab cards and duplicate title with a quiet top-right text row. The navigation is capped at 320px; all four controls retain 44px touch targets in a 52px header. The active option uses a small underline. Narrow screens retain one row.

Pinned comparison headings share the original table styles, without extra overlay padding or borders that would shift columns. Their clipping, table width and horizontal translation follow measured table bounds. The source tables retain their accessible headings. Review was static; geometry fixtures verify the coordination logic, not live browser rendering.

