// Copyright 2026 Ix Infrastructure Inc.

// A Sätteri mdast plugin that prefixes root-relative links in the docs with the
// site's base path.
//
// The site is served under a base (/oss/ on docs.ix-infra.com). Astro puts that
// base on the URLs it generates — the sidebar, assets, the favicon — but not on
// links written inside a page. Pages keep writing /reference/commands/, and this
// turns it into /oss/reference/commands/, so the content does not have to know
// where the site is mounted. It covers Markdown links and definitions, and
// href/src in raw HTML.
//
// Two things it cannot reach, which use page-relative links instead: front
// matter (the home page's hero), which is not Markdown, and attributes on MDX
// components such as LinkCard, which Sätteri does not let a plugin rewrite.

import { defineMdastPlugin } from 'satteri'

const ROOT_RELATIVE = /^\/(?!\/)/

export function withBase(url, base) {
  if (!base || !ROOT_RELATIVE.test(url) || url === base || url.startsWith(`${base}/`)) return url
  return base + url
}

export function baseLinksPlugin(base) {
  const prefix = base.replace(/\/+$/, '')

  const url = (node, ctx) => {
    const next = withBase(node.url, prefix)
    if (next !== node.url) ctx.setProperty(node, 'url', next)
  }

  return defineMdastPlugin({
    name: 'ix-docs-base-links',
    link: url,
    definition: url,
    html(node, ctx) {
      const next = node.value.replace(/\b(href|src)="(\/[^"]*)"/g, (_, attr, link) => `${attr}="${withBase(link, prefix)}"`)
      if (next !== node.value) ctx.setProperty(node, 'value', next)
    },
  })
}
