# APEX RUN — 3D Highway Racing

A browser-based 3D arcade racing game built with **React, Vite, Three.js and React Three Fiber**.

## Features

- Real-time 3D highway scene with perspective camera, lighting, fog, road markings and roadside scenery.
- Player vehicle with responsive steering, acceleration, braking and nitro boost.
- Traffic vehicles, collision detection, near-miss bonuses, score and distance tracking.
- Follow camera with subtle motion and speed feedback.
- Keyboard and touch controls, pause/resume, restart and sound toggle.
- Persistent personal best using localStorage.
- Responsive game HUD and start, pause and results screens.

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