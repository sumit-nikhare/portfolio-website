# Sumit Nikhare — Product Designer

A static product-design portfolio with an interactive Three.js sculpture, seven résumé-based project summaries, a playground of four original experiments, accessible dialogs, a persistent motion preference, and dedicated About, Contact, Résumé, Work, and Blog pages.

The site contains Sumit’s identity, verified contact details, career history, education, skills, and selected projects from the supplied résumés. The current designation is **Product Designer at Khushi Baby, April 2026–present**. Senior UI/UX Designer remains the historical role for January 2023–March 2026.

The site stays in **local preview** until publication review. Project visuals are clearly labeled workflow illustrations; the original healthcare captures were not copied. Metrics retain their résumé context. Blog essays are newly written design notes. The homepage reserves two clearly labeled testimonial placeholders without fabricated quotes or attribution; the separate Continuum sample contains one explicitly fictional teaching quote. See [docs/PROFILE-SOURCES.md](docs/PROFILE-SOURCES.md) for content provenance.

## Design standard

Preserve a minimal visual identity and aim for award-caliber craft in every change. Use clear hierarchy, generous spacing, original details, and a small number of purposeful interactions. The specialty sculpture is the homepage’s signature moment; supporting content stays calm and readable. Show actual contributions and qualified evidence. An external award is a benchmark, not a promised outcome.

## Quality pass status

The current source pass improves keyboard feedback and pale-surface focus contrast, mobile input/control sizing, motion preference restoration, collection history cleanup, SVG playback lifecycle, and deferred menu-image loading. The existing page structure, content, art direction, and themes are preserved.

The latest checks pass **51 Node tests**, root/subdirectory production builds, and static link/markup validation. **96 browser scenarios are prepared but have not been executed against these refinements.** Local preview can now start; visual review and Lighthouse measurements still require a connected browser. See [VALIDATION.md](VALIDATION.md) for the exact evidence and pending work. Publication still requires real project/freelance evidence and authentic testimonial content; preview mode remains enabled.

## Homepage structure

The homepage follows all nine parts of the reframing brief in order. Eight main sections lead into the shared footer:

| Part                     | Content                                                                                             | Edit location              |
| ------------------------ | --------------------------------------------------------------------------------------------------- | -------------------------- |
| 01 Hero                  | Name, Product Designer positioning, three-specialty sculpture, Work and About links                 | `#hero`                    |
| 02 Selected Work         | Continuum (fictional sample), Samasta, CHO Soft: context, scope, year, visual, and case-study links | `#work`                    |
| 03 Professional Snapshot | Current role, experience, domains, platforms, and résumé access                                     | `#overview`                |
| 04 Design Philosophy     | Three principles; their full copy lives only here                                                   | `#philosophy`              |
| 05 Playground Preview    | Typography, component, and SVG motion previews, with links to the actual experiments                | `#playground`              |
| 06 Testimonials          | Two labeled preview placeholders awaiting approved wording and attribution                          | `#testimonials`            |
| 07 About Teaser          | Portrait, three-sentence introduction, confirmed anime interest, About link                         | `#about`                   |
| 08 Contact CTA           | Product Designer roles and freelance enquiries; Email, LinkedIn, résumé                             | `#contact`                 |
| 09 Footer                | Identity, role, location, contact and page links, copyright, back-to-top, display preferences       | `src/partials/footer.html` |

At Sumit’s request, **Continuum replaces CHIP-2 on Home** and is visibly labeled a fictional sample, with its existing sample year of 2026. Samasta and CHO Soft retain **“To confirm”** for project years. Samasta’s figure retains its source qualification and links to measurement context; CHO Soft shows design scope because no numerical outcome is verified. All seven real projects, including CHIP-2, remain in Work. Detailed capabilities and career history belong on About; its former philosophy section now links to Home. About now follows its own brief structure, with recognition omitted until verified material is available.

The shared header contains the identity and Menu only. All six page destinations live in the animated menu; a native `details` menu works without JavaScript. Footer navigation remains available. `src/home.css` styles the supporting homepage sections and fallback menu. The small typography preview reuses the playground’s font-weight control. The former five-second loader has been replaced by a nonblocking wordmark entrance.

