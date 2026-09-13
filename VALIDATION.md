# Portfolio validation

Reviewed on 13 September 2026 against the local production build.

## Functional and visual checks

- Production build passes; Vite discovers all 18 HTML pages (17 content pages plus the 404 page) automatically.
- Four logic tests pass for onboarding validation, zoom bounds, persistent/system motion preferences, and Unicode-safe email-draft encoding.
- All 50 browser checks pass in one regression run against the personalized portfolio, including ten motion lifecycle checks. Functional checks use intervening visits; dedicated loader checks exercise the actual five-second holds on visits 1, 6, and 11.
- Chrome checks cover five homepage viewport widths: 360, 390, 834, 1440, and 1920 px. The five new page types and an article also pass layout checks at 360, 834, 1440, and 1920 px.
- Tested native-dialog keyboard operation, Escape, focus return, menu previews, gallery boundaries and zoom, explorer keyboard navigation, demo validation/back/restart, all playground controls, and the full signature scatter-and-return cycle.
- Tested direct case-study URLs, reload, browser history, JavaScript-disabled content, and WebGL-unavailable artwork fallback.
- Confirmed desktop canvas initialization and scroll pinning, removal of graphics in reduced motion, remembered preferences, and cover distortion settling after pointer movement stops. Offscreen and hidden-tab rendering guards are implemented in the graphics module.
- Automated axe checks pass on all 17 content pages and the media dialog. An explicit visible-label/accessibility-name check also passes.
- All 770 local navigation and asset references in the personalized root build resolve, including the résumé PDF and seven legacy project redirects. A previous build also verified the `/portfolio/` base path (753 references before personalization).
- The expanded checks also verify all seven projects and their navigation loop, category filters, grid/list state across refresh/back, article search and empty states, clipboard interactions, contact validation/reset/no delivery claim, and résumé print styling.
- Dependency installation reported zero known vulnerabilities.

Final screenshots and browser traces are generated under `artifacts/`, which is excluded from source control.

## Light theme

- Added a persistent light/dark button beside the motion control on every page. Dark remains the default. Saved light mode is restored by the pre-paint bootstrap, including when the app bundle cannot load. Tab synchronization, navigation, reload, history, unavailable storage, and JavaScript-disabled fallback are covered.
- The 50 existing browser checks pass after the theme addition. All 24 new theme checks are validated: 23 passed initially, and CHIP-2’s small accent labels passed after a contrast adjustment. Automated axe checks cover all 18 pages in light mode plus the menu and media dialog. Theme changes retain the active motion setting and the existing canvas/pinning; switching motion retains the theme.
- Light layouts and the adjacent footer controls fit 360, 390, 834, 1440, and 1920 px. Desktop and mobile screenshots of Home, About, Contact, Résumé, Work, Playground, Blog, an article, a case study, and the navigation menu were reviewed under `artifacts/theme-review/`.
- The light loader still holds content for five seconds with the app bundle blocked. Browser print keeps the résumé white and removes footer controls. No résumé content or PDF asset was changed.
- The palette is defined in `src/theme.css`: warm ivory, ink text, sage surfaces, readable project accents, and original electric-lime artwork/filled controls. The site is not recolored through an image-inversion filter.

## Profile update

- Current role is Product Designer at Khushi Baby from April 2026. The historical Senior UI/UX Designer role ends in March 2026. Confirmed email, phone, LinkedIn, education, languages, and tools appear in the relevant pages.
- Seven actual project summaries replace the original concept projects. The next-project loop, filters, menu previews, gallery assets, explorer IDs, homepage covers, and sculpture textures use the updated routes. Old production URLs redirect to the new project pages.
- Reviewed About, Home, Work, Contact, Résumé, and long project titles at 390 and 1440 px. The About portrait is a responsive WebP crop of Sumit's existing image. All sourced image elements load successfully; horizontal document width stays within the viewport.
- The downloadable résumé uses a two-page A4 print layout with text-selectable content and active confirmed contact links. Both pages are rendered and visually checked. Its source is `resume/index.html`; `npm run resume:pdf` regenerates the downloadable copy.
- Original résumé files are unchanged. Project drawings are labeled workflow illustrations and avoid transferring personal records from healthcare captures. Figures preserve the supplied source context; no invented testimonial or employment claim was added. See `docs/PROFILE-SOURCES.md`.
- Browser interaction and accessibility checks cover the real contact email draft, résumé download link, new project routes, and all previous motion/fallback behavior. No message is sent by the contact form itself.

