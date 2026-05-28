import { useState, useEffect } from "react";
import { C, Navbar, StickyNote, Btn } from "./shared";
import { useUpdateGig, useGig } from "../../hooks/useGigs";
import { useCategories } from "../../hooks/useCategories";

export default function EditGig({ onNavigate, params, role }) {
  const { gig, loading: loadingGig } = useGig(params?.id);
  const { updateGig, loading, error } = useUpdateGig();
  const { categories, loading: loadingCats } = useCategories();
  
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (gig && !form) {
      setForm({
        title: gig.title,
        description: gig.description,
        category_id: gig.category_id,
        required_skills: Array.isArray(gig.required_skills) ? gig.required_skills.join(", ") : "",
        pricing: gig.pricing_tiers || [
          { tier: "basic",    price: "", delivery_days: "", desc: "" },
          { tier: "standard", price: "", delivery_days: "", desc: "" },
          { tier: "premium",  price: "", delivery_days: "", desc: "" },
        ]
      });
    }
  }, [gig, form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    const success = await updateGig(params.id, payload);
    if (success) {
      alert("Gig updated successfully!");
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

  if (loadingGig || !form) return <div style={{ padding: 100, textAlign: "center" }}>Loading gig data...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: C.bgPage }}>
      <Navbar onNavigate={onNavigate} role={role} />
      <main style={{ flex: 1, padding: "40px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 32 }}>
          <h1 style={{ margin: "0 0 32px", fontSize: 28, fontWeight: 800 }}>Edit Gig</h1>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>GIG TITLE</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>CATEGORY</label>
                  <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} style={inputStyle}>
                    <option value="">{loadingCats ? "Loading..." : "Select Category"}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>SKILLS</label>
                  <input value={form.required_skills} onChange={e => setForm({ ...form, required_skills: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>DESCRIPTION</label>
                <textarea rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={inputStyle} />
              </div>
            </section>
            
            <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Pricing Packages</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {form.pricing.map((tier, i) => (
                  <div key={i} style={{ background: "#F8FAFC", border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontWeight: 800, textAlign: "center", textTransform: "capitalize" }}>{tier.tier}</div>
                    <input type="number" placeholder="Price" value={tier.price} onChange={e => updatePricing(i, "price", e.target.value)} style={inputStyle} />
                    <input type="number" placeholder="Days" value={tier.delivery_days} onChange={e => updatePricing(i, "delivery_days", e.target.value)} style={inputStyle} />
                    <textarea rows={3} placeholder="Description" value={tier.desc} onChange={e => updatePricing(i, "desc", e.target.value)} style={inputStyle} />
                  </div>
                ))}
              </div>
            </section>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <Btn variant="outlined" onClick={() => onNavigate("mygigs")}>Cancel</Btn>
              <Btn type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Btn>
            </div>
            {error && <div style={{ color: "red", textAlign: "right" }}>{error}</div>}
          </form>
        </div>
      </main>
    </div>
  );
}