The Professional Snapshot has a shallow desktop 3D scroll entrance for its heading and introduction. One shared scroll sequence passes a soft accent light between the three facts, preserving its total intensity during handoffs. The depth is restrained to 14 px with a 0.8-degree tilt; text colors remain steady, and the transform stays on the same rendering path throughout. The light enters and exits completely, with no abrupt velocity changes at the handoffs.

Design Philosophy reuses the existing shallow unfold for its three principle columns into an aligned grid: a four-degree tilt and 44 px of depth settle to zero from left to right, with a fine accent line passing across each upper rule. The columns remain fully readable. Both sections use a 0.6-second scroll catch-up, reverse naturally, and add no pinning or extra scroll distance. Mobile, reduced motion, keyboard focus within each section, and print retain flat content. Adjust the `profile`, `principle`, and `sectionScrub` values in `src/config.js`. Behavior lives in `src/modules/home-depth.js`; the shared highlight curve is in `src/modules/home-depth-sequence.js`. Both themes use their existing accent tokens.

## About structure

About follows the brief in this order: **Hero → Professional Story → Experience → Capabilities → Beyond Work → Résumé → Contact**. Recognition (brief S5) is intentionally omitted: no meaningful verified item was supplied, and the brief permits removing it. The seven visible sections are numbered consecutively; `data-about-section` identifies their purposes and HTML comments preserve the original brief mapping.

Edit `about/index.html`. `#story` explains career progression and present direction, while the four roles in `#journey` retain verified company names, titles, dates, and concise scope. `#capabilities` uses the five requested groups: Product, Experience, Craft, Systems, and Collaboration. Claims about product strategy, roadmap contribution, and mentoring await confirmation; the current copy uses supported capabilities. No percentage skill meters or invented recognition are included.

`#outside-work` combines the confirmed anime interest with résumé-backed communication and motion work. The existing poster treatment supplies a personal visual without implying a favorite series or using third-party artwork. `#resume` offers the existing résumé page and configured PDF download; `#say-hello` supports roles and freelance enquiries with a compact contact invitation. Existing About anchors remain valid, including `#principles`, which links to Home’s philosophy instead of repeating it.

About reuses the shared editorial grid, typography, portrait, themes, and reveal behavior. Small additions are scoped in `src/pages.css`; no new motion module or asset is required. Work and Playground have also been reframed to follow the brief.

## Work structure and freelance projects

Work follows the brief with Sumit’s requested Freelance section added: **Introduction → Featured Projects → Freelance Projects → Additional Work → Archive**. All sections are ordinary HTML in `work/index.html` and remain readable without JavaScript.

| Section            | Current entries                                                          | Presentation                                                                                             |
| ------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Featured Projects  | CHIP-2, Samasta, CHO Soft                                                | Three illustrated cards with problem, contribution, domain, employer, year, and case-study links         |
| Freelance Projects | Three clearly labeled preview slots for the 2–3 projects Sumit mentioned | Separate editorial cards; client, role/scope, deliverables, and year await supplied details; contact CTA |
| Additional Work    | AI-enabled dashboard, ABDM–ABHA                                          | Compact summaries with small visuals and contribution metadata                                           |
| Archive            | Anarock, TARP Agile Platform                                             | Smaller rows from the 2022 Permute employment period; exact project years remain unconfirmed             |

The **07** count and category filters refer only to the seven documented employment projects. Freelance previews remain visible for every filter and are excluded from project totals. They have no invented names, outcomes, images, or inactive case-study links. Remove the unused third slot if only two projects are supplied. Anarock and TARP remain employment projects through Permute, not freelance claims. Continuum remains a fictional sample on Home and is outside this Work collection.

All seven project years read **“To confirm.”** Existing project pages and their navigation loop are unchanged. The page explains that they are résumé-based summaries with workflow illustrations, rather than implying complete research evidence. Exact original project dates must be supplied separately from employment tenure.

Category filtering spans Featured, Additional, and Archive; an empty employment section hides until a matching filter is chosen. The list/grid control changes the featured cards; it is disabled when the active filter has no featured entries. Additional and archive entries always stay compact. Filter and view preferences retain their existing URL behavior. Shared logic in `src/modules/collection.js` recognizes optional `[data-collection-group]` sections; Blog’s ungrouped collection keeps its existing search and filters. New styles are scoped to Work or uniquely named Work components in `src/pages.css`.

