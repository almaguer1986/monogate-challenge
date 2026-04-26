"use client";
// Tree Viewer — draws any expression's SuperBEST tree as a circuit diagram.
// Input: mathematical expression (same parser as live-optimizer).
// Output: SVG tree. Nodes coloured by operator type. Hover a node to see
// its intermediate value for the sample input x = 2.0. Shows total node
// count and savings vs naïve.

import { useEffect, useMemo, useRef, useState } from "react";

// ── Cost tables (v5.2, positive domain) ──────────────────────────────────────
const SB = {
  exp: 1, log: 1, ln: 1, sqrt: 1, pow: 1, recip: 1,
  mul: 2, div: 2, add: 2, sub: 2, neg: 2, abs: 2,
  sin: 1, cos: 1, tan: 1,
};
const NV = {
  exp: 1, log: 3, ln: 3, sqrt: 8, pow: 3, recip: 5,
  mul: 13, div: 15, add: 11, sub: 5, neg: 9, abs: 5,
  sin: 13, cos: 13, tan: 13,
};

// Category → colour. Used to paint nodes and their header strip.
const CAT = {
  arith: { color: "#e8a020", label: "arith" },
  exp:   { color: "#f87171", label: "exp/log" },
  sqrt:  { color: "#fccb52", label: "radical" },
  trig:  { color: "#c084fc", label: "trig" },
  piece: { color: "#ef4444", label: "piecewise" },
  var:   { color: "#4facfe", label: "variable" },
  num:   { color: "#94a3b8", label: "constant" },
};
function catOf(op) {
  if (["add", "sub", "mul", "div", "neg"].includes(op)) return "arith";
  if (["exp", "log", "ln", "pow", "recip"].includes(op)) return "exp";
  if (op === "sqrt") return "sqrt";
  if (["sin", "cos", "tan"].includes(op)) return "trig";
  if (op === "abs") return "piece";
  return "arith";
}

// ── Parser (mirrors live-optimizer.jsx) ──────────────────────────────────────
function tokenize(src) {
  const out = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let end = i;
      while (end < n && /[0-9.]/.test(src[end])) end++;
      if (end < n && (src[end] === "e" || src[end] === "E")) {
        end++;
        if (end < n && (src[end] === "+" || src[end] === "-")) end++;
        while (end < n && /[0-9]/.test(src[end])) end++;
      }
      out.push({ type: "num", value: parseFloat(src.slice(i, end)) });
      i = end; continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < n && /[a-zA-Z0-9_]/.test(src[j])) j++;
      out.push({ type: "id", value: src.slice(i, j) });
      i = j; continue;
    }
    if (c === "*" && src[i + 1] === "*") { out.push({ type: "op", value: "**" }); i += 2; continue; }
    if ("+-*/()^".includes(c)) { out.push({ type: "op", value: c }); i++; continue; }
    if (c === ",") { out.push({ type: "op", value: "," }); i++; continue; }
    i++;
  }
  return out;
}
function parse(src) {
  const toks = tokenize(src);
  let p = 0;
  function parsePrimary() {
    const t = toks[p];
    if (!t) throw new Error("unexpected end");
    if (t.type === "num") { p++; return { kind: "num", value: t.value }; }
    if (t.type === "id") {
      p++;
      if (toks[p] && toks[p].value === "(") {
        p++;
        const args = [];
        if (toks[p] && toks[p].value !== ")") {
          args.push(parseExpr());
          while (toks[p] && toks[p].value === ",") { p++; args.push(parseExpr()); }
        }
        if (!toks[p] || toks[p].value !== ")") throw new Error("expected )");
        p++;
        return { kind: "call", name: t.value, args };
      }
      return { kind: "var", name: t.value };
    }
    if (t.value === "(") {
      p++;
      const e = parseExpr();
      if (!toks[p] || toks[p].value !== ")") throw new Error("expected )");
      p++;
      return e;
    }
    if (t.value === "-") { p++; return { kind: "unary", op: "neg", arg: parseUnary() }; }
    if (t.value === "+") { p++; return parseUnary(); }
    throw new Error("unexpected token " + JSON.stringify(t));
  }
  function parseUnary() { return parsePrimary(); }
  function parsePow() {
    let left = parseUnary();
    while (toks[p] && (toks[p].value === "**" || toks[p].value === "^")) {
      p++;
      const right = parseUnary();
      left = { kind: "bin", op: "pow", left, right };
    }
    return left;
  }
  function parseMul() {
    let left = parsePow();
    while (toks[p] && (toks[p].value === "*" || toks[p].value === "/")) {
      const op = toks[p].value === "*" ? "mul" : "div"; p++;
      const right = parsePow();
      left = { kind: "bin", op, left, right };
    }
    return left;
  }
  function parseAdd() {
    let left = parseMul();
    while (toks[p] && (toks[p].value === "+" || toks[p].value === "-")) {
      const op = toks[p].value === "+" ? "add" : "sub"; p++;
      const right = parseMul();
      left = { kind: "bin", op, left, right };
    }
    return left;
  }
  function parseExpr() { return parseAdd(); }
  const res = parseExpr();
  if (p !== toks.length) throw new Error("trailing tokens");
  return res;
}

