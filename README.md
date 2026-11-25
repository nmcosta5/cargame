# Nzabana Merci — Portfolio

Personal portfolio of **Nzabana Merci**, a Rwandan Full-Stack Software Developer. The page sits on a live 3D highway scene built with **React, Vite, Three.js and React Three Fiber**; the camera moves as you scroll.

The site also includes **APEX RUN**, a playable 3D arcade racer. Open it from the "Play APEX RUN" button or the APEX RUN project card. Press `Esc` or the close button to go back to the portfolio.

Portfolio content (about, education, skills, projects and so on) is in `src/data.js`.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The production-ready site is generated in `dist/`.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Steer | A / D or ← / → | Left / right |
| Accelerate | W / ↑ | Gas |
| Brake | S / ↓ | — |
| Nitro | Space | Nitro |
| Pause | P / Esc | Pause button |

## Deploy

This is a Vite app. For GitHub Pages, configure the repository Pages workflow to build with `npm ci && npm run build` and publish the `dist` directory. Vercel can deploy it directly with the Vite preset.

---
Built for the open road.