To complete freelance entries, replace each `[data-freelance-placeholder]` in the HTML with the actual project name, permission-cleared client reference, problem, contribution, year, approved visuals, and deliverables or evidenced result. Link it to a real case-study page when available. Keep it outside employment counts/filters unless those controls are deliberately expanded to distinguish employment and freelance work. Do not publish the preview placeholders as professional evidence.

## Playground structure

Playground follows the brief’s three sections exactly: **Introduction → Experiment Grid → Experiment Detail**. The four original studies remain on `/playground/`: onboarding, variable typography, component craft, and SVG motion. The visual index uses normal anchor links; each detailed experiment includes visible **Idea → Experiment → Result** notes beside its existing controls. Categories describe the studies that exist, without empty AI or prototype filters.

Edit the text in `playground/index.html`. Grid previews are editable HTML/CSS and inline SVG, and page-specific styling lives in `src/playground.css`, loaded only by Playground. Both themes reuse the established tokens. Motion uses the existing entrance and heading reveals, with a small hover/focus arrow response; there is no new WebGL or scroll pinning. Full/reduced motion controls remain shared.

Keep the IDs `#onboarding`, `#typography`, `#components`, and `#svg-motion`: the homepage previews link to the latter three. To add an experiment, add one grid link with a unique preview heading and one matching detail article containing Idea, Experiment, Result, the working view, and a return link to `#experiments`. Keep essential explanations visible without JavaScript and label concepts honestly. These examples demonstrate local prototype behavior, not client work or measured results.

The onboarding module targets `[data-demo-heading]` when moving keyboard focus so its heading level can fit the surrounding page. All four existing interactions and static fallbacks remain available. The shared quality/detail source pass is complete, with live browser verification pending; real case studies and freelance entries still need supplied evidence before publication.

## Fictional sample case study

Open `/projects/sample-continuum/` for **Continuum — From screening to follow-up**. This separate teaching page presents all fourteen case-study sections individually, numbered in the brief's order. Five compact navigation shortcuts show the corresponding section ranges. The page includes an optional structure guide, original SVG product illustrations, and a working referral handoff with offline simulation. All research, team, timeline, quotes, and outcomes are explicitly fictional.

The sample is featured on Home as a fictional concept. It remains `noindex`, excluded from sitemap generation, and outside the seven real projects’ counts and navigation loop. Its additional JavaScript and CSS load only on that page. The rest of the page architecture is unchanged. [Read the authoring guide](docs/SAMPLE-CASE-STUDY-GUIDE.md) for replacing the sample with real evidence. `node scripts/create-continuum-art.mjs` regenerates only the sample’s editable illustrations.

## Start and preview

Use Node.js **22.19 or newer** (Node 24 also works). The basic site runs on Node 20.15, but the current performance-audit tooling needs a newer version.

```sh
npm install
npm run dev
```

Open the local address printed in the terminal. Changes to HTML, CSS, and JavaScript update the preview automatically.

To preview the exact published files:

```sh
npm run build
npm run preview
```

## Your everyday editing guide

| Change                                                     | Where to edit                                                                       |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Homepage sections, project cards, philosophy, and previews | `index.html`                                                                        |
| Name, menu, and footer                                     | `src/partials/header.html`, `src/partials/footer.html`, `src/partials/dialogs.html` |
| Case-study text and evolution stages                       | `projects/<project>/index.html`                                                     |
| Playground explanations                                    | `playground/index.html`                                                             |
| Colors, typography, spacing, breakpoints                   | Variables and rules in `src/styles.css`                                             |
| Project images                                             | `public/assets/`                                                                    |
| Motion timings and behavior                                | `src/config.js`, then modules in `src/modules/`                                     |
| Public address and content-readiness flags                 | `site.config.json`                                                                  |

### Replace a project

1. Edit its homepage title, description, and links.
2. Replace the associated case-study text with your real problem, role, decisions, evidence, and outcomes.
3. Add compressed WebP or AVIF artwork to `public/assets/`. Keep width/height attributes accurate and write descriptive `alt` text. Avoid putting essential text only inside images.
4. Update the image `src`, the smaller-file `srcset` variants, and its surrounding viewer link `href`. `data-caption` supplies the full-screen image description. All links sharing `data-gallery` belong to one gallery.
5. Rename the project folder if desired, then update links and the next-project navigation. Update the menu’s `data-preview` values to match the new cover filename prefix.

