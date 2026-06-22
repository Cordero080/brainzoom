import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stageOpacity, range } from "../util";

/**
 * Synapse — Stage 4: Extreme close-up on the synaptic cleft.
 * Presynaptic terminal (top) + postsynaptic dendrite (bottom), separated by a
 * ~20nm cleft. Neurotransmitter vesicles fuse and release into the cleft, then
 * a phosphorescent gold flash bursts as the postsynaptic membrane activates.
 */
export default function Synapse({ progress }) {
  const groupRef = useRef();
  const preMatRef = useRef();
  const postMatRef = useRef();
  const vesicleMatRef = useRef();
  const flashRef = useRef();
  const ntPointsRef = useRef();
  const ntMatRef = useRef();

  // Vesicle positions inside presynaptic bouton
  const vesicles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 24; i++) {
      arr.push([
        (Math.random() - 0.5) * 1.3,
        0.7 + Math.random() * 0.6,
        (Math.random() - 0.5) * 1.3,
      ]);
    }
    return arr;
  }, []);

  // Neurotransmitter particle "stream" - will animate across the cleft
  const ntPositions = useMemo(() => {
    const count = 220;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 1.4;
      arr[i * 3 + 1] = 0.6; // start near presynaptic membrane
      arr[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const fade = stageOpacity(progress, 0.72, 0.88, 0.06);
    if (preMatRef.current) preMatRef.current.opacity = fade;
    if (postMatRef.current) postMatRef.current.opacity = fade;
    if (vesicleMatRef.current) vesicleMatRef.current.opacity = fade;

    // Local timeline within the synapse stage
    const local = range(progress, 0.74, 0.86);
    // particles travel down from y=0.6 -> -0.6
    if (ntPointsRef.current) {
      const geo = ntPointsRef.current.geometry;
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const baseY = 0.6;
        const dropT = THREE.MathUtils.clamp(local * 1.1 - (i % 40) * 0.005, 0, 1);
        pos.setY(i, baseY - dropT * 1.2);
      }
      pos.needsUpdate = true;
    }
    if (ntMatRef.current) {
      ntMatRef.current.opacity = fade * (local > 0.02 ? 1 : 0);
    }

    // Postsynaptic gold flash near the end of stage
    if (flashRef.current) {
      const flashIntensity = Math.max(0, Math.sin(local * Math.PI)) ** 3;
      flashRef.current.material.opacity = fade * flashIntensity;
      flashRef.current.scale.setScalar(1.0 + flashIntensity * 1.6);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.2}>
      {/* Presynaptic terminal (top bulb) */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[1.3, 48, 48]} />
        <meshStandardMaterial
          ref={preMatRef}
          color={"#101218"}
          emissive={"#0a84ff"}
          emissiveIntensity={0.5}
          roughness={0.45}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Vesicles inside presynaptic terminal */}
      <group>
        {vesicles.map((p, i) => (
          <mesh key={`v-${i}`} position={p}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshBasicMaterial
              ref={i === 0 ? vesicleMatRef : undefined}
              color={"#fff2b0"}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* Postsynaptic dendrite (bottom slab) */}
      <mesh position={[0, -1.2, 0]}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshStandardMaterial
          ref={postMatRef}
          color={"#0c0e14"}
          emissive={"#0a84ff"}
          emissiveIntensity={0.4}
          roughness={0.55}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Neurotransmitter particles in the cleft */}
      <points ref={ntPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={ntPositions.length / 3}
            array={ntPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={ntMatRef}
          color={"#ffd86b"}
          size={0.06}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Synaptic flash */}
      <mesh ref={flashRef} position={[0, -0.55, 0]}>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshBasicMaterial
          color={"#ffe89a"}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
