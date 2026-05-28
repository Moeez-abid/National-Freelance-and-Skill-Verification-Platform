import { useState } from "react";
import { C, Navbar, StickyNote, Btn } from "./shared";
import { useCreateGig } from "../../hooks/useGigs";
import { useCategories } from "../../hooks/useCategories";

// ══════════════════════════════════════════════════════════════════════════════
// G03_CreateGig
// ══════════════════════════════════════════════════════════════════════════════
export default function CreateGig({ onNavigate, role }) {
  const { createGig, loading, error } = useCreateGig();
  const { categories, loading: loadingCats } = useCategories();
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    required_skills: "",
    pricing: [
      { tier: "basic",    price: "", delivery_days: "", desc: "" },
      { tier: "standard", price: "", delivery_days: "", desc: "" },
      { tier: "premium",  price: "", delivery_days: "", desc: "" },
    ]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!form.title || !form.description) {
      alert("Please fill in basic gig info.");
      return;
    }

    const payload = {
      ...form,
      required_skills: form.required_skills.split(",").map(s => s.trim()).filter(Boolean),
      pricing_tiers: form.pricing.map(p => ({
        ...p,
        price: parseInt(p.price) || 0,
        delivery_days: parseInt(p.delivery_days) || 1
      }))
    };

    const success = await createGig({ ...payload, status: "live" });
    if (success) {
      alert("Gig created successfully!");
      onNavigate("mygigs");
    }
  };

  const updatePricing = (index, field, value) => {
    const newPricing = [...form.pricing];
    newPricing[index][field] = value;
    setForm({ ...form, pricing: newPricing });
  };

  const inputStyle = {
    width: "100%", padding: "12px", border: `1px solid ${C.border}`, borderRadius: 6,
    fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box"
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 700, color: C.textSecondary, marginBottom: 6, display: "block"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: C.bgPage }}>
      <Navbar onNavigate={onNavigate} role={role} />

      <main style={{ flex: 1, padding: "40px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          
          <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, color: C.black }}>Create a New Gig</h1>
          <p style={{ margin: "0 0 32px", color: C.textSecondary }}>Set up your service and start receiving orders from clients.</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Basic Info */}
            <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>1. Basic Information</h3>
              
              <div>
                <label style={labelStyle}>GIG TITLE</label>
                <input 
                  placeholder="e.g. I will design a professional React website for your business"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>CATEGORY</label>
                  <select 
                    value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">{loadingCats ? "Loading..." : "Select Category"}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>SKILLS (COMMA SEPARATED)</label>
                  <input 
                    placeholder="React, Figma, Tailwind..."
                    value={form.required_skills}
                    onChange={e => setForm({ ...form, required_skills: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>DESCRIPTION</label>
                <textarea 
                  rows={5}
                  placeholder="Describe what you offer in detail..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
            </section>

            {/* Pricing Tiers */}
            <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>2. Pricing & Packages</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {form.pricing.map((tier, i) => (
                  <div key={tier.tier} style={{ background: "#F8FAFC", border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontWeight: 800, color: C.black, fontSize: 14, textAlign: "center", textTransform: "capitalize" }}>{tier.tier}</div>
                    
                    <div>
                      <label style={labelStyle}>PRICE (PKR)</label>
                      <input 
                        type="number"
                        value={tier.price}
                        onChange={e => updatePricing(i, "price", e.target.value)}
                        style={{ ...inputStyle, padding: "8px" }}
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>DELIVERY (DAYS)</label>
                      <input 
                        type="number"
                        value={tier.delivery_days}
                        onChange={e => updatePricing(i, "delivery_days", e.target.value)}
                        style={{ ...inputStyle, padding: "8px" }}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>DESCRIPTION</label>
                      <textarea 
                        rows={3}
                        value={tier.desc}
                        onChange={e => updatePricing(i, "desc", e.target.value)}
                        style={{ ...inputStyle, padding: "8px", fontSize: 12 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
              <Btn variant="outlined" onClick={() => onNavigate("mygigs")}>Cancel</Btn>
              <Btn type="submit" disabled={loading}>{loading ? "Creating..." : "Publish Gig"}</Btn>
            </div>

            {error && <div style={{ color: "red", fontSize: 14, textAlign: "right" }}>{error}</div>}
          </form>

          <div style={{ marginTop: 32 }}>
            <StickyNote text="🔗 Publish Gig → API call to gig service · Redirects to G03_MyGigs on success." />
          </div>
        </div>
      </main>
    </div>
  );
}
