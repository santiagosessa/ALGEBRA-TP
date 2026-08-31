# Agent Instructions

## Repository
- Remote `origin`: `https://github.com/santiagosessa/ALGEBRA-TP.git`
- Work from `D:\Presentacion ALGEBRA`; the web app lives in `face-lab\`.

## Before Editing Code
- Inspect the latest remote and local state before every code change:

```powershell
git fetch origin
git status --short --branch
git log --oneline --decorate -5
git diff --stat
```

- If the worktree is clean, fast-forward from `main` before editing:

```powershell
git pull --ff-only origin main
```

- If local changes exist, inspect and preserve them; never reset, checkout, or overwrite user work.

## Package Manager
- Use **npm** in `face-lab\`: `npm install`, `npm run dev`.
- Keep dependencies local; do not add runtime CDN dependencies.

## File-Scoped Commands
| Task | Command |
|------|---------|
| Check server syntax | `node --check face-lab\server.mjs` |
| Render deck assets | `node face-lab\scripts\render-google-deck.mjs` |
| Run app | `npm run dev` from `face-lab\` |

## Commit and Push
- After each completed code change, review `git diff`, stage only intended files, commit, and push:

```powershell
git add <intended-files>
git commit -m "Describe the change"
git push origin HEAD:main
```

- Do not force-push. If pull, commit, or push fails, report the exact blocker instead of bypassing it.

## Commit Attribution
- AI commits MUST include:

```text
Co-Authored-By: OpenAI Codex <noreply@openai.com>
```

## Key Conventions
- Keep the 3D presenter fixed to the right and the deck visual layer to the left.
- Prefer transforms and GSAP timelines for motion; respect `prefers-reduced-motion`.
- Preserve the local `face-lab\presentation-assets\` and `face-lab\models\facecap.glb` assets used by the page.
