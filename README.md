# Trekking Buddha — Redesign v2 ("Snow")

A second, cleaner and more customer-focused redesign proposal for [trekkingbuddha.com](https://trekkingbuddha.com/).
Photos, trek posters and the logo belong to Trekking Buddha and come from the current site. The logo is used **unchanged**.

## What's new in v2
- **Trifold front page.** Three brochure-style panels (Nepal base camps · the Sleeping Buddha · offbeat Sikkim & North-East) unfold on load. Hover to expand a panel, click to see its treks.
- **Snowfall.** A light canvas snow effect over the trifold that drifts with your mouse, with an on/off switch. It is off automatically for visitors who prefer reduced motion.
- **A new Remotion journey.** A live `@remotion/player` animation: pick a trek and the Buddha walks its typical route on a snowy topographic map, with checkpoints lighting up, the progress drawing in, and a summit flag. It is rendered in the browser, so there is no video file.
- **Customer-first booking.**
  - A hero trek finder (where + level).
  - Country and level filters with smooth View Transitions.
  - A trek detail drawer showing the typical route.
  - One-tap WhatsApp booking from every departure date.
  - An enquiry form and a sticky mobile booking bar.
- **Clean, minimal structure.** A light snow-white theme, a serif + sans type pairing, plenty of white space, Lenis smooth scrolling, a scroll progress line, and an FAQ accordion based on the brand's own policies.

> Trek levels and routes are *indicative* (typical published routes). The site says that the final itinerary, price and inclusions come from the team.

## Develop
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs the static site to docs/
```

## Publish (GitHub Pages)
The built site is committed in `docs/`. Go to Settings → Pages → *Deploy from a branch* → `main` / `/docs`.
It will be live at `https://<user>.github.io/demowebsite2/`.

## Structure
```
src/App.tsx                 all sections: trifold, finder, journey, departures, story, gallery, FAQ, contact
src/components/Snow.tsx     canvas snowfall
src/remotion/JourneyMap.tsx Remotion composition: the snowy route journey
src/remotion/Monk.tsx       the walking Buddha character
src/data.ts                 treks, departures, gallery, FAQ (edit content here)
public/                     logo (unchanged), photos
docs/                       production build for GitHub Pages
```
