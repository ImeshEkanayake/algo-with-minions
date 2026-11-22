# Algo with Minions

A responsive, front-end-only sorting, searching and tree algorithms explorer. Open `index.html` in a modern browser, or serve this directory as a static website. No build, database or external assets are required. Array input and saved preferences remain in the browser.

Sorting: bubble, selection, insertion, merge, quick, heap, ordered-key counting, pancake and exhaustive sorting.

Searching: linear, sentinel, binary and ternary. Sentinel is clearly labelled as an extra beyond the course tutorials. Enter a target alongside the array. Searching supports up to 16 values, with explicit 8-, 12- and 16-value examples and an 8-value default whenever Searching is opened or the page is reloaded; larger arrays scroll within the animation on narrow screens and the viewport follows the active probe. Linear and sentinel return the first matching index; binary and ternary return any matching index. Ordered searches reject descending input; the explicit Sort input action is available before trying again. Sentinel search visibly installs and restores its temporary last-element value. Characters retain their original columns, candidates fade as they are eliminated, and a green outline confirms the returned index. Sorting hats are reserved for sorting.

Controls include one-second Quick Run/Pause toggles in both control bars, individual executed-line steps in both directions, restart, scoped live variables, call stacks and code-header playback and Reset buttons with instant descriptions that dismiss after three seconds. State history includes arrays, counters, recursion levels, temporary values and algorithm-confirmed final positions. Animation metadata is kept outside the displayed Python.

Numeric input supports finite JavaScript numbers, including negatives, zero, decimals and scientific notation. Plain integer literals outside the exact JavaScript integer range are rejected. Standard algorithms accept up to 10 values; exhaustive sort accepts up to 6. Empty arrays are supported. Ordered-key counting includes comparison-based key compression, so its displayed bound is O(n + k log k).

Trees: BSTs, AVL trees, 2–3 trees, and balanced multiway trees (orders 3–6). Each family supports search, insert, delete, construction, preorder, inorder and postorder. Enter an insertion order of up to 16 finite keys and an operation key; duplicates follow set semantics and are ignored. Each run starts from the configured insertion order. Construction starts from empty. Worked examples cover leaf/one-child/two-child deletion, all four AVL rotation patterns, and 2–3 split/merge cascades. Node references, child pointers, heights, temporary held nodes/keys, traversal output and call stacks are visible and reversible. Key characters retain identities as nodes rotate, successors move and promoted keys change boxes. Pan/zoom controls keep larger trees readable, and completion recentres the final tree.

The tree programs displayed in the Python panel are executed by a small browser-local interpreter for the trusted bundled programs. There is no Python server or arbitrary code execution input. Sources live in `tree-sources/`; regenerate their browser bundle with `npm run bundle:trees` after editing. The Python parity test verifies line execution and locals against actual Python. Multiway search is covered in the course; the balanced B-tree insertion/deletion implementation extends that demonstration.

Graphs remains a collection preview, and hashing remains a planned searching extension. This release focuses on Trees.

Validation:

- `node tests/engine.test.cjs`: 411 algorithm/input runs and 40,146 immutable snapshots, including negative/positive values, zero, decimals, duplicates, extremes and empty arrays.
- `node tests/search-engine.test.cjs`: 1,136 searches and 16,973 snapshots, including sentinel restoration, duplicate/missing targets, extremes and signed zero. A Python 3 differential check executes the displayed source and compares all lines and locals against 72 JavaScript traces. Python is a development verification dependency only.
- `tests/search-ui.test.mjs`: all four searching flows, target/ordering validation, exact history, signed-zero persistence, reset and playback, grouped tree menus, graph preview, ten desktop widths and six touch widths.
- `node tests/tree-engine.test.cjs`: 3,458 tree operations and 150,159 snapshots, checking BST ordering, AVL balance/stored heights, multiway occupancy and equal leaf depth, traversals, deletions, duplicates and immutable history.
- `node tests/tree-python-parity.test.cjs`: 49 complete traces agree with actual Python lines, references, locals and call stacks.
- `tests/tree-ui.test.mjs`: all four families and seven operations, worked examples, exact playback history, zoom, persistence, and desktop/touch containment.
- Browser checks in `tests/ui.test.mjs`: nine sorting flows, exact backward/forward restoration, playback, input validation, recursion and containment at 10 widths from 320 to 1440 pixels.
- `tests/code-controls.test.mjs`: synchronized header controls, pause state and touch-screen containment with 44-pixel controls.

Browser tests use Playwright. Install development tools with `npm install` and `npx playwright install chromium`, then serve the repository with `python3 -m http.server 4318`. In another terminal run `npm run test:ui`. You can override `PREVIEW_URL` and set `CHROME_PATH` to use a local Chrome executable. The app itself needs no dependencies. Test screenshots are local-only and ignored by Git.

GitHub Pages publishes the static files from the root of the main branch. Pushes to main update the hosted website. The illustrated characters are original SVG drawings; this project is an unofficial educational demo.
