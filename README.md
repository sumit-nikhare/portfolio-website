# Sumit Nikhare — Product Designer

A static product-design portfolio with an interactive Three.js sculpture, seven résumé-based project summaries, a four-part playground, accessible dialogs, a persistent motion preference, and dedicated About, Contact, Résumé, Work, and Blog pages.

The site contains Sumit’s identity, verified contact details, career history, education, skills, and selected projects from the supplied résumés. The current designation is **Product Designer at Khushi Baby, April 2026–present**. Senior UI/UX Designer remains the historical role for January 2023–March 2026.

The site stays in **local preview** until publication review. Project visuals are clearly labeled workflow illustrations; the original healthcare captures were not copied. Metrics retain their résumé context. Blog essays are newly written design notes, and references are available on request instead of invented testimonials. See [docs/PROFILE-SOURCES.md](docs/PROFILE-SOURCES.md) for content provenance.

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

| Change                                                          | Where to edit                                                                       |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Homepage text, project cards, services, about, and testimonials | `index.html`                                                                        |
| Name, menu, and footer                                          | `src/partials/header.html`, `src/partials/footer.html`, `src/partials/dialogs.html` |
| Case-study text and evolution stages                            | `projects/<project>/index.html`                                                     |
| Playground explanations                                         | `playground/index.html`                                                             |
| Colors, typography, spacing, breakpoints                        | Variables and rules in `src/styles.css`                                             |
| Project images                                                  | `public/assets/`                                                                    |
| Motion timings and behavior                                     | `src/config.js`, then modules in `src/modules/`                                     |
| Public address and content-readiness flags                      | `site.config.json`                                                                  |

### Replace a project

1. Edit its homepage title, description, and links.
2. Replace the associated case-study text with your real problem, role, decisions, evidence, and outcomes.
3. Add compressed WebP or AVIF artwork to `public/assets/`. Keep width/height attributes accurate and write descriptive `alt` text. Avoid putting essential text only inside images.
4. Update the image `src`, the smaller-file `srcset` variants, and its surrounding viewer link `href`. `data-caption` supplies the full-screen image description. All links sharing `data-gallery` belong to one gallery.
5. Update the homepage image’s `data-texture` attribute. The 3D sculpture uses these image paths automatically.
6. Rename the project folder if desired, then update links and the next-project navigation. Update the menu’s `data-preview` values to match the new cover filename prefix.

Use each project’s inline `--accent` value to adjust its color. Ensure the new color remains readable against charcoal.

### Add another case study

Copy `templates/case-study.html` to `projects/your-project/index.html`. Replace Forma’s text, image filenames, IDs, metadata, and next-project link. Add its card to `work/index.html`, optionally feature it on the homepage, and update the project and category counts. Run `npm run format` after editing to keep the code readable. HTML pages are discovered automatically during the build; you do not need to maintain a route list.

The template stays outside the build. It is a starting point, not a public page.

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

| Page    | Editable file                | Main content                                                                                   |
| ------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| About   | `about/index.html`           | Six sections: introduction, principles, capabilities, journey, communication design, next step |
| Contact | `contact/index.html`         | Intro, contact methods, brief form, FAQs                                                       |
| Résumé  | `resume/index.html`          | Printable experience, skills, education, and selected work                                     |
| Work    | `work/index.html`            | Seven project cards and category labels                                                        |
| Blog    | `blogs/index.html`           | Three article cards, topics, and reading estimates                                             |
| Article | `blogs/<article>/index.html` | Full essay, section index, source links, and related reading                                   |

The new layouts live in `src/pages.css`, which is imported by the shared stylesheet. The page-research rationale and source links are in [docs/PAGE-RESEARCH.md](docs/PAGE-RESEARCH.md).

When changing a work card, update its `data-category`, `data-title`, image sources, and case-study link. Update the filter counts too. Keep the seven case studies' next-project links in a complete loop. Filtering and grid/list preferences use URL parameters, so refresh and browser return preserve the current view.