Use each project’s inline `--accent` value to adjust its color. Ensure the new color remains readable against charcoal.

### Add another case study

Use [Continuum’s authoring guide](docs/SAMPLE-CASE-STUDY-GUIDE.md) for the current decision-led structure. Copy `projects/sample-continuum/index.html` to a new project folder, then replace the fictional narrative, visuals, metadata, and next-project link with verified material. Keep its review indexing restrictions until the new case is ready. The older `templates/case-study.html` remains available as a shorter legacy scaffold outside the build.

When the case is approved for inclusion, add its card to `work/index.html`, optionally feature it on the homepage, and update the project and category counts. HTML pages are discovered automatically during the build; you do not need to maintain a route list. Format only the files you edited to avoid changing unrelated pages.

### Update contact details and the résumé

`site.config.json` holds the primary email, LinkedIn URL, and résumé download path. The four-field contact form prepares a local draft; visitors choose whether to send it through their own email app. The phone number and printable résumé contact lines are in `contact/index.html` and `resume/index.html`.

Edit `resume/index.html` for experience, education, skills, and selected work. **Print résumé** uses an A4 stylesheet with two pages. The download is `public/assets/Resume-Sumit-Nikhare-Product-Designer.pdf`. After editing the résumé:

```sh
npm run build
npm run preview
```

Keep the preview running, then in another terminal:

```sh
npm run resume:pdf
npm run build
```

The export uses local Chrome on macOS or Playwright Chromium elsewhere. It updates both `output/pdf/` and `public/assets/`. Inspect both PDF pages before publishing. Confirmed email, phone, and LinkedIn links stay active; local project URLs are excluded from the PDF until a public URL is available. No PDF editing tool is needed for ordinary text changes.

### Edit the new pages

| Page    | Editable file                | Main content                                                                                    |
| ------- | ---------------------------- | ----------------------------------------------------------------------------------------------- |
| About   | `about/index.html`           | Seven sections: hero, story, experience, five capability groups, Beyond Work, résumé, contact   |
| Contact | `contact/index.html`         | Intro, contact methods, brief form, FAQs                                                        |
| Résumé  | `resume/index.html`          | Printable experience, skills, education, and selected work                                      |
| Work    | `work/index.html`            | Featured employment work, freelance previews, additional summaries, archive, and scoped filters |
| Blog    | `blogs/index.html`           | Three article cards, topics, and reading estimates                                              |
| Article | `blogs/<article>/index.html` | Full essay, section index, source links, and related reading                                    |

The new layouts live in `src/pages.css`, which is imported by the shared stylesheet. The page-research rationale and source links are in [docs/PAGE-RESEARCH.md](docs/PAGE-RESEARCH.md).

When changing an employment work card, update its `data-category`, `data-title`, image sources, and case-study link. Update the employment filter counts too; freelance previews are separate. Keep the seven case studies' next-project links in a complete loop. Filtering and grid/list preferences use URL parameters, so refresh and browser return preserve the current view.

To add an article, copy `templates/article.html` to a new folder under `blogs/`. Replace the title, metadata, essay, section IDs, attribution, reading estimate, and related-article link. Add its card to `blogs/index.html`; search uses the card's `data-title`. No backend or CMS is required. Review the authored design notes before setting `articlesVerified` to true. Identity, contact, and résumé verification are already complete.

`npm run art` regenerates the current workflow illustrations from `scripts/project-art.json`. It overwrites those image files. The older concept generators remain available as `art:concept` and `art:extra` for reference; they are not the selected-work content.

### Add testimonials

Replace the two clearly labeled writing prompts in `#testimonials` with authentic approved wording, each person’s name, role, and relevant project. Keep approximately three quotes at most. Never present the preview prompts as endorsements. Before publication, either supply approved testimonials or remove the placeholders, then review `testimonialsVerified`. It remains false during this preview.

### Understand shared markup

`<!-- include:header -->`, `<!-- include:footer -->`, and `<!-- include:dialogs -->` are expanded by Vite into ordinary HTML, so content and the native fallback menu do not rely on JavaScript. `%BASE_URL%` keeps asset and page URLs working both at a domain root and under a GitHub project path.

## Publish free with GitHub Pages