// ── Normalise AST into a uniform node shape with children[] and a label ──────
let _nextId = 0;
function normalize(ast) {
  _nextId = 0;
  function walk(n) {
    const id = `n${_nextId++}`;
    if (n.kind === "num") {
      return { id, type: "num", label: String(n.value), value: n.value, children: [] };
    }
    if (n.kind === "var") {
      return { id, type: "var", label: n.name, name: n.name, children: [] };
    }
    if (n.kind === "unary") {
      return { id, type: "op", op: n.op, label: n.op, children: [walk(n.arg)] };
    }
    if (n.kind === "bin") {
      return { id, type: "op", op: n.op, label: n.op, children: [walk(n.left), walk(n.right)] };
    }
    if (n.kind === "call") {
      const fn = n.name.toLowerCase();
      const canon = { exp: "exp", ln: "ln", log: "log", sqrt: "sqrt",
                      sin: "sin", cos: "cos", tan: "tan", abs: "abs" }[fn] || fn;
      return { id, type: "op", op: canon, label: canon, children: n.args.map(walk) };
    }
    return { id, type: "num", label: "?", value: 0, children: [] };
  }
  return walk(ast);
}

// ── Layout: bottom-up, leaf width 110, leaf spacing 16 ──────────────────────
const LEAF_W = 110;
const LEAF_GAP = 16;
const ROW_H = 108;
const NODE_W = 96;
const NODE_H = 56;
const PAD_X = 40;
const PAD_Y = 50;

function layout(node, depth, cursor) {
  // cursor.x is current left edge in pixels at leaf level
  if (node.children.length === 0) {
    const x = cursor.x + LEAF_W / 2;
    cursor.x += LEAF_W + LEAF_GAP;
    return { ...node, depth, x, y: depth * ROW_H, subtreeLeft: x, subtreeRight: x };
  }
  const positioned = node.children.map((c) => layout(c, depth + 1, cursor));
  const leftmost = positioned[0].x;
  const rightmost = positioned[positioned.length - 1].x;
  const x = (leftmost + rightmost) / 2;
  return {
    ...node,
    children: positioned,
    depth,
    x,
    y: depth * ROW_H,
    subtreeLeft: Math.min(leftmost, ...positioned.map((c) => c.subtreeLeft)),
    subtreeRight: Math.max(rightmost, ...positioned.map((c) => c.subtreeRight)),
  };
}

// Collect {id, maxDepth} so we can flip y → root-at-top.
function collect(node, flat) {
  flat.push(node);
  for (const c of node.children) collect(c, flat);
  return flat;
}

// ── Evaluator: walk tree with variable bindings, store value per id ──────────
function evalTree(node, env) {
  const vals = {};
  function go(n) {
    let v;
    if (n.type === "num") v = n.value;
    else if (n.type === "var") v = env[n.name] ?? 0;
    else {
      const args = n.children.map(go);
      switch (n.op) {
        case "add":   v = args[0] + args[1]; break;
        case "sub":   v = args[0] - args[1]; break;
        case "mul":   v = args[0] * args[1]; break;
        case "div":   v = args[1] === 0 ? NaN : args[0] / args[1]; break;
        case "pow":   v = Math.pow(args[0], args[1]); break;
        case "neg":   v = -args[0]; break;
        case "abs":   v = Math.abs(args[0]); break;
        case "exp":   v = Math.exp(args[0]); break;
        case "log":   v = Math.log(args[0]); break;
        case "ln":    v = Math.log(args[0]); break;
        case "sqrt":  v = Math.sqrt(args[0]); break;
        case "recip": v = 1 / args[0]; break;
        case "sin":   v = Math.sin(args[0]); break;
        case "cos":   v = Math.cos(args[0]); break;
        case "tan":   v = Math.tan(args[0]); break;
        default:      v = NaN;
      }
    }
    vals[n.id] = v;
    return v;
  }
  go(node);
  return vals;
}

