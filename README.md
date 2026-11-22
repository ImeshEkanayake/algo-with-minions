# Algo with Minions

A responsive, front-end-only sorting explorer. Open `index.html` in a modern browser, or serve this directory as a static website. No build, database or external assets are required. Array input and saved preferences remain in the browser.

Implemented: bubble, selection, insertion, merge, quick, heap, ordered-key counting, pancake and exhaustive sorting.

Controls include one-second quick playback, individual executed-line steps in both directions, separate Pause buttons, restart, scoped live variables, call stacks and code-header playback buttons with instant descriptions that dismiss after three seconds. State history includes arrays, counters, recursion levels, temporary values and algorithm-confirmed final positions. Animation metadata is kept outside the displayed Python.

Numeric input supports finite JavaScript numbers, including negatives, zero, decimals and scientific notation. Plain integer literals outside the exact JavaScript integer range are rejected. Standard algorithms accept up to 10 values; exhaustive sort accepts up to 6. Empty arrays are supported. Ordered-key counting includes comparison-based key compression, so its displayed bound is O(n + k log k).

Sorting is implemented. Searching and Graphs are navigation destinations clearly marked as future collections.

Validation:

- `node tests/engine.test.cjs`: 411 algorithm/input runs and 40,146 immutable snapshots, including negative/positive values, zero, decimals, duplicates, extremes and empty arrays.
- Browser checks in `tests/ui.test.mjs`: nine sorting flows, exact backward/forward restoration, playback, input validation, recursion and containment at 10 widths from 320 to 1440 pixels.
- `tests/code-controls.test.mjs`: synchronized header controls, pause state and touch-screen containment with 44-pixel controls.

Browser tests use Playwright. Install development tools with `npm install` and `npx playwright install chromium`, then serve the repository with `python3 -m http.server 4318`. In another terminal run `npm run test:ui`. You can override `PREVIEW_URL` and set `CHROME_PATH` to use a local Chrome executable. The app itself needs no dependencies. Test screenshots are local-only and ignored by Git.

GitHub Pages publishes the static files from the root of the main branch. Pushes to main update the hosted website. The illustrated characters are original SVG drawings; this project is an unofficial educational demo.