1. Create a public GitHub repository and push this folder to its `main` branch.
2. In the repository, open **Settings → Pages → Build and deployment**, and select **GitHub Actions**.
3. Review the project summaries, qualified metrics, approved imagery, and design notes. Original playground concepts and labeled explanatory diagrams can remain.
4. Set `origin` in `site.config.json` to `https://YOUR-USERNAME.github.io` (host only). Set `base` to `/REPOSITORY-NAME/`, or `/` for a `YOUR-USERNAME.github.io` repository.
5. Set `preview` to `false`, and complete the remaining content-verification flags after reviewing project material, article authorship, and the references section. The contact form’s “Your name” label describes the visitor and should remain.
6. Run `npm run release:check`, then commit and push. The included workflow builds and publishes the site. Later pushes to `main` publish updates automatically.

The content-readiness check intentionally fails while preview mode, the public URL, and final publication review are pending. It does not block local builds. `noindex` metadata and a restrictive robots file keep preview content out of search results. The release build creates a sitemap when a real origin is configured.

Free GitHub Pages hosting requires a public repository. Your source and committed assets will be visible. A custom domain is optional and is not part of the free setup.

## Interactions and fallbacks

- Desktop, fine-pointer browsers get the 3D sculpture and cover distortion. Other devices receive the static layered artwork.
- The scene renders only while visible and while the tab is active. The large Three.js bundle is loaded separately from essential page content.
- The footer motion control follows the system preference initially and remembers an explicit choice. Reduced motion removes scroll pinning, parallax, distortion, and automatic motion.
- Image links open normally when JavaScript is disabled. With JavaScript, the viewer supports previous/next, zoom, reset, Escape, and focus restoration. Use arrow keys at 100%, `+`/`-` to zoom, and `0` to reset. Scroll the image area when zoomed.
- Design evolution uses arrow keys and Home/End. Without JavaScript, all three stages remain visible.
- The onboarding concept stores its choice only in memory. It validates selection, supports Back, and resets fully with Start again.
- Native view transitions enhance supported browsers; every page is still an ordinary HTML URL.

### Custom cursor

Desktop mouse users get a small dot inside a fine ring across every page, including page entrances. Links enlarge the ring with a lime accent, project covers and gallery images reveal a **VIEW ↗** circle, and text fields use a slim custom caret. Clicking adds a small press response. Position tracks directly, with no trailing animation or idle loop. Colors follow the theme; reduced motion keeps the custom pointer with immediate state changes.

