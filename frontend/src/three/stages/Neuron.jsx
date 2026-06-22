import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stageOpacity, range } from "../util";

/**
 * Neuron — Stage 3: A medically-styled multipolar pyramidal neuron.
 * - Soma (cell body) at origin
 * - 6 main dendritic trunks, each with 2–3 child branches
 * - One descending myelinated axon with axon terminals
 * - A glowing "action potential" traveling outward along a dendrite, then down the axon
 */

function makeBranchCurve(start, direction, length, jitter = 0.4) {
  const points = [];
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = start.x + direction.x * length * t + (Math.random() - 0.5) * jitter * t;
    const py = start.y + direction.y * length * t + (Math.random() - 0.5) * jitter * t;
    const pz = start.z + direction.z * length * t + (Math.random() - 0.5) * jitter * t;
    points.push(new THREE.Vector3(px, py, pz));
  }
  return new THREE.CatmullRomCurve3(points);
}

export default function Neuron({ progress }) {
  const groupRef = useRef();
  const somaRef = useRef();
  const pulseRef = useRef();
  const tubeMatsRef = useRef([]);
  const axonMatRef = useRef();
  const myelinRefs = useRef([]);

  // Build dendrite curves
  const { trunks, branches, axonCurve, myelinSegments } = useMemo(() => {
    const trunks = [];
    const branches = [];
    // 6 trunks pointing outward & slightly upward
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dir = new THREE.Vector3(
        Math.cos(angle),
        0.7 + Math.random() * 0.6,
        Math.sin(angle)
      ).normalize();
      const length = 1.6 + Math.random() * 0.6;
      const curve = makeBranchCurve(new THREE.Vector3(0, 0, 0), dir, length, 0.35);
      trunks.push(curve);

      // 2-3 child branches near the tip
      const childCount = 2 + Math.floor(Math.random() * 2);
      const tip = curve.getPoint(0.7);
      for (let j = 0; j < childCount; j++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.2) * 0.8,
          (Math.random() - 0.5) * 1.5
        );
        const cDir = dir.clone().add(offset).normalize();
        const cCurve = makeBranchCurve(tip, cDir, 0.9 + Math.random() * 0.5, 0.3);
        branches.push(cCurve);
      }
    }

    // Axon: downward with slight curve
    const axonPoints = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      axonPoints.push(
        new THREE.Vector3(
          Math.sin(t * Math.PI * 0.6) * 0.4,
          -0.4 - t * 6.5,
          Math.cos(t * Math.PI * 0.4) * 0.25
        )
      );
    }
    const axonCurve = new THREE.CatmullRomCurve3(axonPoints);

    // Myelin segments along the axon: cylinder repeats with gaps (Nodes of Ranvier)
    const myelinSegments = [];
    const totalSegs = 10;
    for (let s = 0; s < totalSegs; s++) {
      const tStart = 0.1 + (s / totalSegs) * 0.85;
      const tEnd = tStart + 0.06;
      const p1 = axonCurve.getPoint(tStart);
      const p2 = axonCurve.getPoint(tEnd);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const dir = p2.clone().sub(p1);
      const length = dir.length();
      myelinSegments.push({
        position: mid.toArray(),
        length,
        quaternion: new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        ),
      });
    }

    return { trunks, branches, axonCurve, myelinSegments };
  }, []);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.18;
    }
    const fade = stageOpacity(progress, 0.54, 0.76, 0.08);
    // Soma pulse
    if (somaRef.current) {
      const t = performance.now() * 0.001;
      somaRef.current.material.emissiveIntensity = 1.4 + Math.sin(t * 3.4) * 0.7;
      somaRef.current.material.opacity = fade;
    }
    // Dendrite tubes
    tubeMatsRef.current.forEach((m) => {
      if (m) m.opacity = fade * 0.85;
    });
    // Myelin
    myelinRefs.current.forEach((m) => {
      if (m) m.material.opacity = fade * 0.9;
    });
    if (axonMatRef.current) axonMatRef.current.opacity = fade;

    // Action potential pulse — travels down the axon during this stage
    if (pulseRef.current) {
      const localT = range(progress, 0.6, 0.74);
      const point = axonCurve.getPoint(Math.min(0.98, localT));
      pulseRef.current.position.copy(point);
      pulseRef.current.material.opacity = fade * (localT > 0.02 ? 1 : 0);
      pulseRef.current.scale.setScalar(0.18 + Math.sin(performance.now() * 0.012) * 0.04);
    }
  });

  return (
    <group ref={groupRef} position={[0, 1.6, 0]} scale={0.85}>
      {/* Soma (cell body) */}
      <mesh ref={somaRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color={"#1a1a22"}
          emissive={"#d4af37"}
          emissiveIntensity={1.2}
          roughness={0.45}
          transparent
        />
      </mesh>

      {/* Dendrite trunks */}
      {trunks.map((curve, i) => (
        <mesh key={`t-${i}`}>
          <tubeGeometry args={[curve, 36, 0.045, 8, false]} />
          <meshStandardMaterial
            ref={(el) => (tubeMatsRef.current[i] = el)}
            color={"#0a84ff"}
            emissive={"#0a84ff"}
            emissiveIntensity={0.6}
            transparent
            opacity={0}
          />
        </mesh>
      ))}

      {/* Dendrite branches */}
      {branches.map((curve, i) => (
        <mesh key={`b-${i}`}>
          <tubeGeometry args={[curve, 24, 0.022, 6, false]} />
          <meshStandardMaterial
            ref={(el) => (tubeMatsRef.current[trunks.length + i] = el)}
            color={"#79b5ff"}
            emissive={"#0a84ff"}
            emissiveIntensity={0.45}
            transparent
            opacity={0}
          />
        </mesh>
      ))}

      {/* Axon — thin core */}
      <mesh>
        <tubeGeometry args={[axonCurve, 80, 0.035, 8, false]} />
        <meshStandardMaterial
          ref={axonMatRef}
          color={"#0a84ff"}
          emissive={"#0a84ff"}
          emissiveIntensity={0.7}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Myelin sheath segments */}
      {myelinSegments.map((s, i) => (
        <mesh
          key={`m-${i}`}
          ref={(el) => (myelinRefs.current[i] = el)}
          position={s.position}
          quaternion={s.quaternion}
        >
          <cylinderGeometry args={[0.09, 0.09, s.length, 12, 1, false]} />
          <meshStandardMaterial
            color={"#1c2a3c"}
            emissive={"#0a84ff"}
            emissiveIntensity={0.18}
            roughness={0.7}
            transparent
            opacity={0}
          />
        </mesh>
      ))}

      {/* Action potential pulse */}
      <mesh ref={pulseRef} position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial
          color={"#fff7c2"}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
