# SYNAPSE — A Cosmic Map of the Human Brain

## Original Problem Statement
> "I want to create an application that maps the entire human brain dendrites, axioms,
> and medically accurate sort of representations of how neurons look in synapses when
> they're flashing in the brain, traveling down the spine and activating limbs. I want
> that to be the landing page coming in for short — from a distance up close, and it
> to be cosmic looking."

## Vision
A high-end, cinematic web experience that descends from cosmic dust to the firing of
a single human neuron, then races down the spine to a muscle contraction — built as
an explorable scientific atlas, not just a hero animation.

## Tech Stack
- Frontend: React 19, React Router, React Three Fiber 9, @react-three/drei,
  @react-three/postprocessing, three.js, Framer Motion, Tailwind
- Backend: FastAPI + Motor (MongoDB)
- Hosting: Kubernetes ingress (port 3000 frontend, 8001 backend with `/api` prefix)

## User Personas
- **The Curious Mind** — visitor who has never thought hard about neuroanatomy and
  wants a cinematic introduction.
- **The Pre-Med / Student** — wants medically-accurate visual reference and the
  vocabulary glossary.
- **The Designer / Awwwards browser** — wants to be wowed by the craft.

## Implemented (Feb 22, 2026)
- Sticky-canvas R3F scrollytelling landing with 5 stages:
  Cosmic Dust → Human Silhouette → Brain → Single Neuron → Synapse → Spinal Pathway
- Camera dolly + bloom + vignette postprocessing, golden/azure/phosphor palette
- Glassmorphism overlay UI for each stage with mono-font HUD, progress rail,
  scientific stats (cleft width, conduction speed, etc.)
- `/explore` Interactive Brain Atlas: rotatable 3D brain mesh with clickable region
  markers, region detail panel (function, clinical note, fun fact), 8 region cards.
- `/library` Library of Neural Structures: 7 structures across Neuron / Synapse /
  Pathway categories with expandable detail + metrics.
- Backend endpoints: `/api/regions`, `/api/regions/{id}`, `/api/structures` with
  static neuroscience data (no DB seeding needed; deterministic).
- Custom typography (Cormorant Garamond serif headlines, Outfit body,
  IBM Plex Mono technical labels) — explicitly avoids Inter/Roboto cliché.
- Compatibility shim in `craco.config.js` translating webpack-dev-server v4 hooks
  (`onBeforeSetupMiddleware`, `onAfterSetupMiddleware`, `https`) to v5 API so the
  dev server boots under React 19 + react-scripts 5.

## Architecture Notes
- All 3D scenes are procedurally generated (no external .gltf/.glb assets) using
  `IcosahedronGeometry` with vertex displacement for the brain, `CatmullRomCurve3`
  + `TubeGeometry` for dendrites/axons, `Points` with `AdditiveBlending` for
  cosmic dust and neurotransmitter particles.
- Scroll progress is computed in a single hook (`useScrollProgress`) and passed
  to all stages, which each compute their own opacity via a shared `stageOpacity`
  smoothstep helper.

## Prioritized Backlog
### P0 (next iterations)
- Higher bloom intensity / stronger emissive on the synaptic gold flash so the
  "ignition" moment lands harder.
- Larger / more dramatic brain stage scale (currently reads as small).
- Mobile: shrink overlay copy, swap to single-column glass cards.

### P1 (feature growth)
- AI neuroscience tutor chat on Explorer page (ask questions about each region).
- Audio: subtle ambient drone + synaptic click SFX on flash.
- Reduced-motion fallback: static elegant gallery view of stage stills.
- Per-region 3D fly-to camera moves in the Explorer.

### P2 (delight / sharing)
- Shareable "your neural descent" GIF/snapshot generator at the end of the scroll.
- Donation / Patreon CTA (this is the kind of project that earns evangelists).
- Multi-language text overlay (anatomy is universal vocabulary).

## Next Action Items
1. Run testing agent for end-to-end validation of all routes/APIs.
2. Address any high/medium-priority issues from the test report.
3. Capture feedback from user re: mood (golden vs. cooler azure dominance).