The decorative cursor never receives clicks or keyboard focus. It uses a manual popover to sit above native dialogs; see [MDN's Popover API guide](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using). A small SVG cursor remains available while theme/page snapshots run or when the popover API is unavailable. Touch and forced-color modes retain platform behavior.

Appearance and the 180 ms state-transition duration are in `src/cursor.css`; event handling is in `src/modules/cursor.js`. Project targets are discovered from `data-project-link` and `data-gallery` attributes. The fallback artwork is `public/assets/cursor-dark.svg` and `cursor-light.svg`.

### Light and dark themes

The footer groups the **Dark theme / Light theme** button beside the motion control. Dark is the default. A visitor’s choice is saved under `intent-portfolio-theme`, applied before the page paints, and shared across open tabs. With browser storage blocked, switching still works for the current page. Without JavaScript, the original dark design and static content remain available.

Edit `src/theme.css` to adjust the light palette and themed components. Warm ivory, dark ink, sage surfaces, and deeper green text retain the original typography and composition. Electric lime remains on filled controls and artwork; project accent text is darkened for contrast. Images retain their original colors. Menus, media controls, forms, and playground respond to the theme; the résumé keeps its print document styling.

Theme behavior is in `src/modules/theme.js`, with early restoration in `src/boot.js`. Theme changes do not reset motion preferences, restart the sculpture, or delay access to the page. The switch uses native button keyboard behavior and announces its current state and next action.

With full motion enabled, a soft circular reveal spreads from the theme button with a brief halo and sun/moon animation. It lasts 1.05 seconds on desktop and 0.88 seconds on mobile. Browsers without the required snapshot and masking APIs use a 0.36-second palette fade. Reduced motion switches immediately. Scrolling, navigation, Escape, and repeated clicks settle the effect on the latest choice.

Edit `themeReveal`, `themeRevealMobile`, and `themeFade` in `src/config.js` to adjust these timings. The effect and its interruption handling are separate in `src/theme-motion.css` and `src/modules/theme-motion.js`.

For light-theme visual review with the production preview running:

```sh
PORTFOLIO_THEME=light node scripts/profile-review.mjs / /about/ /contact/ /resume/ /work/ /playground/
```

Screenshots are written to `artifacts/theme-review/`.

### Motion editing

The former mandatory five-second loader and visits 1/6/11 schedule are retired. A **0.65-second entrance on the header wordmark symbol** accompanies the normal page entrance. Content and navigation are immediately accessible: there is no full-screen overlay, interaction blocking, focus capture, or scroll lock. Reduced motion skips the decoration. Old visit-counter values are ignored.

Every page has a title entrance. The full-screen menu reveals its links in sequence, animates focused/hovered project previews, and reverses into a closing wipe. Accordions expand and collapse smoothly, including during repeated activation; design-evolution tabs resize their container and bring in the selected panel. Project and blog cards reveal on scroll, with restrained desktop parallax and a page-progress line. Scrolling remains native.

On desktop with full motion, the homepage sculpture follows three scroll stages: **Assemble → Unfold → Resolve**. Three specialty cards open from the original tilted stack and settle into a front-facing arrangement over **0.75 viewport heights** (previously two). The entrance lasts 0.9 seconds. Scrolling backward retraces the same poses. The entrance starts as soon as the scene is ready, the camera fits the panels to its viewport, and rendering stops when settled, offscreen, or in a hidden tab. Screens shorter than 700 px use an unpinned sequence; mobile, reduced-motion, JavaScript-disabled, and WebGL-unavailable visitors get readable HTML specialty cards.

Edit the three `[data-specialty]` cards in `index.html` to change **Product & UX design**, **Interaction design**, and **Design systems**. Keep two spans per title. The canvas textures use the cards’ actual text and SVG paths, wait for the local fonts, and redraw when the theme changes. `src/modules/specialty-art.js` controls their typography and artwork composition. The Selected Work grid has three entries: the fictional Continuum sample, Samasta, and CHO Soft.

The three selected-project covers retain gentle scroll depth and pointer tilt. The snapshot and philosophy reuse restrained scroll effects; the remaining supporting sections use a readable layout. Their wrappers keep these transforms separate from image reveals. `src/modules/sculpture-sequence.js` holds the scene poses, `home-depth.js` handles the artwork interactions, and `src/home-motion.css` holds their styles. Adjust `sculptureScrollScreens`, `sculptureSettle`, `cardDepth`, and `cardTilt` in `src/config.js`.

Edit durations in `src/config.js`; `brandIntro` controls the wordmark’s entrance. `page-motion.js`, `dialogs.js`, `disclosures.js`, and `motion.js` separate page entrances, navigation, expansion, and scrolling. `src/boot.js` only restores display preferences before paint. The footer motion control cancels active effects and restores static layouts.

## Checks

```sh
npm run check
npm run build
npm run test:browser
```

The browser suite uses installed Google Chrome on macOS. On other systems, run `npx playwright install chromium` once. It tests the production preview, starts that server if needed, and saves failure traces in `artifacts/`.

For mobile Lighthouse audits, run the production preview and use Node 22.19+:

```sh
npm run audit:site
```

To audit specific pages, use `npm run audit:site -- /about/ /contact/ /resume/ /work/ /blogs/`.

Reports are saved in `artifacts/audits/`. SEO scores on the preview intentionally reflect the `noindex` restriction. Keep that restriction until the site is ready for public release.

See [docs/PAGE-MAP.md](docs/PAGE-MAP.md) for all 18 page URLs.

See [VALIDATION.md](VALIDATION.md) for the completed checks, measured scores, and remaining launch requirements.

## Assets and licenses

Current project artwork is drawn locally by `scripts/create-profile-art.mjs` using `scripts/project-art.json`. It illustrates workflow, pattern, and state concepts; it is not represented as production UI. `npm run art` regenerates those files and the social card. Sumit’s portrait was converted from his existing portfolio asset. Do not replace the illustrations with healthcare captures containing personal records.

Space Grotesk and Inter are self-hosted; their licenses are in `public/fonts/`. Lucide uses the ISC license, Three.js uses MIT, and GSAP is free under its standard license. Dependencies are installed through npm with a committed lockfile. The social card uses the portfolio’s actual palette and headline.
