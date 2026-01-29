// Student-friendly UI (concise)
import React, { useState } from "react";
import axios from "axios";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5050";

const FIELDS = [
  { name: "age", label: "Age (yrs)" },
  { name: "sex", label: "Sex (0=F,1=M)" },
  { name: "cp", label: "Chest pain (0-3)" },
  { name: "trestbps", label: "Resting BP (mmHg)" },
  { name: "chol", label: "Cholesterol (mg/dl)" },
  { name: "fbs", label: "Fasting BS (0/1)" },
  { name: "restecg", label: "Rest ECG (0-2)" },
  { name: "thalach", label: "Max HR" },
  { name: "exang", label: "Ex. angina (0/1)" },
  { name: "oldpeak", label: "ST depression" },
  { name: "slope", label: "Slope (0-2)" },
  { name: "ca", label: "Major vessels (0-3)" },
  { name: "thal", label: "Thal (1-3)" }
];

export default function App() {
  const [form, setForm] = useState({});
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const build = () => {
    const p = {};
    FIELDS.forEach(f => {
      const v = form[f.name];
      p[f.name] = v === undefined || v === "" ? null : (isNaN(Number(v)) ? v : Number(v));
    });
    return p;
  };

  const predict = async () => {
    setMsg("");
    const payload = build();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/predict`, payload, { timeout: 10000 });
      setRes(data);
    } catch (e) {
      setMsg(e?.response?.data?.error || e.message || "Server/Network error");
      setRes(null);
    } finally {
      setLoading(false);
    }
  };

  const explain = async () => {
    setMsg("");
    const payload = build();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/explain`, payload, { timeout: 20000 });
      setRes(prev => ({ ...prev, explain: data }));
    } catch (e) {
      setMsg(e?.response?.data?.error || e.message || "Explain error");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setForm({});
    setRes(null);
    setMsg("");
  };

  return (
    <div className="wrap">
      <div className="left">
        <h1>Heart Attack Predictor</h1>
        <p className="subtitle">Enter patient data and click Predict</p>

        <div className="grid">
          {FIELDS.map(f => (
            <label key={f.name} className="field">
              <span className="fld-label">{f.label}</span>
              <input
                name={f.name}
                value={form[f.name] ?? ""}
                onChange={handleChange}
                placeholder={f.label}
                className="input"
              />
            </label>
          ))}
        </div>

        {msg && <div className="error">{msg}</div>}

        <div className="actions">
          <button className="btn primary" onClick={predict} disabled={loading}>
            {loading ? "Predicting..." : "Predict"}
          </button>
          <button className="btn" onClick={explain} disabled={loading}>Explain</button>
          <button className="btn ghost" onClick={clearAll}>Clear</button>
        </div>

        {res && !res.error && (
          <div className="result">
            <div className="rrow">
              <strong>Prediction:</strong>
              <span className={`badge ${res.prediction === 1 ? "bad" : "good"}`}>
                {res.prediction === 1 ? "High Risk" : "Low Risk"}
              </span>
            </div>
            <div className="rrow">
              <strong>Probability:</strong>
              <span>{typeof res.probability === "number" ? res.probability.toFixed(3) : res.probability}</span>
            </div>
            {res.explain && res.explain.top_features && (
              <div className="explain">
                <strong>Top features:</strong>
                <ul>
                  {res.explain.top_features.map((t, i) => (
                    <li key={i}>{t.feature} ({t.importance})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {res?.error && <div className="error">Server: {res.error}</div>}
      </div>

      <aside className="right">
        <h3>Quick feature notes</h3>
        <ul>
          <li><strong>cp</strong>: chest pain type (0–3)</li>
          <li><strong>fbs</strong>: fasting blood sugar (1 if &gt;120 mg/dl)</li>
          <li><strong>restecg</strong>: ECG result (0 normal, 1 ST-T, 2 LVH)</li>
          <li><strong>slope</strong>: ST slope (0 up, 1 flat, 2 down)</li>
          <li><strong>ca</strong>: number of major vessels (0–3)</li>
          <li><strong>thal</strong>: thalassemia/perfusion (1 normal, 2 fixed, 3 reversible)</li>
        </ul>

        <p className="small">Keep the backend running on port shown in your backend terminal (default 5050).</p>
      </aside>
    </div>
  );
}
