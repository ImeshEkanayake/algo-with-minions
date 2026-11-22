from pathlib import Path
import json
root = Path(__file__).resolve().parents[1]
sources = {name: (root / "tree-sources" / (name + ".py")).read_text() for name in ["bst", "avl", "multiway"]}
(root / "tree-programs.js").write_text("(function(global){global.TreePrograms=" + json.dumps(sources, ensure_ascii=False) + ";})(typeof window!=='undefined'?window:globalThis);\n")