// Pretty-format a number for node tooltips.
function fmt(v) {
  if (!isFinite(v)) return String(v);
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 10000 || a < 0.001) return v.toExponential(3);
  return Number(v.toPrecision(5)).toString();
}

// ── Stats ────────────────────────────────────────────────────────────────────
function stats(root) {
  let opCount = 0;
  let leafCount = 0;
  let sb = 0, naive = 0;
  const byOp = {};
  function go(n) {
    if (n.type === "op") {
      opCount++;
      sb += SB[n.op] ?? 2;
      naive += NV[n.op] ?? 2;
      byOp[n.op] = (byOp[n.op] || 0) + 1;
    } else {
      leafCount++;
    }
    for (const c of n.children) go(c);
  }
  go(root);
  const savings = naive > 0 ? Math.round((1 - sb / naive) * 10000) / 100 : 0;
  return { opCount, leafCount, sb, naive, savings, byOp };
}

const EXAMPLES = [
  "exp(x) * y + log(z)",
  "1 / (1 + exp(-x))",
  "x * exp(-x**2)",
  "sqrt(x**2 + y**2)",
  "x**2 + 2*x + 1",
  "-x * log(x)",
  "log(1 + exp(x))",
  "(exp(x) - exp(-x)) / 2",
];

export default function TreeViewer() {
  const [expr, setExpr] = useState("exp(x) * y + log(z)");
  const [xSample, setXSample] = useState(2.0);
  const [error, setError] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const wrapRef = useRef(null);

  const laidOut = useMemo(() => {
    try {
      const ast = parse(expr.trim() || "x");
      const norm = normalize(ast);
      const cursor = { x: 0 };
      const root = layout(norm, 0, cursor);
      setError(null);
      return { root, width: cursor.x };
    } catch (e) {
      setError(e.message || String(e));
      return null;
    }
  }, [expr]);

  const flat = useMemo(() => laidOut ? collect(laidOut.root, []) : [], [laidOut]);

  // Build variable env: x takes xSample, other free vars default to xSample too.
  const env = useMemo(() => {
    const e = {};
    for (const n of flat) if (n.type === "var") e[n.name] = xSample;
    return e;
  }, [flat, xSample]);

  const values = useMemo(() => laidOut ? evalTree(laidOut.root, env) : {}, [laidOut, env]);
  const st = useMemo(() => laidOut ? stats(laidOut.root) : null, [laidOut]);

  // SVG dimensions: rows (max depth + 1) × ROW_H, y flipped so root is at top.
  const maxDepth = useMemo(() => flat.reduce((m, n) => Math.max(m, n.depth), 0), [flat]);
  const svgW = laidOut ? Math.max(520, laidOut.width + PAD_X * 2) : 520;
  const svgH = (maxDepth + 1) * ROW_H + PAD_Y * 2;

  // y at render time: root at top. A node at depth d should sit at y = (maxDepth - d)*ROW_H.
  const yOf = (n) => PAD_Y + (maxDepth - n.depth) * ROW_H;
  const xOf = (n) => PAD_X + n.x;

  const hovered = hoverId ? flat.find((n) => n.id === hoverId) : null;

  return (
    <div style={S.root}>
      <header style={S.header}>
        <span style={S.brand}>monogate</span>
        <span style={S.subBrand}>lab · tree viewer</span>
        <span style={S.formula}>SuperBEST circuit diagram for any expression</span>
      </header>

      <h1 style={S.h1}>Type any equation. See its SuperBEST circuit.</h1>
      <p style={S.intro}>
        The expression parses into a SuperBEST tree: each internal node is an
        F16 operator, each leaf is a variable or constant. Colour = operator
        family. Hover any node to see its intermediate value at the sample
        input below. Wires flow bottom-up: leaves at the bottom, root (final
        output) at the top.
      </p>

      <div style={S.controls}>
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          spellCheck={false}
          style={S.exprInput}
        />
        <label style={S.sampleLabel}>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>x =</span>
          <input
            type="number"
            step="0.1"
            value={xSample}
            onChange={(e) => setXSample(parseFloat(e.target.value) || 0)}
            style={S.sampleInput}
          />
        </label>
      </div>

      <div style={S.exampleRow}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => setExpr(ex)}
            style={S.exBtn}
          >{ex}</button>
        ))}
      </div>

      {error && (
        <div style={S.err}>parse error: {error}</div>
      )}

      {st && (
        <div style={S.statRow}>
          <Stat label="nodes" value={`${st.opCount + st.leafCount}`} sub={`${st.opCount} ops · ${st.leafCount} leaves`} color="#e8e8f0" />
          <Stat label="SuperBEST" value={`${st.sb}n`} sub="v5.2 positive domain" color="#e8a020" />
          <Stat label="naïve" value={`${st.naive}n`} sub="pre-optimisation" color="#94a3b8" />
          <Stat label="savings" value={`${st.savings}%`} sub={`${st.naive - st.sb}n saved`} color={st.savings > 0 ? "#5ec47a" : "#94a3b8"} />
        </div>
      )}

      <div ref={wrapRef} style={S.canvasWrap}>
        {laidOut && (
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ display: "block", background: "rgba(255,255,255,0.015)",
              borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}
            onMouseLeave={() => setHoverId(null)}
          >
            {/* Wires: from each parent bottom to each child top. Render before nodes. */}
            {flat.flatMap((n) =>
              n.children.map((c) => {
                const x1 = xOf(n), y1 = yOf(n) + NODE_H / 2;
                const x2 = xOf(c), y2 = yOf(c) - NODE_H / 2;
                const midY = (y1 + y2) / 2;
                const isHot = hoverId === n.id || hoverId === c.id;
                return (
                  <path
                    key={`${n.id}->${c.id}`}
                    d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                    stroke={isHot ? "#e8a020" : "rgba(255,255,255,0.18)"}
                    strokeWidth={isHot ? 2 : 1.2}
                    fill="none"
                  />
                );
              })
            )}

            {/* Nodes */}
            {flat.map((n) => {
              const cat = n.type === "var" ? "var" : n.type === "num" ? "num" : catOf(n.op);
              const color = CAT[cat].color;
              const x = xOf(n), y = yOf(n);
              const isHot = hoverId === n.id;
              const cost = n.type === "op" ? (SB[n.op] ?? 2) : 0;
              return (
                <g
                  key={n.id}
                  transform={`translate(${x - NODE_W / 2}, ${y - NODE_H / 2})`}
                  onMouseEnter={() => setHoverId(n.id)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    width={NODE_W} height={NODE_H} rx={7} ry={7}
                    fill={isHot ? `${color}26` : "rgba(8,8,14,0.85)"}
                    stroke={isHot ? color : `${color}88`}
                    strokeWidth={isHot ? 2 : 1}
                  />
                  {/* category strip on top */}
                  <rect width={NODE_W} height={4} rx={7} ry={7} fill={color} opacity={0.9} />
                  <text
                    x={NODE_W / 2} y={NODE_H / 2 - 2}
                    textAnchor="middle" fontSize={14} fontWeight={600}
                    fill="#e8e8f0" fontFamily={FONT}
                  >
                    {n.label.length > 11 ? n.label.slice(0, 10) + "…" : n.label}
                  </text>
                  <text
                    x={NODE_W / 2} y={NODE_H / 2 + 14}
                    textAnchor="middle" fontSize={10}
                    fill={color} fontFamily={FONT}
                  >
                    {n.type === "op" ? `${cost}n · ${fmt(values[n.id])}` : fmt(values[n.id])}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {hovered && (
        <div style={S.detail}>
          <div style={{ display: "flex", gap: 14, alignItems: "baseline", flexWrap: "wrap" }}>
            <span style={{
              fontSize: 14, fontWeight: 700,
              color: hovered.type === "var" ? CAT.var.color
                   : hovered.type === "num" ? CAT.num.color
                   : CAT[catOf(hovered.op)].color,
            }}>
              {hovered.label}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {hovered.type === "var" ? "free variable"
                : hovered.type === "num" ? "constant"
                : `${CAT[catOf(hovered.op)].label} · ${SB[hovered.op] ?? 2}n SB · ${NV[hovered.op] ?? 2}n naïve`}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              depth {hovered.depth} · inputs: {hovered.children.length}
            </span>
          </div>
          <div style={{ marginTop: 10, fontSize: 22, fontWeight: 600, color: "#e8e8f0" }}>
            = {fmt(values[hovered.id])}
          </div>
          {hovered.children.length > 0 && (
            <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: FONT }}>
              {hovered.op}({hovered.children.map((c) => fmt(values[c.id])).join(", ")})
            </div>
          )}
        </div>
      )}

      <Legend />

      <div style={S.help}>
        Parser is the same ~200-line recursive descent as the live
        optimiser — supports <code>+ − * /</code>, <code>**</code> /
        <code>^</code>, parentheses, and the standard unary functions
        <code> exp, ln, log, sqrt, sin, cos, tan, abs</code>. Costs are
        the v5.2 positive-domain table (mul = 2n placeholder, exp = 1n,
        sqrt = 1n via EPL(0.5, x), etc.). Each variable binds to the
        sample input <code>x</code> above; numeric results are
        informational and may overflow or produce <code>NaN</code> for
        extreme inputs.
      </div>
    </div>
  );
}

function Stat({ label, value, sub, color }) {
  return (
    <div style={S.stat}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(255,255,255,0.4)" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1.1, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{sub}</div>
    </div>
  );
}

function Legend() {
  const entries = [
    ["arith", "add / sub / mul / div / neg"],
    ["exp",   "exp / log / ln / pow / recip"],
    ["sqrt",  "sqrt (EPL)"],
    ["trig",  "sin / cos / tan"],
    ["piece", "abs (piecewise)"],
    ["var",   "free variable"],
    ["num",   "numeric constant"],
  ];
  return (
    <div style={S.legend}>
      {entries.map(([key, desc]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-block", width: 12, height: 12, borderRadius: 3,
            background: CAT[key].color,
          }} />
          <span style={{ color: "rgba(255,255,255,0.7)" }}>{desc}</span>
        </div>
      ))}
    </div>
  );
}

