import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";
import Nav from "../components/Nav";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function BrainMesh({ regions, hovered, setHovered, selected, setSelected }) {
  const meshRef = useRef();
  const geom = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1.8, 5);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n =
        0.16 * Math.sin(v.x * 2.6 + Math.cos(v.y * 1.7) * 2.0) +
        0.12 * Math.sin(v.y * 3.0 + v.z * 2.1) +
        0.10 * Math.cos(v.z * 2.4 + v.x * 1.5);
      const fissure = Math.exp(-Math.abs(v.x) * 12.0) * 0.18;
      v.multiplyScalar(1 + n - fissure);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.08;
  });

  return (
    <group ref={meshRef}>
      <mesh geometry={geom}>
        <meshStandardMaterial
          color={"#15161d"}
          emissive={"#0a84ff"}
          emissiveIntensity={0.4}
          roughness={0.5}
        />
      </mesh>
      <mesh geometry={geom}>
        <meshBasicMaterial color={"#0a84ff"} wireframe transparent opacity={0.18} />
      </mesh>

      {regions.map((r) => {
        const isHovered = hovered === r.id;
        const isSelected = selected === r.id;
        const scale = isHovered || isSelected ? 1.6 : 1.0;
        return (
          <group key={r.id} position={r.coords}>
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(r.id);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                setHovered(null);
                document.body.style.cursor = "default";
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(r.id);
              }}
              scale={scale}
            >
              <sphereGeometry args={[0.085, 16, 16]} />
              <meshBasicMaterial
                color={r.color}
                transparent
                opacity={0.95}
              />
            </mesh>
            {(isHovered || isSelected) && (
              <Html
                position={[0, 0.22, 0]}
                center
                style={{
                  pointerEvents: "none",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: 11,
                  color: "#fafafa",
                  background: "rgba(8,8,10,0.75)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "6px 10px",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {r.name}
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

export default function Explorer() {
  const [regions, setRegions] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${API}/regions`)
      .then((res) => {
        if (mounted) {
          setRegions(res.data || []);
          if (res.data && res.data.length > 0) setSelected(res.data[0].id);
        }
      })
      .catch((e) => {
        if (mounted) setError(e.message || "Failed to load regions");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const selectedRegion = regions.find((r) => r.id === selected);

  return (
    <div className="App grain" data-testid="explorer-root" style={{ minHeight: "100vh" }}>
      <Nav />
      <div className="pt-24 max-w-[1440px] mx-auto px-6 md:px-12 pb-24">
        <div className="mono-label mb-3"><span className="label-line" />Chapter II · Interactive Atlas</div>
        <h1 className="headline-md max-w-[900px]" data-testid="explorer-title">
          Eight regions. <span className="italic-accent">Eight dialects of voltage.</span>
        </h1>
        <p className="mt-6 max-w-[600px] text-base" style={{ color: "rgba(250,250,250,0.7)" }}>
          Hover or click the markers on the cortex to reveal each lobe and structure.
        </p>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 3D Brain */}
          <div
            className="lg:col-span-7 glass"
            style={{ height: "560px", position: "relative" }}
            data-testid="explorer-canvas-wrap"
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center mono-label">
                Loading cortex …
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center mono-label" style={{ color: "#ff6b6b" }}>
                {error}
              </div>
            ) : (
              <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0, 6.5], fov: 50 }}
                style={{ background: "transparent" }}
              >
                <color attach="background" args={["#08080b"]} />
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 4, 5]} intensity={1} color={"#0a84ff"} />
                <pointLight position={[-5, -3, 3]} intensity={0.7} color={"#d4af37"} />
                <BrainMesh
                  regions={regions}
                  hovered={hovered}
                  setHovered={setHovered}
                  selected={selected}
                  setSelected={setSelected}
                />
                <OrbitControls
                  enablePan={false}
                  minDistance={4}
                  maxDistance={10}
                  autoRotate={false}
                />
                <EffectComposer>
                  <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.3} radius={0.8} />
                </EffectComposer>
              </Canvas>
            )}
            <div className="absolute top-3 left-3 mono-label" style={{ pointerEvents: "none" }}>
              Drag · Rotate
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {selectedRegion ? (
              <div className="glass p-7" data-testid="region-detail">
                <div className="mono-label mb-3" style={{ color: selectedRegion.color }}>
                  {selectedRegion.latin}
                </div>
                <h2 className="headline-md mb-4">{selectedRegion.name}</h2>
                <p className="text-sm" style={{ color: "rgba(250,250,250,0.78)" }}>
                  {selectedRegion.summary}
                </p>
                <div className="hairline mt-6 pt-5">
                  <div className="mono-label mb-2">Function</div>
                  <p className="text-sm" style={{ color: "rgba(250,250,250,0.85)" }}>
                    {selectedRegion.function}
                  </p>
                </div>
                {selectedRegion.danger && (
                  <div className="hairline mt-5 pt-5">
                    <div className="mono-label mb-2" style={{ color: "#ff8a8a" }}>Clinical Note</div>
                    <p className="text-sm" style={{ color: "rgba(250,250,250,0.75)" }}>
                      {selectedRegion.danger}
                    </p>
                  </div>
                )}
                {selectedRegion.fun_fact && (
                  <div className="hairline mt-5 pt-5">
                    <div className="mono-label mb-2" style={{ color: "#d4af37" }}>Curiosity</div>
                    <p className="text-sm" style={{ color: "rgba(250,250,250,0.75)" }}>
                      {selectedRegion.fun_fact}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass p-7 mono-label">Select a region.</div>
            )}

            <div className="grid grid-cols-2 gap-3" data-testid="region-list">
              {regions.map((r) => (
                <button
                  key={r.id}
                  data-testid={`region-btn-${r.id}`}
                  onClick={() => setSelected(r.id)}
                  className="region-card text-left"
                  style={{
                    borderColor:
                      selected === r.id
                        ? "rgba(212,175,55,0.7)"
                        : "rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="corner-tag" style={{ background: r.color, color: r.color }} />
                  <div className="mono-label">{r.latin}</div>
                  <div className="font-serif text-xl mt-1" style={{ letterSpacing: "-0.01em" }}>
                    {r.name}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-3">
              <Link to="/library" className="btn-amber" data-testid="explorer-library-btn">
                Library →
              </Link>
              <Link to="/" className="btn-ghost" data-testid="explorer-home-btn">
                ↑ Origin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
