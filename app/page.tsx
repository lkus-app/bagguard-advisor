"use client";

import { useMemo, useState } from "react";

type Rec = "Avg Down" | "Avg Up" | "Take Profit" | "Cut Loss" | "Hold";
type Token = {
  symbol: string; name: string; chain: string; price: number;
  change24h: number; change7d: number; valueUsd: number; amount: number;
  volume24h: number; volumeTrend: "up" | "down" | "flat";
  holderChange7d: number; holderChange30d: number;
  top10: number; top50: number; socialVolume: number; sentiment: number;
};

const MOCK: Token[] = [
  { symbol: "BONK", name: "Bonk", chain: "solana", price: 0.0000214, change24h: -6.2, change7d: -14.5, valueUsd: 842.5, amount: 39369158, volume24h: 48e6, volumeTrend: "up", holderChange7d: 8.4, holderChange30d: 22.1, top10: 18, top50: 41, socialVolume: 92000, sentiment: 0.42 },
  { symbol: "WIF", name: "dogwifhat", chain: "solana", price: 1.84, change24h: 12.4, change7d: 28.1, valueUsd: 552, amount: 300, volume24h: 120e6, volumeTrend: "up", holderChange7d: 3.1, holderChange30d: 9.4, top10: 24, top50: 48, socialVolume: 180000, sentiment: 0.71 },
  { symbol: "JUP", name: "Jupiter", chain: "solana", price: 0.92, change24h: 2.1, change7d: 5.6, valueUsd: 460, amount: 500, volume24h: 65e6, volumeTrend: "flat", holderChange7d: 1.8, holderChange30d: 6.2, top10: 22, top50: 45, socialVolume: 54000, sentiment: 0.35 },
  { symbol: "PEPE", name: "Pepe", chain: "ethereum", price: 0.0000098, change24h: 18.7, change7d: 42.3, valueUsd: 392, amount: 4e7, volume24h: 210e6, volumeTrend: "up", holderChange7d: -2.4, holderChange30d: -5.1, top10: 38, top50: 62, socialVolume: 410000, sentiment: 0.88 },
  { symbol: "CAKE", name: "PancakeSwap", chain: "bnb", price: 2.14, change24h: -4.1, change7d: -9.2, valueUsd: 321, amount: 150, volume24h: 22e6, volumeTrend: "down", holderChange7d: -1.2, holderChange30d: 0.8, top10: 28, top50: 52, socialVolume: 18000, sentiment: 0.05 },
  { symbol: "RAY", name: "Raydium", chain: "solana", price: 3.62, change24h: -11.3, change7d: -22, valueUsd: 289.6, amount: 80, volume24h: 31e6, volumeTrend: "down", holderChange7d: -4.8, holderChange30d: -12.4, top10: 44, top50: 71, socialVolume: 12000, sentiment: -0.25 },
  { symbol: "PYTH", name: "Pyth Network", chain: "solana", price: 0.38, change24h: 1.2, change7d: -3.4, valueUsd: 228, amount: 600, volume24h: 28e6, volumeTrend: "flat", holderChange7d: 2.6, holderChange30d: 11, top10: 20, top50: 43, socialVolume: 26000, sentiment: 0.22 },
];

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function analyze(t: Token) {
  const volume = clamp(Math.min(100, (Math.log10(Math.max(t.volume24h, 1)) / 7) * 100) + (t.volumeTrend === "up" ? 15 : t.volumeTrend === "down" ? -10 : 0));
  const holders = clamp(50 + clamp(50 + t.holderChange7d * 2, -50, 100) * 0.4 + clamp(t.holderChange30d, -30, 50) * 0.3);
  const concentration = clamp(100 - Math.max(0, (t.top10 - 15) * 1.5) - Math.max(0, (t.top50 - 40) * 0.5));
  const hype = clamp(Math.min(60, (Math.log10(Math.max(t.socialVolume, 1)) / 5) * 60) + t.sentiment * 40 + 20);
  const total = Math.round(volume * 0.25 + holders * 0.3 + concentration * 0.25 + hype * 0.2);
  const down = t.change24h < -3 || t.change7d < -8;
  const up = t.change24h > 5 || t.change7d > 12;
  const sharp = t.change24h > 15 || t.change7d > 30;
  let rec: Rec = "Hold";
  let reason = "Metrics balanced. No strong signal.";
  if (total >= 70 && down) { rec = "Avg Down"; reason = "Strong fundamentals + weak price — good avg down."; }
  else if (total >= 70 && up) { rec = "Avg Up"; reason = "High conviction + rising price — avg up ok."; }
  else if (total <= 35 && (sharp || hype >= 85)) { rec = "Take Profit"; reason = "Weak metrics + hype spike — take profit."; }
  else if (total <= 40 && down && concentration <= 35) { rec = "Cut Loss"; reason = "Poor score + dump risk — cut loss."; }
  else if (total >= 60) reason = "Solid metrics. Keep monitoring.";
  else if (total <= 45) reason = "Below average. Avoid adding size.";
  return {
    ...t,
    scores: {
      volume: Math.round(volume),
      holders: Math.round(holders),
      concentration: Math.round(concentration),
      hype: Math.round(hype),
      total,
    },
    rec,
    reason,
  };
}

const usd = (n: number) =>
  n < 0.01
    ? `$${n.toFixed(8)}`
    : n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
const recCls = (r: Rec) =>
  r === "Avg Down" ? "b-down" : r === "Avg Up" ? "b-up" : r === "Take Profit" ? "b-tp" : r === "Cut Loss" ? "b-cut" : "b-hold";
