# Instrucciones para el Agente

## Repositorio
- Remoto `origin`: `https://github.com/santiagosessa/ALGEBRA-TP.git`
- Trabajar desde `D:\Presentacion ALGEBRA`; la web app reside en `face-lab\`.

## Antes de Editar Código
- Inspecciona el estado más reciente, tanto remoto como local, antes de realizar cualquier cambio en el código:

```powershell
git fetch origin
git status --short --branch
git log --oneline --decorate -5
git diff --stat
```

- Si el worktree está limpio, realiza un fast-forward desde `main` antes de editar:

```powershell
git pull --ff-only origin main
```

- Si existen cambios locales, inspecciónalos y presérvalos; nunca hagas reset, checkout ni sobrescribas el trabajo del usuario.

## Package Manager
- Usa **npm** en `face-lab\`: `npm install`, `npm run dev`.
- Mantén las dependencias locales; no agregues dependencias de CDN en runtime.

## File-Scoped Commands
| Task | Command |
|---|---|
| Comprobar sintaxis del servidor | `node --check face-lab\server.mjs` |
| Renderizar assets de la presentación | `node face-lab\scripts\render-google-deck.mjs` |
| Ejecutar aplicación | `npm run dev` desde `face-lab\` |

## Commit y Push
- Después de completar cada cambio de código, revisa `git diff`, añade al stage solo los archivos previstos, haz commit y push:

```powershell
git add <intended-files>
git commit -m "Describe el cambio"
git push origin HEAD:main
```

- No hagas force-push. Si pull, commit o push fallan, reporta el bloqueo exacto en lugar de ignorarlo.

## Autoría y Contribuidores
- El único autor y contribuidor de este repositorio es **santiagosessa** (`santiagosessa <santiagosessa07@gmail.com>`).
- **PROHIBIDO** agregar líneas de coautoría o atribución como `Co-Authored-By: ...` (incluyendo `Co-Authored-By: OpenAI Codex <noreply@openai.com>` o cualquier otra IA o entidad) en los mensajes de commit.
- Ninguna IA ni agente debe figurar como autor, co-autor ni contribuidor.


## Convenciones Clave
- Mantén el presentador 3D fijo a la derecha y el deck visual layer a la izquierda.
- Prefiere transforms y GSAP timelines para las animaciones; respeta `prefers-reduced-motion`.
- Preserva los assets locales en `face-lab\presentation-assets\` y `face-lab\models\facecap.glb` utilizados por la página.

Agrega al commit una breve descripción del cambio hecho

## Contenido generado por IA
- No publiques en GitHub contenidos hechos por o para IAs: prompts, respuestas, transcripciones, datasets, assets generados, outputs de herramientas, credenciales ni archivos temporales.
- Antes de hacer commit, revisa el stage y excluye ese material; publica únicamente código, configuración y assets originales autorizados por el usuario.
