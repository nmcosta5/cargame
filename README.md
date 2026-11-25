# APEX RUN — 3D Highway Racing

A browser-based 3D arcade racing game built with **React, Vite, Three.js, React Three Fiber and Rapier physics**.

## Features

- Real-time 3D highway scene with perspective camera, lighting, fog, road markings and roadside scenery.
- Rapier WASM four-wheel raycast vehicle controller with suspension rays, spring stiffness, compression/rebound damping, tire grip, rear-wheel drive, front-wheel steering, braking and aerodynamic drag.
- Detailed sport-sedan glTF asset from vinish.dev (CC BY 4.0; attribution below).
- Responsive steering, acceleration, braking and nitro boost.
- Traffic vehicles, collision detection, near-miss bonuses, score and distance tracking.
- Follow camera with subtle motion and speed feedback.
- Keyboard and touch controls, pause/resume, restart and sound toggle.
- Persistent personal best using localStorage.
- Responsive game HUD and start, pause and results screens.

## Vehicle physics and 3D asset

The player vehicle uses Rapier through `@react-three/rapier` with its Bullet-style `DynamicRayCastVehicleController`: four raycast wheels, spring suspension, compression/relaxation damping, tire friction, front steering, rear-wheel engine force, braking and aerodynamic drag. The highway presentation remains endless-runner style, while the chassis and wheel contact/handling are physics-driven.

The player car uses the detailed **Sport Sedan** glTF model by vinish.dev. It includes a detailed exterior, cabin, and four separate wheel nodes that are animated and steered in-game. It is an original unbranded design, not a replica of a specific manufacturer model. Licensed CC BY 4.0. Asset source: https://vinish.dev/free-3d-models/realistic-cars. Credit: “Sport Sedan” by vinish.dev, CC BY 4.0.

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
| Brake | S / ↓ | Brake |
| Nitro | Space | Nitro |
| Pause | P / Esc | Pause button |

## Deploy

This is a Vite app. For GitHub Pages, configure the repository Pages workflow to build with `npm ci && npm run build` and publish the `dist` directory. Vercel can deploy it directly with the Vite preset.

---
Built for the open road.