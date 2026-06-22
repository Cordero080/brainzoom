import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stageOpacity, range } from "../util";

/**
 * SpinalPathway — Stage 5: A long curved axon "highway" of the spinal cord with
 * signal pulses racing down it, ending at a neuromuscular junction flash (limb).
 */
export default function SpinalPathway({ progress }) {
  const groupRef = useRef();
  const railMatRef = useRef();
  const myelinRefs = useRef([]);
  const pulseRefs = useRef([]);
  const limbFlashRef = useRef();

  const { curve, myelinSegments } = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 26; i++) {
      const t = i / 26;
      pts.push(
        new THREE.Vector3(
          Math.sin(t * Math.PI * 1.4) * 0.7,
          5.5 - t * 12.5,
          Math.cos(t * Math.PI * 0.7) * 0.5
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(pts);

    const myelinSegments = [];
    const total = 18;
    for (let s = 0; s < total; s++) {
      const tStart = 0.02 + (s / total) * 0.94;
      const tEnd = tStart + 0.04;
      const p1 = curve.getPoint(tStart);
      const p2 = curve.getPoint(tEnd);
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
    return { curve, myelinSegments };
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const fade = stageOpacity(progress, 0.84, 1.0, 0.06);
    if (railMatRef.current) railMatRef.current.opacity = fade;
    myelinRefs.current.forEach((m) => {
      if (m) m.material.opacity = fade * 0.9;
    });

    // Three pulses racing at offset phases
    const tTime = performance.now() * 0.001;
    pulseRefs.current.forEach((p, i) => {
      if (!p) return;
      const phase = ((tTime * 0.35 + i * 0.33) % 1);
      const point = curve.getPoint(phase);
      p.position.copy(point);
      p.material.opacity = fade;
      p.scale.setScalar(0.16 + Math.sin(performance.now() * 0.01 + i) * 0.04);
    });

    // Limb activation flash near end of stage
    if (limbFlashRef.current) {
      const local = range(progress, 0.92, 1.0);
      const flash = Math.max(0, Math.sin(local * Math.PI)) ** 2;
      limbFlashRef.current.material.opacity = fade * flash;
      limbFlashRef.current.scale.setScalar(1 + flash * 2.6);
    }
  });

  const endPoint = curve.getPoint(1).toArray();

  return (
    <group ref={groupRef} position={[0, 1.5, 0]}>
      {/* Spinal axon core */}
      <mesh>
        <tubeGeometry args={[curve, 120, 0.05, 8, false]} />
        <meshStandardMaterial
          ref={railMatRef}
          color={"#0a84ff"}
          emissive={"#0a84ff"}
          emissiveIntensity={0.9}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Myelin sheath segments */}
      {myelinSegments.map((s, i) => (
        <mesh
          key={`sm-${i}`}
          ref={(el) => (myelinRefs.current[i] = el)}
          position={s.position}
          quaternion={s.quaternion}
        >
          <cylinderGeometry args={[0.13, 0.13, s.length, 14, 1, false]} />
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

      {/* Racing signal pulses */}
      {[0, 1, 2].map((i) => (
        <mesh key={`p-${i}`} ref={(el) => (pulseRefs.current[i] = el)}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial
            color={"#fff7c2"}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Limb activation flash at end of curve */}
      <mesh ref={limbFlashRef} position={endPoint}>
        <sphereGeometry args={[0.6, 24, 24]} />
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
