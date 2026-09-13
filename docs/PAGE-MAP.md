# Page map

The site now contains 18 HTML pages: 17 content pages plus the 404 page.

| Page                                 | URL path                            | Content                                                                                                  |
| ------------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Home                                 | `/`                                 | Three featured projects, overview, about/services teasers, playground, collaboration/references, contact |
| About                                | `/about/`                           | Six sections covering the person and their practice                                                      |
| Contact me                           | `/contact/`                         | Direct contact details, four-field message builder, and FAQs                                             |
| Résumé                               | `/resume/`                          | Career history, printable résumé, and updated two-page PDF download                                      |
| Work                                 | `/work/`                            | Seven projects, category filters, and grid/list views                                                    |
| CHIP-2                               | `/projects/chip-2/`                 | Multi-module public-health platform                                                                      |
| Samasta                              | `/projects/samasta/`                | Primary healthcare application                                                                           |
| CHO Soft                             | `/projects/cho-soft/`               | Facility mobile and dashboard workflows                                                                  |
| AI-enabled dashboard                 | `/projects/ai-enabled/`             | Explainability and human-led review                                                                      |
| ABDM–ABHA                            | `/projects/abdm-abha/`              | Health identity workflows                                                                                |
| Anarock                              | `/projects/anarock/`                | Digital-product components and workflows                                                                 |
| TARP Agile Platform                  | `/projects/tarp/`                   | Reusable component library and workflows                                                                 |
| Playground                           | `/playground/`                      | Four interactive experiments                                                                             |
| Blog / Field notes                   | `/blogs/`                           | Three authored design notes, search, and topic filters                                                   |
| Make the next useful action obvious  | `/blogs/the-next-useful-action/`    | Product-thinking essay                                                                                   |
| Motion should explain what changed   | `/blogs/motion-with-a-purpose/`     | Interaction-design essay                                                                                 |
| A case study is a chain of decisions | `/blogs/show-the-design-decisions/` | Design-practice essay                                                                                    |
| Not found                            | `/404.html`                         | Recovery navigation                                                                                      |

All page URLs are ordinary static paths. Vite adapts them to the configured GitHub Pages base path. Templates under `templates/` are editing starting points and are excluded from the public build.

Old preview project URLs redirect to the corresponding new project in production builds: Forma → CHIP-2, Trace → Samasta, Offscript → CHO Soft, Relay → AI-enabled dashboard, Fieldnote → ABDM–ABHA, Common → Anarock, and Muse → TARP Agile Platform. These seven redirect files are excluded from the content-page count and sitemap.
