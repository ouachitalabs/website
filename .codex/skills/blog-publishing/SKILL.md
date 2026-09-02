---
name: blog-publishing
description: Draft or publish an Ouachita Labs blog post using the site's article template, including header-image generation and link checks.
---

# Blog publishing

Use this skill to create a post outline for this repository, or when the user says to **publish** an existing draft.

The reusable source is [assets/blog-post-template.html](assets/blog-post-template.html). Copy it to `posts/<slug>/index.html`; its relative paths are intentionally written for that location. Keep one draft per post in that path—publication is a state change in the file, not a move to an untracked location.

## Outlining a post

For a new post request, write an outline—not the article's finished contents. Provide a working informational headline, deck, intended reader, key takeaway, header-image visual thesis, and 3–5 descriptive section headings with the claims, evidence, and links each section should cover. Do not draft body paragraphs, fabricate supporting evidence, or turn the outline into post copy unless the user explicitly asks for that next.

- Inspect `index.html` and `styles.css` before changing the template if the site design has evolved. The template relies on the existing shared article CSS, plus the established quartz, carbon, pine, blue, Instrument Sans, Vollkorn, and Fragment Mono system.
- When asked to create the site draft after an outline is approved, copy the template and replace only the metadata and structural placeholders needed for the draft. Keep the body-copy placeholders until the user asks to write the post. Use semantic HTML and keep the heading hierarchy sequential.
- Write an informational, sentence-case headline that says both the concrete subject and why it matters. Prefer a concise benefit or finding plus a precise topic, such as “Better answers, broader thinking: What students gain from ChatGPT and critical-thinking training.” Avoid vague announcements, title case, and claims the post cannot support.
- Keep the `HEADER IMAGE PROMPT` comment in drafts. Personalize its `[[visual thesis]]` from the article's actual point, then use it to create a text-free, rights-cleared header image. Place the result at `assets/posts/<slug>-header.webp`, set the image `src` and meaningful `alt`, and retain a short factual caption only when it helps the reader.
- Use absolute production URLs in canonical and Open Graph metadata (`https://ouachitalabs.com/...`) and relative paths only for local site assets and navigation.

## When the user says “publish”

Treat “publish” as authorization to finish the named draft and promote it within this repository. If no draft is identifiable, ask which post to publish.

1. Read the complete draft and its linked local pages. Generate or add the header image if it is still a placeholder; do not use the generation prompt itself as visible copy or image alt text.
2. Remove the entire `HEADER IMAGE PROMPT` comment and every remaining `[[...]]` placeholder. Set the publication date, page title, description, canonical URL, Open Graph fields, hero image, alt text, and any declared topic label.
3. Promote the post by adding it, newest first, to the site's writing/news index when one exists. Include its category, date, title, short deck, and link. If the repository has no writing index yet, add a compact “Latest writing” link/card in the established homepage content rather than inventing a new navigation or external promotion channel. Do not post to social platforms, email lists, or third-party services unless the user explicitly asks.
4. Validate links before finishing: verify every local `href` and `src` resolves from the post; verify every HTTP(S) link returns a successful response or an expected redirect. Fix broken links and remove any unresolved placeholder. Also check that `mailto:`, fragment, `tel:`, and canonical links are syntactically valid.
5. Inspect the post in a browser or local static preview when available, checking the header image crop, typography, mobile width, visible links, and footer. Report the published file, promotional surface changed, and validation outcome.

Do not claim the post is deployed externally unless the user separately asks to deploy it and that deployment succeeds.
