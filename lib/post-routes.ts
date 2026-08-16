export function postViewHref(slug: string) {
  return `/posts/view?slug=${encodeURIComponent(slug)}`
}

export function postEditHref(slug: string) {
  return `/posts/edit?slug=${encodeURIComponent(slug)}`
}