To add an article, copy `templates/article.html` to a new folder under `blogs/`. Replace the title, metadata, essay, section IDs, attribution, reading estimate, and related-article link. Add its card to `blogs/index.html`; search uses the card's `data-title`. No backend or CMS is required. Review the authored design notes before setting `articlesVerified` to true. Identity, contact, and résumé verification are already complete.

`npm run art` regenerates the current workflow illustrations from `scripts/project-art.json`. It overwrites those image files. The older concept generators remain available as `art:concept` and `art:extra` for reference; they are not the selected-work content.

### Add testimonials

The homepage currently describes collaboration and offers references on request. To add quotes, supply authentic approved wording with each person’s name, role, and project. `testimonialsVerified` can be marked true after reviewing either authentic quotes or the current omission of testimonials.

### Understand shared markup

`<!-- include:header -->`, `<!-- include:footer -->`, and `<!-- include:dialogs -->` are expanded by Vite into ordinary HTML, so navigation and content do not rely on JavaScript. `%BASE_URL%` keeps asset and page URLs working both at a domain root and under a GitHub project path.

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

### Light and dark themes

The footer groups the **Dark theme / Light theme** button beside the motion control. Dark is the default. A visitor’s choice is saved under `intent-portfolio-theme`, applied before the loader and page paint, and shared across open tabs. With browser storage blocked, switching still works for the current page. Without JavaScript, the original dark design and static content remain available.

Edit `src/theme.css` to adjust the light palette and themed components. Warm ivory, dark ink, sage surfaces, and deeper green text retain the original typography and composition. Electric lime remains on filled controls and artwork; project accent text is darkened for contrast. Images retain their original colors. Menus, media controls, the loader, forms, and playground respond to the theme; the résumé keeps its print document styling.

Theme behavior is in `src/modules/theme.js`, with early restoration in `src/boot.js`. Theme changes do not reset motion preferences, restart the sculpture, or change the five-second loader schedule. The switch uses native button keyboard behavior and announces its current state and next action.

For light-theme visual review with the production preview running:

```sh
PORTFOLIO_THEME=light node scripts/profile-review.mjs / /about/ /contact/ /resume/ /work/ /playground/
```

Screenshots are written to `artifacts/theme-review/`.

### Motion editing

The loader runs for **five seconds on visits 1, 6, 11, and so on**. Each full page opening or refresh counts as a visit; the counter is kept locally in the browser across tabs and sessions. A browser history restore from memory does not add a visit. Clear the `intent-portfolio-visits` local-storage entry (or use a fresh private window) to replay the first visit.

During those five seconds, the full-screen loader holds pointer, keyboard, and scrolling interaction with the page. Clicks, Escape, and other page keys cannot dismiss it early. The rotating mark and shutter exit fit within the five-second duration, and page entrances begin when the hold ends. Reduced-motion visitors receive the same five-second interlude with a static design. The release timer runs independently of the app bundle, so failed animation downloads still release the page. JavaScript-disabled visitors receive the ordinary static site. If browser storage is blocked, each page opening uses the first-visit behavior.

Every page has a title entrance. The full-screen menu reveals its links in sequence, animates focused/hovered project previews, and reverses into a closing wipe. Accordions expand and collapse smoothly, including during repeated activation; design-evolution tabs resize their container and bring in the selected panel. Project and blog cards reveal on scroll, with restrained desktop parallax and a page-progress line. Scrolling remains native.

Edit durations in `src/config.js`; `loaderDuration` controls seconds and `loaderEvery` controls the repeat interval. Rebuild or restart Vite after changing these two values because the bootstrap settings are injected into HTML at build time. Loader text is in `src/partials/loader.html`; visual motion rules are in `src/motion.css`. `page-motion.js`, `dialogs.js`, `disclosures.js`, and `motion.js` in `src/modules/` separate page entrances, navigation, expansion, and scrolling. The small `src/boot.js` runs before first paint to honor saved motion preferences and manage the visit counter and independent five-second release. The footer’s motion control cancels active effects and restores readable, static layouts. Changing motion mode during a loader hold changes its animation without shortening the required duration.

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
