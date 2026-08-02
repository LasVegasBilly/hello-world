# Coast to Coast

A peaceful 3D driving game: cruise Interstate 80 coast-to-coast, from San
Francisco to New York City, on real US geography — actual city coordinates,
elevations, and regional biomes strung together into a drivable route. Leave
the pavement any time and roam the open country. Roll into towns along the
way to trade with a live regional economy: fuel and goods prices drift over
time and differ state to state, so it pays to buy low in one region and sell
high in the next.

Built with [Three.js](https://threejs.org/) + [Vite](https://vitejs.dev/).
No API keys, no external map tiles — the route is generated from real
public coordinates for cities along I-80 and rendered as an original 3D
world, so there's no dependency on (or conflict with) any mapping
provider's terms of service.

## Running it

```bash
npm install
npm run dev       # starts a local dev server
npm run build      # production build to dist/
npm run preview    # preview the production build
```

## Controls

| Key | Action |
| --- | --- |
| `W` / `↑` | Accelerate |
| `S` / `↓` | Brake / reverse |
| `A` `D` / `← →` | Steer |
| `Space` | Handbrake |
| `M` | Open the market when near a town |
| `C` | Cycle camera views |
| `Esc` | Pause |

## How it's built

- `src/data/route.js` — real waypoints (city, state, lat/lon, elevation)
  along I-80 from San Francisco to New York City.
- `src/world/` — projects the route into 3D space, builds the road ribbon,
  a wide corridor of terrain with per-region biomes, scattered scenery
  (trees, rocks, cacti, buildings), and the sky/lighting.
- `src/engine/` — the car's drive physics, chase camera, and keyboard input.
- `src/economy/` — the live regional economy (goods and fuel prices that
  drift over time and vary by state) and the player's money/fuel/cargo.
- `src/ui/` — the HUD (speed, fuel, money, minimap, progress) and the
  in-town market panel.

The cross-country trip is compressed (real headings and elevation are
preserved, but distances are scaled down) so a coast-to-coast drive takes
roughly half an hour to an hour rather than requiring you to literally
drive 2,900 miles.
