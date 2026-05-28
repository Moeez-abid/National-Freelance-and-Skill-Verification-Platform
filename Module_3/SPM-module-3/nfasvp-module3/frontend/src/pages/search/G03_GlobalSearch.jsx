import { useState, useEffect } from "react";
import { C, Navbar, StickyNote, Btn } from "../gigs/shared";
import { searchApi } from "../../services/api";

// ─── SEARCH RESULT CARD ─────────────────────────────────────────────────────
function SearchResultCard({ item, onNavigate }) {
  const isGig = !!item.pricing_tiers;
  return (
    <div
      onClick={() => onNavigate(isGig ? "detail" : "jobdetail", { id: item.id })}
      style={{
        background: C.white, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: 16, display: "flex", gap: 16, cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ width: 50, height: 50, background: isGig ? "#E0F2FE" : "#FEF3C7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
        {isGig ? "💼" : "🛠️"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{item.title}</h3>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>{isGig ? "GIG" : "JOB"}</span>
        </div>
        <p style={{ margin: "0 0 8px", fontSize: 13, color: C.textSecondary, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.description}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.black }}>
            PKR {isGig ? (item.pricing_tiers?.[0]?.price || 'N/A') : (item.budget_min + " - " + item.budget_max)}
          </span>
          <span style={{ fontSize: 12, color: C.textMuted }}>{isGig ? "Freelancer Service" : "Client Request"}</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// G03_GlobalSearch (Screen 18)
// ══════════════════════════════════════════════════════════════════════════════
export default function GlobalSearch({ onNavigate, params, role }) {
  const [query, setQuery] = useState(params?.q || "");
  const [results, setResults] = useState({ gigs: { data: [] }, jobs: { data: [] } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query || query.trim().length < 2) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await searchApi.global(query);
      if (res.success) {
        setResults(res.data);
      } else {
        setError("Failed to fetch results.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.q) {
      setQuery(params.q);
    }
  }, [params?.q]);

  // Optional: Auto-search as user types (debounced would be better, but let's keep it simple for now)
  // Or just rely on the Search button and Enter key.

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: C.bgPage }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Navbar onNavigate={onNavigate} role={role} />

      <main style={{ flex: 1, overflowY: "auto", padding: "40px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* Header & Input */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: C.black, letterSpacing: "-1px" }}>Global Marketplace Search</h1>
            <form onSubmit={handleSearch} style={{ width: "100%", maxWidth: 660, display: "flex", gap: 12 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search across all gigs, jobs, and services..."
                  style={{ width: "100%", padding: "14px 20px 14px 48px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 16, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", outline: "none" }}
                />
                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 20, opacity: 0.5 }}>🔍</span>
              </div>
              <Btn type="submit" style={{ padding: "0 28px", borderRadius: 10 }}>Search</Btn>
            </form>
          </div>

          {/* Results */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: C.textMuted }}>Searching the marketplace...</div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: 60, color: "red" }}>{error}</div>
            ) : (!results.gigs?.data?.length && !results.jobs?.data?.length) ? (
              <div style={{ textAlign: "center", padding: 80, color: C.textMuted, background: "#fff", border: `1px dashed ${C.border}`, borderRadius: 12 }}>
                {query ? "No matches found. Try different keywords." : "Enter a search term above to begin exploring the marketplace."}
              </div>
            ) : (
              <>
                {results.gigs?.data?.length > 0 && (
                  <section>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.textPrimary, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>💼</span> Matched Gigs ({results.gigs.total})
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      {results.gigs.data.map(g => <SearchResultCard key={g.id} item={g} onNavigate={onNavigate} />)}
                    </div>
                  </section>
                )}
                <div style={{ height: 1, background: C.border, opacity: 0.5, margin: "10px 0" }} />
                {results.jobs?.data?.length > 0 && (
                  <section>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.textPrimary, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>🛠️</span> Matched Jobs ({results.jobs.total})
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      {results.jobs.data.map(j => <SearchResultCard key={j.id} item={j} onNavigate={onNavigate} />)}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <StickyNote text="🔗 Search API → Hits the unified /search endpoint. Connects to SearchFilterService backend." />
          </div>

        </div>
      </main>
    </div>
  );
}
