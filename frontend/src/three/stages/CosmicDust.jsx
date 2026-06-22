import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stageOpacity, smooth } from "../util";

/**
 * CosmicDust — Stage 0: A deep starfield. Slow rotation, drifting particles.
 */
export default function CosmicDust({ progress }) {
  const groupRef = useRef();
  const matRef = useRef();

  const { positions, sizes } = useMemo(() => {
    const count = 4500;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Distribute on a spherical shell-ish volume
      const r = THREE.MathUtils.lerp(4, 60, Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = Math.random() * 1.6 + 0.2;
    }
    return { positions, sizes };
  }, []);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.018;
      groupRef.current.rotation.x += dt * 0.005;
    }
    if (matRef.current) {
      // Slight zoom-in fade
      const stageFade = stageOpacity(progress, 0.0, 0.22, 0.08);
      matRef.current.opacity = stageFade * 0.95;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={sizes.length}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={matRef}
          color={"#f4f4f6"}
          size={0.06}
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* A few brighter "stars" */}
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
          color={"#d4af37"}
          size={0.025}
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