## Motion update

- Verified the mandatory five-second hold on visits 1, 6, and 11, suppression on intervening visits, and persistence across refreshes and a new tab. Page clicks and Escape cannot skip the hold. Each full page load counts as a visit; the count stays in local browser storage across sessions.
- Verified the independent five-second release with both the app bundle and local storage deliberately blocked. Reduced motion displays a static five-second loader; changing the motion preference during the hold does not dismiss it. Repeated menu open/Escape cycles, restored focus, focused project previews, and a menu accessibility audit remain covered.
- Verified accordion reversal during an active transition, Enter/Space operation, mobile resizing, interrupted closing, and JavaScript-disabled native disclosure behavior.
- Verified scroll progress, collection filtering after reveals, reduced-motion cleanup, page entrances across every page type (including 404), and back/forward navigation.
- Reviewed desktop and mobile screenshots of the loader and menu, plus the expanded contact FAQ. Images are under `artifacts/motion/`; `node scripts/motion-shots.mjs` regenerates them with local Chrome.
- Loader and page progress add no layout space. The loader covers the viewport and temporarily makes the page inert, releasing interaction at its deadline independently of GSAP. Its copy is not a simulated asset-loading percentage. Case-cover parallax includes enough image overscan to avoid exposed edges.

## Mobile Lighthouse

The reports use Lighthouse's mobile emulation against `http://127.0.0.1:4173`. Results are local lab measurements, not field data. **The scores below predate the mandatory five-second loader and profile personalization.** That latest requested change deliberately delays page interaction on visits 1, 6, 11, and so on; these earlier scores should not be presented as measurements of the new loading policy.

| Page     | Performance | Accessibility | Best practices | SEO |
| -------- | ----------: | ------------: | -------------: | --: |
| Homepage |          96 |           100 |            100 |  66 |
| About    |          98 |           100 |            100 |  63 |
| Contact  |          98 |           100 |            100 |  63 |
| Résumé   |          94 |           100 |            100 |  63 |
| Work     |          96 |           100 |            100 |  66 |
| Blog     |          96 |           100 |            100 |  63 |
| Article  |          99 |           100 |            100 |  63 |

Homepage, About, and Contact were measured after the initial motion update (96, 98, and 98 performance respectively, with 100 accessibility). The remaining rows retain the earlier page-expansion measurements. The performance and automated accessibility targets passed on those measured builds. Re-run Lighthouse for the current mandatory-loader behavior before making updated performance claims. The SEO target remains pending: the preview intentionally uses `noindex` and blocks crawlers. The other scored SEO checks passed. Review the project presentation and article copy, configure the real URL, and run a release audit before enabling indexing. Audit reports are in `artifacts/audits/`.

The résumé performance score passes the 90+ target; its latest measured layout shift is 0.129, which leaves room for further font/layout tuning with the final personal content.

The desktop-only Three.js chunk exceeds Vite's generic 500 KB warning threshold. It is dynamically imported and excluded from mobile/reduced-motion startup; essential content is static HTML.

## Publication status and remaining content

GitHub Pages automation is prepared. No public deployment has been created. The release check still requires preview mode to be disabled, a real origin, and the remaining publication-review flags.

Identity, About copy, contact details, work history, education, skills, seven project summaries, and the updated résumé are integrated. Before publication, review project illustrations/qualified results and the authored blog notes. The collaboration section currently offers references on request; it contains no attributed testimonial. Review `site.config.json` and the release steps in `README.md`.

Safari, Firefox, physical devices, and manual screen-reader sessions were not exercised in this environment. Automated accessibility scores do not replace that review. Native navigation is the fallback when View Transitions are unsupported.
