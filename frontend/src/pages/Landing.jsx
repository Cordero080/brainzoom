import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useScrollProgress from "../hooks/useScrollProgress";
import CosmicScene from "../three/CosmicScene";

const STAGES = [
  { id: "origin", label: "00 — Cosmic Origin", at: 0.05 },
  { id: "form", label: "01 — The Human Form", at: 0.27 },
  { id: "brain", label: "02 — Into the Cortex", at: 0.47 },
  { id: "neuron", label: "03 — A Single Neuron", at: 0.65 },
  { id: "synapse", label: "04 — Synaptic Flash", at: 0.80 },
  { id: "pathway", label: "05 — Spinal Pathway", at: 0.94 },
];

function HudCorner({ progress }) {
  const az = (progress * 360).toFixed(1).padStart(5, "0");
  const zoom = (24 - progress * 14).toFixed(2);
  return (
    <div className="hud-corner hidden md:block" data-testid="hud-corner">
      <div className="stat">Camera · Z</div>
      <div className="value">{zoom}</div>
      <div className="stat mt-3">Field · °</div>
      <div className="value">{az}</div>
      <div className="stat mt-3">Stage</div>
      <div className="value">
        {(STAGES.find((s, i) => progress < (STAGES[i + 1]?.at ?? 1.01))?.label ||
          STAGES[STAGES.length - 1].label).toUpperCase()}
      </div>
    </div>
  );
}

