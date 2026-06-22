import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stageOpacity } from "../util";

/**
 * HumanForm — Stage 1: A humanoid silhouette built from a particle cloud.
 * Samples points from a parametric body shape: head + torso + limbs.
 */
function sampleHumanPoints(count = 5500) {
  const positions = new Float32Array(count * 3);
  let i = 0;

  // Body sections defined as capsules/spheres with sampling weights
  const parts = [
    // [centerX, centerY, centerZ, radius, halfLength (along Y), weight]
    { type: "sphere", cx: 0, cy: 3.3, cz: 0, r: 0.7, w: 1.2 },     // head
    { type: "capsule", cx: 0, cy: 1.6, cz: 0, r: 0.75, h: 0.8, w: 2.4 }, // torso
    { type: "capsule", cx: 0, cy: 0.2, cz: 0, r: 0.55, h: 0.45, w: 1.0 }, // hips
    // Arms
    { type: "capsule", cx: -0.95, cy: 1.4, cz: 0, r: 0.22, h: 1.0, w: 1.1 },
    { type: "capsule", cx: 0.95, cy: 1.4, cz: 0, r: 0.22, h: 1.0, w: 1.1 },
    // Forearms
    { type: "capsule", cx: -0.95, cy: -0.05, cz: 0, r: 0.18, h: 0.85, w: 0.9 },
    { type: "capsule", cx: 0.95, cy: -0.05, cz: 0, r: 0.18, h: 0.85, w: 0.9 },
    // Thighs
    { type: "capsule", cx: -0.35, cy: -1.0, cz: 0, r: 0.3, h: 1.1, w: 1.2 },
    { type: "capsule", cx: 0.35, cy: -1.0, cz: 0, r: 0.3, h: 1.1, w: 1.2 },
    // Calves
    { type: "capsule", cx: -0.35, cy: -2.7, cz: 0, r: 0.22, h: 0.95, w: 1.0 },
    { type: "capsule", cx: 0.35, cy: -2.7, cz: 0, r: 0.22, h: 0.95, w: 1.0 },
  ];

  const totalWeight = parts.reduce((a, p) => a + p.w, 0);

  while (i < count) {
    let pick = Math.random() * totalWeight;
    let chosen = parts[0];
    for (const p of parts) {
      pick -= p.w;
      if (pick <= 0) {
        chosen = p;
        break;
      }
    }
    let x, y, z;
    if (chosen.type === "sphere") {
      // sample inside sphere
      const u = Math.random();
      const r = chosen.r * Math.cbrt(u);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      x = chosen.cx + r * Math.sin(phi) * Math.cos(theta);
      y = chosen.cy + r * Math.sin(phi) * Math.sin(theta);
      z = chosen.cz + r * Math.cos(phi);
    } else {
      // capsule: cylinder + sphere caps; approximate by sampling within a vertically-oriented cylinder
      const along = (Math.random() * 2 - 1) * chosen.h; // along Y
      const rr = chosen.r * Math.sqrt(Math.random());
      const ang = Math.random() * Math.PI * 2;
      x = chosen.cx + rr * Math.cos(ang);
      y = chosen.cy + along;
      z = chosen.cz + rr * Math.sin(ang) * 0.6; // squash depth so silhouette reads well
    }
    positions[i * 3] = x;
    positions[i * 3 + 1] = y - 0.3; // shift center a bit
    positions[i * 3 + 2] = z;
    i++;
  }

  return positions;
}

export default function HumanForm({ progress }) {
  const groupRef = useRef();
  const matRef = useRef();
  const matAmberRef = useRef();

  const positions = useMemo(() => sampleHumanPoints(5500), []);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.12;
    }
    const fade = stageOpacity(progress, 0.16, 0.40, 0.08);
    if (matRef.current) matRef.current.opacity = fade * 0.9;
    if (matAmberRef.current) {
      // Pulse the bioluminescent core (heart / brain glow)
      const t = performance.now() * 0.001;
      matAmberRef.current.opacity = fade * (0.55 + 0.35 * Math.sin(t * 2.2));
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.1}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={matRef}
          color={"#0a84ff"}
          size={0.04}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Brain core glow */}
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[0.36, 32, 32]} />
        <meshBasicMaterial
          ref={matAmberRef}
          color={"#d4af37"}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
