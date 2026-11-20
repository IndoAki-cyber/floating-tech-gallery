<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Document-level integration scripts belong before the closing body in `src/routes/__root.tsx`; TanStack Start uses this shell instead of a root `index.html`.
- Keep rebuild effects in the landing-page overlay wrapper, using temporary opacity and cancellable browser animations rather than changing page geometry; this preserves layout and restores original interactions after skip or unmount.
- Use a single native IntersectionObserver builder beneath the replay wrapper for both initial viewport and scroll reveals; one owner prevents competing animation overlays and preserves built sections while navigating the page.
- Keep Swarm startup local to the landing-page wrapper and observe inserted content; external startup scripts can block loading or duplicate the native builder.
- Assign targets through the shared Swarm role classifier and animate only visual properties; each cursor owns one role and text/image reveals retain original content and geometry.
- Update cursor transforms directly through DOM refs and cache target rectangles between scroll/target changes; animation frames must not rerender the shop or repeatedly measure layout.
