# Explorer design

The animated characters remain the visual centre. Controls, source and variables share one execution history across Sorting, Searching, Trees and Graphs.

Palette: ink #0a101b, panel #111c2b, blue #80bdff for probes, yellow #f9ce45 for characters, mint #67df9b for confirmed matches, muted #9badc2 for supporting text. Humanist Trebuchet text and monospace code match the existing site.

Searching keeps characters in their original columns. Blue outlines mark probes, fading marks eliminated candidates, and a green outline confirms a found index. Boundary labels follow the actual code variables. The sentinel is explicitly marked while its temporary value is installed and restored. A target input sits beside the array. Ordered algorithms validate their precondition and offer an explicit Sort input action.

Navigation separates Sorting, Searching, Trees and Graphs. Trees contains working families and operations; Graphs groups traversal, ordering, spanning trees, paths, reachability, flow, colouring and exhaustive tours. Four code controls wrap beneath the heading in narrow panels, with 44px touch targets and instant three-second descriptions.


Trees use a separate node-and-link scene inside the shared workbench. Key identities and node-reference identities are distinct: letters follow keys while N-labels identify the actual node objects. This lets successor transplants and multiway promotions remain honest to the code. Nodes referenced by active frames remain visible after detachment; held scalar keys use an amber tray. Temporary sharing is drawn as actual links rather than duplicating objects. Changed links use blue dashed strokes. Heights and balance reflect stored AVL state, including intermediate updates. Completed operations centre the final rooted tree and then celebrate. Pan and zoom are confined to the scene, with readable labels, while the source and variable panels remain outside it.


Graphs keep vertices fixed in an input-ordered ring, with the same yellow portraits as Trees. This makes edge choices and backtracking easy to follow without reshuffling the topology between steps. Blue rings/links show the current comparison; green marks visited vertices, settled distances or accepted forest edges; yellow shows queued vertices or the current path. Colours carry explicit numeric labels. Flow labels use forward flow/capacity; dashed orange reverse links expose residual cancellation. A short blue token moves along a considered edge after a user/playback step. The scene has its own pan and zoom; all motion respects reduced-motion settings.

The editor is a disclosure beside source/example controls so the graph stays prominent. The vertex readout maps labels to Python's actual 0-based indices. Readable tables below the scene expose evolving distances, closure or residual capacity, with changed cells highlighted and the active i,j cell outlined. The graph-specific queue and call-path readouts complement the full source-variable inspector. Failure states (cycles, negative cycles, missing tours, colouring local minima) are visible outcomes with no success celebration. Program sources, snapshots and input configuration stay separate: stepping restores exactly the previous code state without recomputing an inverse operation.