const FONT = "'IBM Plex Mono', 'SF Mono', 'Fira Code', monospace";
const S = {
  root: {
    background: "#07080f", color: "#e8e8f0", fontFamily: FONT,
    minHeight: "100vh", padding: "24px 28px 80px",
  },
  header: {
    display: "flex", gap: 16, alignItems: "baseline", flexWrap: "wrap",
    marginBottom: 16, paddingBottom: 10,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  brand: {
    fontSize: 13, fontWeight: 600, letterSpacing: "0.15em",
    textTransform: "uppercase", color: "#e8a020",
  },
  subBrand: { fontSize: 13, color: "rgba(255,255,255,0.35)" },
  formula: { fontSize: 11, color: "rgba(255,255,255,0.45)", marginLeft: "auto" },

  h1: {
    fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px",
    margin: "6px 0 8px", color: "#f1f5f9",
  },
  intro: {
    maxWidth: 760, fontSize: 13, lineHeight: 1.7,
    color: "rgba(226,232,240,0.6)", margin: "0 0 22px",
    fontFamily: "system-ui, sans-serif",
  },

  controls: {
    display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
    marginBottom: 10,
  },
  exprInput: {
    flex: "1 1 320px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#e8e8f0",
    fontFamily: FONT, fontSize: 14,
    outline: "none",
  },
  sampleLabel: {
    display: "flex", gap: 8, alignItems: "center", fontSize: 12,
    padding: "8px 12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
  },
  sampleInput: {
    width: 72, background: "transparent",
    border: "none", color: "#e8a020", fontFamily: FONT, fontSize: 14,
    outline: "none", textAlign: "right",
  },

  exampleRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 },
  exBtn: {
    background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
    color: "#cbd5e1", borderRadius: 6, padding: "5px 10px",
    fontFamily: FONT, fontSize: 11, cursor: "pointer",
  },

  err: {
    padding: 12, marginBottom: 12,
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 8, fontSize: 12,
  },

  statRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 10, marginBottom: 14,
  },
  stat: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 6, padding: "12px 14px",
  },

  canvasWrap: {
    overflow: "auto", marginBottom: 14,
    borderRadius: 8, maxWidth: "100%",
  },

  detail: {
    background: "rgba(232,160,32,0.05)",
    border: "1px solid rgba(232,160,32,0.25)",
    borderRadius: 6, padding: "12px 16px", marginBottom: 16,
  },

  legend: {
    display: "flex", gap: 16, flexWrap: "wrap",
    fontSize: 11, padding: "10px 14px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 6, marginBottom: 14,
  },

  help: {
    maxWidth: 820, lineHeight: 1.7, fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "system-ui, sans-serif",
  },
};
