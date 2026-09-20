# Deploy this portfolio for free

The project is ready to upload as a **public preview**. No site has been published by this setup. It keeps the existing design, fictional-sample labels, freelance placeholders, and search-indexing restrictions. A public preview is accessible to anyone with its address; `noindex` is not password protection.

## Recommended: Cloudflare Pages, without GitHub

Cloudflare Pages supports free static hosting and a `pages.dev` address. Its dashboard accepts a built folder or ZIP, so you do not need to make your source repository public. See [Cloudflare Pages](https://www.cloudflare.com/products/pages/) and the [Direct Upload instructions](https://developers.cloudflare.com/pages/get-started/direct-upload/).

1. Sign in to Cloudflare and open **Workers & Pages → Create application → Get started → Drag and drop your files**.
2. Choose a project name. Upload `artifacts/deployment/portfolio-preview.zip`, or the `dist` folder.
3. Select **Deploy site**. Cloudflare supplies your HTTPS `pages.dev` address; name availability determines the exact address.
4. Open the live Home, Work, Contact, résumé download, and `/projects/sample-continuum/` pages. Refresh a project page to confirm direct navigation.

For later changes, rebuild, then upload the new `dist` folder through **Create a new deployment** in the same project. The supplied ZIP is a snapshot and does not update when you edit source files.

Cloudflare does not let an existing Direct Upload project switch to Git integration. If you later want automatic deployments from commits, create a new Pages project connected to Git instead. [Direct Upload limitations](https://developers.cloudflare.com/pages/get-started/direct-upload/)

## Build after making changes

Install Node.js 22; `.nvmrc` records this version. From the project directory:

```sh
npm ci
npm run build:deploy
```

This checks deployment settings and content status, runs the Node regression tests, builds the static pages, and verifies local links, assets, fragments, accessible ID references, and indexing rules. The finished website is in **`dist/`**. Upload that folder, not the source folder or `node_modules`.

Root hosting is the default (`BASE_PATH=/`). No account token, paid service, backend, or environment secret is required to build. The contact form prepares an email draft in the visitor's own email app; it is not a server-based message delivery service.

Once the real address is known, optionally add it to `site.config.json` as `origin`, for example `https://your-project.pages.dev`, keeping `base` as `/`. Rebuild and upload to give link previews absolute social-image URLs and canonical metadata. A blank origin is allowed during preview; an indexed release requires the actual HTTPS host. Never put a project path in `origin`.

You can also pass host settings for a single build without editing the file:

```sh
SITE_ORIGIN=https://your-project.pages.dev BASE_PATH=/ npm run build:deploy
```

Replace the example address with your actual one. Environment values override `site.config.json` for the build, output checks, and generated metadata together.

## Another free option: Netlify

Sign in and open [Netlify Drop](https://app.netlify.com/drop). Drag in the built `dist` folder and use the assigned `netlify.app` address. Subsequent updates go to the existing site's Deploys page. Manual deployment does not require GitHub. [Netlify manual deployments](https://docs.netlify.com/deploy/create-deploys/)

Netlify's current Free plan includes **300 usage credits per month**; a site can pause when the allowance is exhausted until the next cycle. This makes Cloudflare my preferred option for this static portfolio. [Netlify Free plan](https://www.netlify.com/pricing/personal-vs-free/)

The included `netlify.toml` also supports a future Git-connected Netlify build: Node 22, `npm run build:deploy`, output directory `dist`. No account has been linked by this configuration.

## Automatic Cloudflare builds from Git

If you prefer automatic updates from the start, use Cloudflare Pages' Git integration instead of Direct Upload. Select the repository and `main` branch with these build settings:

| Setting          | Value                                                |
| ---------------- | ---------------------------------------------------- |
| Framework preset | None                                                 |
| Build command    | `npm run build:deploy`                               |
| Output directory | `dist`                                               |
| Root directory   | Repository root                                      |
| `NODE_VERSION`   | `22`                                                 |
| `BASE_PATH`      | `/`                                                  |
| `SITE_ORIGIN`    | Your actual `https://…pages.dev` host, once assigned |

Omit `SITE_ORIGIN` for the first preview build if the address is not yet known. Add it after the address is assigned, then deploy again. [Cloudflare Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)

## GitHub Pages is also ready

This repository already h as a GitHub Pages workflow. Its configured remote is `sumit-nikhare/portfolio-website`.

1. For hosting on GitHub Free, use a public repository.
2. Open the repository's **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. Commit these deployment changes and push to `main`, or run **Publish portfolio** from the Actions tab after the workflow is pushed.
4. Wait for both build and deploy jobs to finish. With the current repository name and no custom domain, the expected address is **`https://sumit-nikhare.github.io/portfolio-website/`**. The workflow's deployment result provides the actual address.

GitHub supplies its origin and base path to the build automatically, so you can leave the local root-hosting defaults unchanged. Later pushes to `main` publish updates. The workflow runs the same tests and built-output checks before deployment. GitHub Free Pages requires a public repository, so committed source and assets are visible. [GitHub Pages setup](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) · [GitHub Actions publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

To reproduce that hosting path locally:

```sh
SITE_ORIGIN=https://sumit-nikhare.github.io BASE_PATH=/portfolio-website/ npm run build:deploy
```

This output is for GitHub's subdirectory. Run a root build again before uploading to Cloudflare or Netlify:

```sh
SITE_ORIGIN= BASE_PATH=/ npm run build:deploy
```

## When the content is ready for a final release

Preview deployment is already allowed. Keep `preview: true` while project years, freelance details, authentic testimonials, and article review are incomplete. Do not set verification flags simply to pass a check.

For an indexed release:

1. Replace or remove incomplete project/freelance material and testimonial prompts. Review project evidence, imagery, years, claims, and article authorship. Approved original experiments and the explicitly fictional Continuum sample can remain.
2. Set the remaining verification flags to `true` only after those reviews; a removed testimonial section can be marked reviewed. Already verified identity/contact/résumé flags stay as they are.
3. Configure the actual hosting origin/base, set `preview: false`, and run `npm run release:check` followed by `npm run build:deploy` using the same hosting settings.
4. Complete the pending browser review recorded in `VALIDATION.md`, then upload or push the new build.

Preview builds include `noindex` HTML, restrictive `robots.txt`, and no sitemap. Cloudflare/Netlify also receive a generated `_headers` file with `X-Robots-Tag: noindex, nofollow`; GitHub relies on the HTML metadata. These are requests to search engines, not access controls or a guarantee that an already indexed URL disappears immediately. Final releases generate the sitemap; Continuum remains `noindex` and outside it.

All three options provide HTTPS and a host-owned address. A custom domain is optional and its registration is outside the ₹0 budget. Plan details above were checked on **20 September 2026**. No hosting account, repository visibility, domain, or public deployment was changed during this preparation.