function ProgressRail({ progress }) {
  return (
    <div className="progress-rail hidden md:flex" data-testid="progress-rail">
      {STAGES.map((s, i) => {
        const next = STAGES[i + 1]?.at ?? 1.01;
        const active = progress >= s.at - 0.02 && progress < next - 0.02;
        return (
          <div
            key={s.id}
            className={`dot relative ${active ? "active" : ""}`}
            data-testid={`rail-${s.id}`}
            onClick={() => {
              const el = document.getElementById(`section-${s.id}`);
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="tip">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Landing() {
  const progress = useScrollProgress();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="App grain" data-testid="landing-root">
      {/* Sticky cosmic 3D scene */}
      <div className="canvas-sticky">
        {mounted && <CosmicScene progress={progress} />}
      </div>
      <div className="vignette" />

      <HudCorner progress={progress} />
      <ProgressRail progress={progress} />

      {/* Hero / Stage 00 — Cosmic Origin */}
      <section
        id="section-origin"
        className="stage-section hero"
        data-testid="section-origin"
      >
        <div className="stage-content max-w-[1440px] w-full mx-auto px-6 md:px-12">
          <div className="mono-label mb-6" data-testid="hero-overline">
            <span className="label-line" />
            EST. 2026 · NEUROANATOMICAL ATLAS · CHAPTER ZERO
          </div>
          <h1
            className="headline-xl max-w-[1100px]"
            data-testid="hero-headline"
          >
            From the silence between stars,
            <br />
            <span className="italic-accent">a single thought</span> ignites.
          </h1>
          <p
            className="mt-10 max-w-[560px] text-base md:text-lg"
            style={{ color: "rgba(250,250,250,0.7)", fontWeight: 300 }}
            data-testid="hero-paragraph"
          >
            Scroll to descend from the cosmos into the human body, through the
            cortex, along a single dendrite, across the synaptic cleft, and down
            the spine to the instant a muscle answers.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <button
              data-testid="hero-begin-btn"
              className="btn-amber"
              onClick={() => {
                document
                  .getElementById("section-form")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Begin the Descent ↓
            </button>
            <Link to="/explore" className="btn-ghost" data-testid="hero-atlas-btn">
              Open the Atlas
            </Link>
          </div>
        </div>
        <div className="scroll-hint" data-testid="scroll-hint">
          <span>Scroll</span>
          <span className="line" />
        </div>
      </section>

      {/* Stage 01 — Human Form */}
      <section
        id="section-form"
        className="stage-section"
        data-testid="section-form"
      >
        <div className="stage-content max-w-[1440px] w-full mx-auto px-6 md:px-12">
          <div className="ml-auto md:max-w-[440px] glass p-7" data-testid="form-card">
            <div className="mono-label mb-5">01 / Body</div>
            <h2 className="headline-md mb-5">
              The body is made of stars,
              <br />
              <span className="italic-accent">arranged in a self.</span>
            </h2>
            <p className="text-sm md:text-base" style={{ color: "rgba(250,250,250,0.72)" }}>
              Roughly 86 billion neurons resolve into a single luminous silhouette.
              At the center of the skull, a quiet golden ember begins to pulse —
              the cortex is waking.
            </p>
            <div className="hairline mt-7 pt-5 grid grid-cols-2 gap-4">
              <div>
                <div className="mono-label mb-1">Neurons</div>
                <div className="font-mono text-base" style={{ color: "#d4af37" }}>
                  86,000,000,000
                </div>
              </div>
              <div>
                <div className="mono-label mb-1">Synapses</div>
                <div className="font-mono text-base" style={{ color: "#d4af37" }}>
                  100 trillion
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stage 02 — Brain */}
      <section
        id="section-brain"
        className="stage-section"
        data-testid="section-brain"
      >
        <div className="stage-content max-w-[1440px] w-full mx-auto px-6 md:px-12">
          <div className="md:max-w-[480px] glass p-7" data-testid="brain-card">
            <div className="mono-label mb-5">02 / Cortex</div>
            <h2 className="headline-md mb-5">
              Three pounds of folded
              <br />
              <span className="italic-accent">electric tissue.</span>
            </h2>
            <p className="text-sm md:text-base" style={{ color: "rgba(250,250,250,0.72)" }}>
              The gyri and sulci flatten in the camera&apos;s approach. Lobes resolve —
              frontal, parietal, temporal, occipital — each humming with its own
              dialect of voltage. We choose one.
            </p>
            <div className="mt-7 flex items-center gap-3">
              <Link
                to="/explore"
                className="btn-ghost"
                data-testid="brain-explore-btn"
              >
                Tour the Lobes →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stage 03 — Neuron */}
      <section
        id="section-neuron"
        className="stage-section"
        data-testid="section-neuron"
      >
        <div className="stage-content max-w-[1440px] w-full mx-auto px-6 md:px-12">
          <div className="ml-auto md:max-w-[460px] glass p-7" data-testid="neuron-card">
            <div className="mono-label mb-5">03 / Neuron</div>
            <h2 className="headline-md mb-5">
              A pyramidal cell — its dendrites are an
              <span className="italic-accent"> antenna for the world.</span>
            </h2>
            <p className="text-sm md:text-base" style={{ color: "rgba(250,250,250,0.72)" }}>
              Six trunks spread into the cortex, bristling with ten thousand
              spines. Below the soma, a myelinated axon descends — silent until,
              at the hillock, the threshold breaks.
            </p>
            <div className="hairline mt-7 pt-5 grid grid-cols-3 gap-4">
              <Stat label="Soma" value="20 μm" />
              <Stat label="Spines" value="10k+" />
              <Stat label="Vm" value="−70 mV" />
            </div>
          </div>
        </div>
      </section>

      {/* Stage 04 — Synapse */}
      <section
        id="section-synapse"
        className="stage-section"
        data-testid="section-synapse"
      >
        <div className="stage-content max-w-[1440px] w-full mx-auto px-6 md:px-12">
          <div className="md:max-w-[480px] glass p-7" data-testid="synapse-card">
            <div className="mono-label mb-5">04 / Synapse</div>
            <h2 className="headline-md mb-5">
              In twenty nanometers,
              <br />
              <span className="italic-accent">a message is born.</span>
            </h2>
            <p className="text-sm md:text-base" style={{ color: "rgba(250,250,250,0.72)" }}>
              Calcium pours in. Vesicles dock, fuse, release. Glutamate sprints
              across the cleft, binds receptors on the postsynaptic membrane —
              and a bioluminescent gold flash blooms.
            </p>
            <div className="hairline mt-7 pt-5 grid grid-cols-3 gap-4">
              <Stat label="Cleft" value="20 nm" />
              <Stat label="Delay" value="~0.5 ms" />
              <Stat label="NT" value="Glutamate" />
            </div>
          </div>
        </div>
      </section>

      {/* Stage 05 — Spinal Pathway */}
      <section
        id="section-pathway"
        className="stage-section"
        data-testid="section-pathway"
      >
        <div className="stage-content max-w-[1440px] w-full mx-auto px-6 md:px-12">
          <div className="ml-auto md:max-w-[480px] glass p-7" data-testid="pathway-card">
            <div className="mono-label mb-5">05 / Pathway</div>
            <h2 className="headline-md mb-5">
              At 120 m/s, the signal becomes
              <span className="italic-accent"> motion.</span>
            </h2>
            <p className="text-sm md:text-base" style={{ color: "rgba(250,250,250,0.72)" }}>
              The corticospinal tract races down the cord. Pulses leap between
              Nodes of Ranvier. At the neuromuscular junction, acetylcholine
              releases — a muscle contracts. A finger lifts.
            </p>
            <div className="hairline mt-7 pt-5 grid grid-cols-3 gap-4">
              <Stat label="Cord" value="45 cm" />
              <Stat label="Speed" value="120 m/s" />
              <Stat label="Mode" value="Saltatory" />
            </div>
            <div className="mt-7 flex gap-3 flex-wrap">
              <Link to="/library" className="btn-amber" data-testid="pathway-library-btn">
                Explore the Library →
              </Link>
              <button
                className="btn-ghost"
                data-testid="pathway-restart-btn"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Return to Origin ↑
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Outro */}
      <section
        className="relative z-10 px-6 md:px-12 py-24"
        data-testid="section-outro"
        style={{ background: "linear-gradient(180deg, transparent, #050507 30%)" }}
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="mono-label mb-4">Coda</div>
          <h3 className="headline-md max-w-[900px]">
            One signal, traced from
            <span className="italic-accent"> deep space</span> to the lift of a finger.
          </h3>
          <p
            className="mt-6 max-w-[640px] text-base"
            style={{ color: "rgba(250,250,250,0.65)" }}
          >
            Continue into the interactive Brain Atlas or browse the Library of
            neural structures.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link to="/explore" className="btn-amber" data-testid="outro-atlas-btn">
              Brain Atlas
            </Link>
            <Link to="/library" className="btn-ghost" data-testid="outro-library-btn">
              Library of Structures
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="mono-label mb-1">{label}</div>
      <div
        className="font-mono"
        style={{ color: "#d4af37", fontSize: 14 }}
      >
        {value}
      </div>
    </div>
  );
}
