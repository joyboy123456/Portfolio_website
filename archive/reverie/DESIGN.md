# Reverie · visual reference lock

Build target: the user's explicit composition, asset URLs, typography, sizing, layer order, and animation timeline. Direct implementation; no alternate visual direction.

| Decision | Source | Preserved role |
| --- | --- | --- |
| Full-screen theatrical portal and curtain opening | User specification | The landscape and frame drive the experience; UI sits above the scenery |
| Viaoda Libre / Imprima; dark brown on smaller screens, white on desktop | User specification | Display headings / supporting text, respectively |
| 480vh scroll track, sticky viewport, nine pastel arc cards | User specification | One continuous passage between two scenes |
| Staggered entrance, mouse smoothing, scroll transforms | User specification + Refero motion.md | Establish depth and continuity; reduced motion removes zoom and mouse parallax |
| Focusable controls, fixed image bounds, native dialog | Refero craft-details.md | Keyboard access, stable layout, focus management |

Primary sources: the supplied brief and its original image URLs. Secondary references: local Refero `references/motion.md`, `references/craft-details.md`, and `references/visual-workflow.md`. Live Refero tools are unavailable in this session.

Tokens: canvas #0a0608; heading #3b1a0a / white; body #5c2d0e / warm translucent white; pastel colors only on destination cards; specified 18–28px card radii and subdued shadows.

Asset verification: all five Cloudinary images fail to load with HTTP 401. The three Higgs URLs reject HEAD requests with HTTP 403 but **do render successfully in the browser**. Original URLs remain the primary sources. Four local images generated with the built-in ImageGen tool provide fallback scenery; the curtain asset serves both sides. Fallback cloud height and curtain clipping are tuned separately from the original asset styling. Generation prompts are in `ASSET-PROMPTS.md`.

Implementation adjustments: shorter viewports lower the card arc to keep it clear of the second heading. Previous/next controls and keyboard navigation complement the specified scroll sweep, making every card reachable on mobile. `ResizeObserver` refreshes the scroll range after viewport changes. Reduced motion replaces the zoom transition with a crossfade and disables cursor parallax.
