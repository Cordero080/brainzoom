import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stageOpacity } from "../util";

/**
 * Brain — Stage 2: A noisy, displaced sphere mimicking cerebral cortex gyri,
 * wrapped in a layer of glowing synaptic micro-points.
 */
export default function Brain({ progress }) {
  const groupRef = useRef();
  const brainMatRef = useRef();
  const pointsMatRef = useRef();
  const wireRef = useRef();

  // Build a displaced icosahedron-ish brain mesh procedurally with noise.
  const brainGeom = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.4, 5);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    // 3D-ish hashed noise via trig — cheap but believable gyri folds.
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n =
        0.15 * Math.sin(v.x * 2.6 + Math.cos(v.y * 1.7) * 2.0) +
        0.12 * Math.sin(v.y * 3.0 + v.z * 2.1) +
        0.10 * Math.cos(v.z * 2.4 + v.x * 1.5);
      // Hemisphere fissure: push slight inward at x ≈ 0
      const fissure = Math.exp(-Math.abs(v.x) * 12.0) * 0.18;
      v.multiplyScalar(1 + n - fissure);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const surfacePoints = useMemo(() => {
    // Sprinkle bright points across the surface for the synaptic glow shell
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const tmp = new THREE.Vector3();
    const samplePos = brainGeom.attributes.position;
    const total = samplePos.count;
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * total);
      tmp.fromBufferAttribute(samplePos, idx);
      // Tiny outward offset
      const offset = 1 + Math.random() * 0.04;
      positions[i * 3] = tmp.x * offset;
      positions[i * 3 + 1] = tmp.y * offset;
      positions[i * 3 + 2] = tmp.z * offset;
    }
    return positions;
  }, [brainGeom]);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.18;
    }
    const fade = stageOpacity(progress, 0.34, 0.58, 0.08);
    if (brainMatRef.current) brainMatRef.current.opacity = fade;
    if (wireRef.current) wireRef.current.material.opacity = fade * 0.35;
    if (pointsMatRef.current) {
      const t = performance.now() * 0.001;
      pointsMatRef.current.opacity = fade * (0.55 + 0.35 * Math.sin(t * 1.5));
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.2, 0]}>
      <mesh geometry={brainGeom}>
        <meshStandardMaterial
          ref={brainMatRef}
          color={"#1c1c22"}
          emissive={"#0a84ff"}
          emissiveIntensity={1.0}
          roughness={0.6}
          metalness={0.1}
          transparent
          opacity={0}
        />
      </mesh>
      <mesh ref={wireRef} geometry={brainGeom}>
        <meshBasicMaterial
          color={"#79b5ff"}
          wireframe
          transparent
          opacity={0}
        />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={surfacePoints.length / 3}
            array={surfacePoints}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMatRef}
          color={"#d4af37"}
          size={0.045}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
