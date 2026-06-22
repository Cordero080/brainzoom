import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import CosmicDust from "./stages/CosmicDust";
import HumanForm from "./stages/HumanForm";
import Brain from "./stages/Brain";
import Neuron from "./stages/Neuron";
import Synapse from "./stages/Synapse";
import SpinalPathway from "./stages/SpinalPathway";
import { lerp, range, smooth } from "./util";

function CameraRig({ progressRef }) {
  const target = useRef(new THREE.Vector3(0, 0, 0));
  useFrame(({ camera }) => {
    const p = progressRef.current;
    // Camera dollies in from far away to close
    // 0.0 -> z=22 (cosmic far)
    // 0.2 -> z=14 (silhouette)
    // 0.45 -> z=8 (brain close)
    // 0.65 -> z=5 (neuron close)
    // 0.80 -> z=3.6 (synapse close)
    // 1.0  -> z=10 (zoom out along spine)
    let z;
    if (p < 0.2) z = lerp(24, 14, smooth(range(p, 0, 0.2)));
    else if (p < 0.45) z = lerp(14, 7, smooth(range(p, 0.2, 0.45)));
    else if (p < 0.65) z = lerp(7, 5.5, smooth(range(p, 0.45, 0.65)));
    else if (p < 0.8) z = lerp(5.5, 3.6, smooth(range(p, 0.65, 0.8)));
    else z = lerp(3.6, 9, smooth(range(p, 0.8, 1)));

    // Slight Y drift downward in spinal stage
    const yOffset = p > 0.84 ? lerp(0, -1.2, range(p, 0.84, 1)) : 0;

    camera.position.lerp(new THREE.Vector3(0, yOffset, z), 0.06);
    camera.lookAt(target.current);
  });
  return null;
}

export default function CosmicScene({ progress }) {
  // Use a ref so re-renders don't flood the canvas
  const progressRef = useRef(progress);
  progressRef.current = progress;

  return (
    <Canvas
      className="canvas-sticky"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 22], fov: 55, near: 0.1, far: 200 }}
      style={{ background: "transparent" }}
    >
      <color attach="background" args={["#050507"]} />
      <fog attach="fog" args={["#050507", 12, 60]} />

      {/* Ambient + directional for the brain/neuron lighting */}
      <ambientLight intensity={0.25} />
      <pointLight position={[6, 4, 6]} intensity={1.2} color={"#0a84ff"} />
      <pointLight position={[-6, -4, 4]} intensity={0.9} color={"#d4af37"} />

      <Suspense fallback={null}>
        <CosmicDust progress={progress} />
        <HumanForm progress={progress} />
        <Brain progress={progress} />
        <Neuron progress={progress} />
        <Synapse progress={progress} />
        <SpinalPathway progress={progress} />
      </Suspense>

      <CameraRig progressRef={progressRef} />

      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={2.4}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.85}
          radius={0.9}
        />
        <Vignette eskil={false} offset={0.18} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  );
}