const tier = (s: number) => (s >= 70 ? "hi" : s >= 45 ? "md" : "lo");

const FILTERS: Array<Rec | "All"> = ["All", "Avg Down", "Avg Up", "Take Profit", "Cut Loss", "Hold"];

export default function HomePage() {
  const [demo, setDemo] = useState(false);
  const [filter, setFilter] = useState<Rec | "All">("All");
  const tokens = useMemo(() => MOCK.map(analyze), []);
  const filtered = useMemo(() => {
    const list = filter === "All" ? tokens : tokens.filter((t) => t.rec === filter);
    return [...list].sort((a, b) => b.valueUsd - a.valueUsd);
  }, [tokens, filter]);
  const totalValue = tokens.reduce((s, t) => s + t.valueUsd, 0);
  const avgScore = Math.round(tokens.reduce((s, t) => s + t.scores.total, 0) / tokens.length);

  if (!demo) {
    return (
      <>
        <header className="nav">
          <div className="wrap nav-in">
            <div className="brand"><div className="brand-icon">🛡️</div>BagGuard Advisor</div>
            <button className="btn btn-o" onClick={() => setDemo(true)}>Try Demo</button>
          </div>
        </header>
        <main className="wrap">
          <section className="hero">
            <div className="pill"><span className="dot" />Demo · Embedded mock data · Vercel-ready</div>
            <h1>Know when to <span className="g">Avg Down</span><span className="m">,</span> <span className="r">Cut Loss</span><span className="m">,</span> or <span className="a">Take Profit</span></h1>
            <p>Volume, holder growth, concentration & hype → one clear position signal.</p>
            <div className="actions">
              <button className="btn btn-p" onClick={() => setDemo(true)}>🧪 Open Demo Portfolio</button>
            </div>
          </section>
          <p className="muted" style={{ textAlign: "center" }}>Volume 25% · Holder Growth 30% · Distribution 25% · Hype 20%</p>
          <div className="grid">
            {[
              ["📊", "Volume", "24h volume + trend"],
              ["👥", "Holders", "7d & 30d growth"],
              ["🛡️", "Distribution", "Top 10 / Top 50 risk"],
              ["⚡", "Hype", "Social + sentiment"],
            ].map(([i, t, d]) => (
              <div key={t} className="card"><div className="logo">{i}</div><h3>{t}</h3><p className="muted">{d}</p></div>
            ))}
          </div>
        </main>
        <footer className="foot">BagGuard Advisor · Embedded Demo · Not financial advice · DYOR</footer>
      </>
    );
  }

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <div className="brand">
            <div className="brand-icon">🛡️</div>BagGuard Advisor
            <span className="badge b-demo">DEMO</span>
          </div>
          <button className="btn btn-o" onClick={() => setDemo(false)}>← Landing</button>
        </div>
      </header>
      <main className="wrap">
        <div className="toolbar">
          <div>
            <h1 style={{ fontSize: "1.2rem" }}>Demo Portfolio</h1>
            <p className="muted">Mock data · client-side scoring</p>
          </div>
          <button className="btn btn-o" style={{ padding: ".4rem .8rem", fontSize: ".8rem" }} onClick={() => setFilter("All")}>Reset</button>
        </div>
        <div className="summary">
          <div className="card"><span className="muted">Total</span><strong>{usd(totalValue)}</strong></div>
          <div className="card"><span className="muted">Tokens</span><strong>{tokens.length}</strong></div>
          <div className="card"><span className="muted">Avg score</span><strong className={`score ${tier(avgScore)}`}>{avgScore}</strong></div>
          <div className="card"><span className="muted">Actions</span><strong>{tokens.filter((t) => t.rec !== "Hold").length}</strong></div>
        </div>
        <div className="chips">
          {FILTERS.map((f) => (
            <button key={f} className={`chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="tokens">
          {filtered.map((t) => (
            <article key={t.symbol} className="card">
              <div className="row">
                <div className="row">
                  <div className="logo">{t.symbol.slice(0, 2)}</div>
                  <div>
                    <h3>{t.symbol}</h3>
                    <span className="muted">{t.name} · {t.chain}</span>
                  </div>
                </div>
                <span className={`badge ${recCls(t.rec)}`}>{t.rec}</span>
              </div>
              <div className="row" style={{ margin: ".7rem 0" }}>
                <div>
                  <div className="price">{usd(t.price)}</div>
                  <div className={t.change24h >= 0 ? "up" : "down"}>{pct(t.change24h)} 24h</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="price">{usd(t.valueUsd)}</div>
                  <div className="muted" style={{ fontSize: ".75rem" }}>{t.amount.toLocaleString()} held</div>
                </div>
              </div>
              <div className="metrics">
                {([["Volume", t.scores.volume], ["Holders", t.scores.holders], ["Distribution", t.scores.concentration], ["Hype", t.scores.hype]] as const).map(([label, val]) => (
                  <div key={label} className="metric">
                    <label>{label} · {val}</label>
                    <div className={`bar ${tier(val)}`}><i style={{ width: `${val}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="score-row">
                <span className="muted" style={{ fontSize: ".75rem" }}>Total score</span>
                <span className={`score ${tier(t.scores.total)}`}>{t.scores.total}</span>
              </div>
              <p className="reason">{t.reason}</p>
            </article>
          ))}
        </div>
      </main>
      <footer className="foot">BagGuard Advisor · Embedded Demo · Not financial advice · DYOR</footer>
    </>
  );
}
