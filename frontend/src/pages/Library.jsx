import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORY_LABEL = {
  neuron: "Neuronal Anatomy",
  synapse: "Synaptic Transmission",
  pathway: "Spinal & Motor Pathways",
};

const CATEGORY_ORDER = ["neuron", "synapse", "pathway"];

export default function Library() {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${API}/structures`)
      .then((res) => {
        if (mounted) setStructures(res.data || []);
      })
      .catch((e) => mounted && setError(e.message || "Failed to load."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: structures.filter((s) => s.category === cat),
  }));

  return (
    <div className="App grain" data-testid="library-root" style={{ minHeight: "100vh" }}>
      <Nav />
      <div className="pt-24 max-w-[1440px] mx-auto px-6 md:px-12 pb-24">
        <div className="mono-label mb-3">
          <span className="label-line" />Chapter III · Library of Structures
        </div>
        <h1 className="headline-md max-w-[900px]" data-testid="library-title">
          The vocabulary of the
          <span className="italic-accent"> nervous system.</span>
        </h1>
        <p className="mt-6 max-w-[640px] text-base" style={{ color: "rgba(250,250,250,0.7)" }}>
          A field guide to the cellular components, electrical events, and
          pathways referenced in the cosmic descent.
        </p>

        {loading && (
          <div className="mt-12 mono-label">Loading structures …</div>
        )}
        {error && (
          <div className="mt-12 mono-label" style={{ color: "#ff8a8a" }}>{error}</div>
        )}

        <div className="mt-14 space-y-16">
          {grouped.map((g) => (
            <section key={g.cat} data-testid={`library-cat-${g.cat}`}>
              <div className="flex items-baseline gap-4 mb-6">
                <h2 className="font-serif" style={{ fontSize: 30, fontWeight: 300 }}>
                  {CATEGORY_LABEL[g.cat]}
                </h2>
                <span className="mono-label">{g.items.length} entries</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {g.items.map((s) => {
                  const open = active === s.id;
                  return (
                    <button
                      key={s.id}
                      data-testid={`structure-${s.id}`}
                      onClick={() => setActive(open ? null : s.id)}
                      className="region-card text-left"
                      style={{
                        borderColor: open
                          ? "rgba(212,175,55,0.7)"
                          : "rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="mono-label">{g.cat}</div>
                          <div
                            className="font-serif mt-1"
                            style={{ fontSize: 22, letterSpacing: "-0.015em" }}
                          >
                            {s.name}
                          </div>
                        </div>
                        <span
                          className="mono-label"
                          style={{ color: "rgba(250,250,250,0.55)" }}
                        >
                          {open ? "—" : "+"}
                        </span>
                      </div>
                      <p
                        className="mt-3 text-sm"
                        style={{ color: "rgba(250,250,250,0.72)" }}
                      >
                        {s.summary}
                      </p>
                      {open && (
                        <div className="hairline mt-5 pt-5">
                          <p
                            className="text-sm"
                            style={{ color: "rgba(250,250,250,0.85)" }}
                          >
                            {s.detail}
                          </p>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            {Object.entries(s.metrics || {}).map(([k, v]) => (
                              <div key={k}>
                                <div className="mono-label mb-1">{k}</div>
                                <div
                                  className="font-mono"
                                  style={{ color: "#d4af37", fontSize: 13 }}
                                >
                                  {v}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 flex gap-3 flex-wrap">
          <Link to="/explore" className="btn-amber" data-testid="library-explore-btn">
            Brain Atlas →
          </Link>
          <Link to="/" className="btn-ghost" data-testid="library-home-btn">
            ↑ Origin
          </Link>
        </div>
      </div>
    </div>
  );
}
