---
name: Bug report
about: LaTeX kompilerer ikke / CI rød
labels: bug
---

**Hvad sker der?**
`make pdf` → `main.log` linje `!` / `Missing number` / `Citation.*undefined`

**Repro:**
```bash
make clean && make pdf
grep -n "^!" main.log
```

**Forventet:** `0` `!`, `CI` grøn

**Miljø:** TeX Live `2026` / Overleaf / `latexmk -v`

