import { useMemo, useState } from "react";
import { products, type Product } from "./data/products";
import './App.css';

type Query = {
  maxPrice?: number;
  minPrice?: number;
  minRating?: number;
  keywords: string[];
  priceIntent?: "high" | "low";
};

const STOPWORDS = new Set([
  "the","a","an","with","and","for","under","below","less","than","between",
  "over","above","at","least","most","good","great","high","reviews","review",
  "stars","star","me","show","find","in","on","of","to",
  "expensive","premium","highend","high-end","pricey","pricy","top-tier","toptier",
  "cheap","budget","affordable","inexpensive","low-cost","lowcost","low-end","lowend"
]);

const CATEGORY_HINTS = ["shoes","electronics","apparel","accessories","watches","bags"];

function parseQuery(q: string): Query {
  const s = q.trim();

  const between = /between\s*\$?(\d+(?:\.\d+)?)\s*(?:and|-|to)\s*\$?(\d+(?:\.\d+)?)/i.exec(s);
  const under   = /(under|below|less\s+than|cheaper\s+than)\s*\$?(\d+(?:\.\d+)?)/i.exec(s);
  const over    = /(over|above|more\s+than|at\s+least)\s*\$?(\d+(?:\.\d+)?)/i.exec(s);

  const starsNum    = /(\d(?:\.\d)?)\s*stars?/i.exec(s);
  const impliesGood = /\b(good|great|high)\s+reviews?\b/i.test(s);
  const minRating   = starsNum ? Number(starsNum[1]) : impliesGood ? 4 : undefined;

  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  if (between) {
    const a = Number(between[1]);
    const b = Number(between[2]);
    minPrice = Math.min(a, b);
    maxPrice = Math.max(a, b);
  } else if (under) {
    maxPrice = Number(under[2]);
  } else if (over) {
    minPrice = Number(over[2]);
  }

  const wantsHigh = /\b(expensive|premium|high[-\s]?end|pricey|pricy|top[-\s]?tier)\b/i.test(s);
  const wantsLow  = /\b(cheap|budget|affordable|inexpensive|low[-\s]?cost|low[-\s]?end)\b/i.test(s);
  const priceIntent = wantsHigh ? "high" : wantsLow ? "low" : undefined;

  const keywords = s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map(w => w.replace(/-/g, ""))
    .filter(w => w && !STOPWORDS.has(w) && !/^\d+(\.\d+)?$/.test(w));

  return { maxPrice, minPrice, minRating, keywords, priceIntent };
}

function scoreProduct(p: Product, query: Query, nprice: number): number {
  let s = 0;
  const hay = (p.name + " " + p.description + " " + p.category).toLowerCase();

  query.keywords.forEach(k => { if (hay.includes(k)) s += 2.5; });

  const catLower = p.category.toLowerCase();
  if (CATEGORY_HINTS.some(h => query.keywords.includes(h) && h === catLower)) {
    s += 2.5;
  }

  if (query.maxPrice !== undefined && p.price <= query.maxPrice) s += 2;
  if (query.minPrice !== undefined && p.price >= query.minPrice) s += 1.5;
  if (query.minRating !== undefined && p.rating >= query.minRating) s += 2;

  if (query.priceIntent === "high") s += nprice * 3;
  if (query.priceIntent === "low")  s += (1 - nprice) * 3;

  s += p.rating * 0.2;
  s -= p.price * 0.01;

  return s;
}

function applyAIQuery(all: Product[], q: string): Product[] {
  if (!all.length) return all;
  const parsed = parseQuery(q);

  const prices = all.map(p => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = Math.max(1, max - min);

  const scored = all
    .map(p => {
      const nprice = (p.price - min) / span;
      const s = scoreProduct(p, parsed, nprice);
      return { p, s, nprice };
    })
    .filter(x => x.s > 0.5)
    .sort((a, b) => {
      if (b.s !== a.s) return b.s - a.s;
      if (parsed.priceIntent === "high" && b.nprice !== a.nprice) return b.nprice - a.nprice;
      if (parsed.priceIntent === "low"  && b.nprice !== a.nprice) return a.nprice - b.nprice;
      if (b.p.rating !== a.p.rating) return b.p.rating - a.p.rating;
      return a.p.price - b.p.price;
    })
    .map(x => x.p);

  return scored.length ? scored : all;
}

export default function App() {
  const [nlpQuery, setNlpQuery] = useState("");
  const [category, setCategory] = useState<"" | Product["category"]>("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minRating, setMinRating] = useState<number | "">("");

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, []);

  const baseFiltered = useMemo(() => {
    return products.filter(p => {
      if (category && p.category !== category) return false;
      if (maxPrice !== "" && p.price > maxPrice) return false;
      if (minRating !== "" && p.rating < minRating) return false;
      return true;
    });
  }, [category, maxPrice, minRating]);

  const finalList = useMemo(() => {
    if (nlpQuery.trim().length === 0) return baseFiltered;
    return applyAIQuery(baseFiltered, nlpQuery);
  }, [baseFiltered, nlpQuery]);

  return (
    <div className="container">
      <header className="header">
        <h1>E-Commerce Catalog</h1>
        <p className="subtitle">Basic catalog with natural-language search.</p>
      </header>

      <section className="controls">
        <input
          className="input"
          type="text"
          placeholder='Search'
          value={nlpQuery}
          onChange={(e) => setNlpQuery(e.target.value)}
        />

        <div className="filters">
          <label className="label">
            Category
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="">All</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="label">
            Max Price
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 100"
            />
          </label>

          <label className="label">
            Min Rating
            <input
              className="input"
              type="number"
              min={1}
              max={5}
              step="0.1"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 4"
            />
          </label>
        </div>

        {nlpQuery.trim() ? (
          <div className="ai-banner">AI search active for: “{nlpQuery}”</div>
        ) : null}
      </section>

      <main className="grid">
        {finalList.map(p => (
          <article key={p.id} className="card">
            <div className="card-head">
              <h3 className="card-title">{p.name}</h3>
              <div className="price">${p.price.toFixed(2)}</div>
            </div>
            <div className="meta">
              <span className="badge">{p.category}</span>
              <span className="rating" title={`${p.rating} / 5`}>
                {renderStars(p.rating)} <span className="rating-num">{p.rating.toFixed(1)}</span>
              </span>
            </div>
            <p className="desc">{p.description}</p>
          </article>
        ))}
        {finalList.length === 0 && (
          <p className="empty">No products match your filters.</p>
        )}
      </main>
    </div>
  );
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = "★★★★★".slice(0, full) + (half ? "½" : "");
  return <span>{stars}</span>;
}
