import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ChangePasswordPage() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  const [oldPw,  setOldPw]  = useState("");
  const [newPw,  setNewPw]  = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!oldPw || !newPw)        { setError("Both fields are required"); return; }
    if (newPw.length < 6)         { setError("New password must be at least 6 characters"); return; }
    if (oldPw === newPw)          { setError("New password must be different from old password"); return; }
    setLoading(true);
    try {
      await changePassword(oldPw, newPw);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1800);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to change password.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800;900&family=DM+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes orbFloat{0%,100%{transform:translate(0,0);}50%{transform:translate(20px,-20px);}}
        @keyframes gridShift{0%{background-position:0 0;}100%{background-position:60px 60px;}}
        @keyframes cardIn{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
        @keyframes shimmer{100%{transform:translateX(100%);}}
        @keyframes scan{0%{top:-2px;}100%{top:100vh;}}
        @keyframes shake{0%,100%{transform:translateX(0);}20%{transform:translateX(-6px);}40%{transform:translateX(6px);}60%{transform:translateX(-4px);}80%{transform:translateX(4px);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes successPop{from{opacity:0;transform:scale(0.85);}to{opacity:1;transform:scale(1);}}
        @keyframes logoPulse{0%,100%{box-shadow:0 0 24px rgba(137,245,231,0.3);}50%{box-shadow:0 0 48px rgba(137,245,231,0.6);}}
        .cp-root{min-height:100vh;background:#000d1f;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;overflow:hidden;position:relative;padding:24px;}
        .grid-bg{position:fixed;inset:0;z-index:0;background-image:linear-gradient(rgba(137,245,231,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(137,245,231,0.04) 1px,transparent 1px);background-size:60px 60px;animation:gridShift 20s linear infinite;}
        .scan-line{position:fixed;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(137,245,231,0.4),transparent);animation:scan 7s linear infinite;z-index:1;pointer-events:none;}
        .orb{position:fixed;border-radius:50%;filter:blur(90px);animation:orbFloat 12s ease-in-out infinite;z-index:0;pointer-events:none;}
        .card{position:relative;z-index:10;background:rgba(0,23,54,0.78);border:1px solid rgba(137,245,231,0.12);border-radius:20px;padding:48px 44px;width:100%;max-width:420px;backdrop-filter:blur(24px);box-shadow:0 32px 64px rgba(0,0,0,0.55),inset 0 1px 0 rgba(137,245,231,0.1);animation:cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;}
        .corner{position:absolute;width:22px;height:22px;pointer-events:none;}
        .corner-tl{top:-1px;left:-1px;border-top:2px solid rgba(137,245,231,0.7);border-left:2px solid rgba(137,245,231,0.7);border-radius:4px 0 0 0;}
        .corner-tr{top:-1px;right:-1px;border-top:2px solid rgba(137,245,231,0.7);border-right:2px solid rgba(137,245,231,0.7);border-radius:0 4px 0 0;}
        .corner-bl{bottom:-1px;left:-1px;border-bottom:2px solid rgba(137,245,231,0.7);border-left:2px solid rgba(137,245,231,0.7);border-radius:0 0 0 4px;}
        .corner-br{bottom:-1px;right:-1px;border-bottom:2px solid rgba(137,245,231,0.7);border-right:2px solid rgba(137,245,231,0.7);border-radius:0 0 4px 0;}
        .logo-mark{width:50px;height:50px;background:linear-gradient(135deg,#89f5e7,#405f91);border-radius:14px;display:flex;align-items:center;justify-content:center;font-family:'Manrope',sans-serif;font-weight:900;font-size:22px;color:#000d1f;margin-bottom:20px;animation:logoPulse 3s ease-in-out infinite;}
        .title{font-family:'Manrope',sans-serif;font-weight:800;font-size:25px;color:#fff;margin-bottom:4px;}
        .subtitle{font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:32px;}
        .field-label{display:block;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(137,245,231,0.65);margin-bottom:7px;}
        .input-wrap{position:relative;margin-bottom:18px;}
        .input-wrap input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(137,245,231,0.13);border-radius:10px;padding:13px 16px;color:#fff;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color 0.25s,box-shadow 0.25s,background 0.25s;}
        .input-wrap input:focus{border-color:rgba(137,245,231,0.5);background:rgba(137,245,231,0.05);box-shadow:0 0 0 3px rgba(137,245,231,0.08);}
        .input-wrap input::placeholder{color:rgba(255,255,255,0.18);}
        .pw-toggle{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(137,245,231,0.5);font-size:16px;display:flex;align-items:center;transition:color 0.2s;}
        .pw-toggle:hover{color:#89f5e7;}
        .error-box{background:rgba(186,26,26,0.15);border:1px solid rgba(186,26,26,0.4);border-radius:10px;padding:12px 16px;color:#ff8a8a;font-size:13px;margin-bottom:16px;animation:shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97);}
        .btn-submit{width:100%;padding:14px;background:linear-gradient(135deg,#89f5e7 0%,#405f91 100%);border:none;border-radius:10px;color:#000d1f;font-family:'Manrope',sans-serif;font-weight:800;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;position:relative;overflow:hidden;transition:opacity 0.2s,transform 0.15s,box-shadow 0.2s;}
        .btn-submit:hover:not(:disabled){opacity:0.9;transform:translateY(-1px);box-shadow:0 8px 24px rgba(137,245,231,0.2);}
        .btn-submit:disabled{opacity:0.6;cursor:not-allowed;}
        .btn-submit .shimmer{position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);transform:translateX(-100%);animation:shimmer 2.2s infinite;}
        .footer-text{text-align:center;margin-top:24px;font-size:13px;color:rgba(255,255,255,0.35);}
        .footer-text a{color:#89f5e7;font-weight:600;text-decoration:none;}
        .footer-text a:hover{opacity:0.7;}
        .success-state{text-align:center;padding:24px 0;animation:successPop 0.5s cubic-bezier(0.16,1,0.3,1) both;}
        .spinner{width:16px;height:16px;border:2px solid rgba(0,13,31,0.4);border-top-color:#000d1f;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;}
      `}</style>

      <div className="cp-root">
        <div className="grid-bg" />
        <div className="scan-line" />
        <div className="orb" style={{ width:400, height:400, top:"-10%",  left:"-10%",  background:"rgba(64,95,145,0.3)",    animationDelay:"0s" }} />
        <div className="orb" style={{ width:350, height:350, bottom:"-5%", right:"-5%", background:"rgba(137,245,231,0.09)", animationDelay:"5s" }} />

        <div className="card">
          <div className="corner corner-tl" /><div className="corner corner-tr" />
          <div className="corner corner-bl" /><div className="corner corner-br" />

          {success ? (
            <div className="success-state">
              <div style={{fontSize:56,marginBottom:16}}>🔐</div>
              <h2 style={{fontFamily:"'Manrope',sans-serif",fontWeight:800,fontSize:22,color:"#89f5e7",marginBottom:8}}>Password Updated!</h2>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.45)"}}>Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <div className="logo-mark">🔑</div>
              <h1 className="title">Change password</h1>
              <p className="subtitle">Keep your account secure with a strong password</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="input-wrap">
                  <label className="field-label">Current password</label>
                  <input type={showOld?"text":"password"} placeholder="Your current password" value={oldPw} onChange={e=>setOldPw(e.target.value)} style={{paddingRight:44}} />
                  <button type="button" className="pw-toggle" onClick={()=>setShowOld(p=>!p)}>{showOld?"🙈":"👁"}</button>
                </div>
                <div className="input-wrap">
                  <label className="field-label">New password</label>
                  <input type={showNew?"text":"password"} placeholder="Min 6 characters" value={newPw} onChange={e=>setNewPw(e.target.value)} style={{paddingRight:44}} />
                  <button type="button" className="pw-toggle" onClick={()=>setShowNew(p=>!p)}>{showNew?"🙈":"👁"}</button>
                </div>
                {error && <div className="error-box">⚠ {error}</div>}
                <button type="submit" className="btn-submit" disabled={loading}>
                  <span className="shimmer" />
                  {loading ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><span className="spinner"/>Updating...</span> : "Update Password"}
                </button>
              </form>

              <p className="footer-text"><Link to="/dashboard">← Back to dashboard</Link></p>
            </>
          )}
        </div>
      </div>
    </>
  );
}