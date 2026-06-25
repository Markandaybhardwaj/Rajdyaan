// ---------------------------------------------------------------------------
// Root page — re-exports the (public) homepage
// ---------------------------------------------------------------------------
// In Next.js App Router, if both app/page.js and app/(public)/page.js exist,
// the root page.js takes precedence for the "/" route. We keep the homepage
// logic in (public)/page.js for clean route grouping, and re-export here.
// ---------------------------------------------------------------------------
export { default } from './(public)/page';
export { revalidate } from './(public)/page';
