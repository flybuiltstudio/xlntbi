<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Product file integrity (truncation) checks read only head/tail via Range requests in src/lib/product-file-integrity.server.ts — large exe files do not fit worker memory; it runs in the weekly cleanup and after each product file upload.
- Product detail pages read admin-managed copy directly from the override map — this avoids stale bundled text after runtime catalog mutation.
- Owner-supplied calculators ship as scoped, bundled static entries when their formulas must remain version-controlled — this prevents runtime translation or database state from changing tax logic.
- Built-in calculator language pairs derive from STATIC_CALCULATORS; uploaded calculators share their slug across HU/EN, with round-trip tests for both — this prevents new calculators from missing language navigation.
- Header calculator menus consume the same SSR-loaded ordered catalog as the listing pages, refreshed after admin publish/delete/reorder — this keeps new uploads visible in both language menus without manual entries.
