import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HERO_DOMAINS, type HeroDomainKey } from "./hero-domains";

// Canvas colours mirror the design tokens (WebGL cannot read CSS variables).

const MINT = new THREE.Color("#83B8AD");
const GOLD = new THREE.Color("#D8B477");
const TEAL = new THREE.Color("#83B8AD");
const WHITE = new THREE.Color("#F4F6F5");
const METAL = new THREE.Color("#A7B6BF");

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function useTint(active: boolean, ref: React.RefObject<THREE.Group | null>) {
  useFrame((_, d) => {
    const g = ref.current;
    if (!g) return;
    const t = active ? 1.18 : 1;
    g.scale.lerp(new THREE.Vector3(t, t, t), 1 - Math.exp(-6 * Math.min(d, 0.05)));
  });
}

function pointsMat(color: THREE.Color, size: number, opacity: number) {
  return new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function ImmuneCell({ active, dim }: { active: boolean; dim: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useTint(active, ref);
  const { surface, spikes } = useMemo(() => {
    const r = rng(7),
      n = 1400,
      pts: number[] = [],
      sp: number[] = [];
    for (let i = 0; i < n; i++) {
      const u = r() * 2 - 1,
        th = r() * Math.PI * 2,
        s = Math.sqrt(1 - u * u);
      const rad = 0.9 + Math.sin(th * 5 + u * 7) * 0.04;
      pts.push(s * Math.cos(th) * rad, u * rad, s * Math.sin(th) * rad);
      if (i % 22 === 0)
        sp.push(
          s * Math.cos(th) * rad,
          u * rad,
          s * Math.sin(th) * rad,
          s * Math.cos(th) * 1.25,
          u * 1.25,
          s * Math.sin(th) * 1.25,
        );
    }
    const a = new THREE.BufferGeometry();
    a.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const b = new THREE.BufferGeometry();
    b.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    return { surface: a, spikes: b };
  }, []);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += Math.min(d, 0.05) * 0.25;
  });
  const o = dim ? 0.25 : 1;
  return (
    <group ref={ref} position={[-3.1, 1.1, -0.5]}>
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={GOLD}
          emissiveIntensity={0.35 * o}
          roughness={0.5}
          transparent
          opacity={0.85 * o}
        />
      </mesh>
      <points geometry={surface} material={pointsMat(WHITE, 0.022, 0.75 * o)} />
      <lineSegments geometry={spikes}>
        <lineBasicMaterial color={GOLD} transparent opacity={0.7 * o} />
      </lineSegments>
    </group>
  );
}

function Neuron({ active, dim }: { active: boolean; dim: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useTint(active, ref);
  const geo = useMemo(() => {
    const r = rng(11),
      segs: number[] = [];
    const grow = (
      x: number,
      y: number,
      z: number,
      dx: number,
      dy: number,
      dz: number,
      len: number,
      depth: number,
    ) => {
      const nx = x + dx * len,
        ny = y + dy * len,
        nz = z + dz * len;
      segs.push(x, y, z, nx, ny, nz);
      if (depth <= 0) return;
      for (let k = 0; k < 2; k++) {
        const v = new THREE.Vector3(
          dx + (r() - 0.5) * 1.1,
          dy + (r() - 0.5) * 1.1,
          dz + (r() - 0.5) * 1.1,
        ).normalize();
        grow(nx, ny, nz, v.x, v.y, v.z, len * 0.72, depth - 1);
      }
    };
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      grow(0, 0, 0, Math.cos(a), Math.sin(a) * 0.8, (r() - 0.5) * 0.6, 0.55, 4);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    return g;
  }, []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.3) * 0.15;
  });
  const o = dim ? 0.2 : 1;
  return (
    <group ref={ref} position={[3.2, 1.0, -1]}>
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={0.8 * o} />
      </mesh>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={TEAL} transparent opacity={0.65 * o} />
      </lineSegments>
    </group>
  );
}

function Helix({ active, dim }: { active: boolean; dim: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useTint(active, ref);
  const { a, b, rungs } = useMemo(() => {
    const A: number[] = [],
      B: number[] = [],
      R: number[] = [];
    for (let i = 0; i < 260; i++) {
      const t = i / 260,
        ang = t * Math.PI * 7,
        y = (t - 0.5) * 3.6;
      const ax = Math.cos(ang) * 0.42,
        az = Math.sin(ang) * 0.42;
      A.push(ax, y, az);
      B.push(-ax, y, -az);
      if (i % 9 === 0) R.push(ax, y, az, -ax, y, -az);
    }
    const mk = (v: number[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
      return g;
    };
    return { a: mk(A), b: mk(B), rungs: mk(R) };
  }, []);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += Math.min(d, 0.05) * 0.4;
  });
  const o = dim ? 0.25 : 1;
  return (
    <group ref={ref} position={[0, -0.1, 0.4]} rotation={[0, 0, 0.35]}>
      <points geometry={a} material={pointsMat(WHITE, 0.05, 0.95 * o)} />
      <points geometry={b} material={pointsMat(MINT, 0.05, 0.95 * o)} />
      <lineSegments geometry={rungs}>
        <lineBasicMaterial color={METAL} transparent opacity={0.5 * o} />
      </lineSegments>
    </group>
  );
}

function Microbiome({ active, dim }: { active: boolean; dim: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useTint(active, ref);
  const items = useMemo(() => {
    const r = rng(23);
    return Array.from({ length: 26 }, () => ({
      p: [(r() - 0.5) * 1.8, (r() - 0.5) * 1.1, (r() - 0.5) * 1.2] as [number, number, number],
      rot: [r() * 3, r() * 3, r() * 3] as [number, number, number],
      s: 0.5 + r() * 0.6,
    }));
  }, []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.08;
  });
  const o = dim ? 0.25 : 1;
  return (
    <group ref={ref} position={[-2.6, -1.7, 0.6]}>
      {items.map((m, i) => (
        <mesh key={i} position={m.p} rotation={m.rot} scale={m.s}>
          <capsuleGeometry args={[0.07, 0.22, 4, 10]} />
          <meshStandardMaterial
            color={i % 4 === 0 ? GOLD : TEAL}
            emissive={i % 4 === 0 ? GOLD : TEAL}
            emissiveIntensity={0.3 * o}
            roughness={0.4}
            transparent
            opacity={o}
          />
        </mesh>
      ))}
    </group>
  );
}

function Tissue({ active, dim }: { active: boolean; dim: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useTint(active, ref);
  const geo = useMemo(() => {
    const segs: number[] = [];
    for (let q = -3; q <= 3; q++)
      for (let r = -3; r <= 3; r++) {
        if (Math.abs(q + r) > 3) continue;
        const cx = (q + r / 2) * 0.32,
          cy = r * 0.28,
          cz = Math.sin(q * 0.9 + r) * 0.08;
        for (let k = 0; k < 6; k++) {
          const a1 = (k / 6) * Math.PI * 2 + Math.PI / 6,
            a2 = ((k + 1) / 6) * Math.PI * 2 + Math.PI / 6;
          segs.push(
            cx + Math.cos(a1) * 0.17,
            cy + Math.sin(a1) * 0.17,
            cz,
            cx + Math.cos(a2) * 0.17,
            cy + Math.sin(a2) * 0.17,
            cz,
          );
        }
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    return g;
  }, []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.x = -0.6 + Math.sin(clock.elapsedTime * 0.25) * 0.12;
  });
  const o = dim ? 0.2 : 1;
  return (
    <group ref={ref} position={[2.8, -1.6, 0.3]}>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={WHITE} transparent opacity={0.55 * o} />
      </lineSegments>
    </group>
  );
}

function Signals({ focus }: { focus: HeroDomainKey | null }) {
  const curves = useMemo(() => {
    const c = HERO_DOMAINS.map((d) => new THREE.Vector3(...d.pos));
    const pairs: [number, number][] = [
      [3, 0],
      [0, 2],
      [2, 1],
      [3, 2],
      [4, 2],
      [0, 1],
      [4, 1],
    ];
    return pairs.map(([a, b]) => {
      const pa = c[a]!,
        pb = c[b]!;
      const mid = pa
        .clone()
        .add(pb)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, 0, 1.2));
      return { a, b, curve: new THREE.QuadraticBezierCurve3(pa, mid, pb) };
    });
  }, []);
  const dots = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    curves.forEach((c, i) => {
      const m = dots.current[i];
      if (m) m.position.copy(c.curve.getPoint((clock.elapsedTime * 0.18 + i * 0.17) % 1));
    });
  });
  return (
    <>
      {curves.map((c, i) => {
        const on = !focus || HERO_DOMAINS[c.a]!.key === focus || HERO_DOMAINS[c.b]!.key === focus;
        const g = new THREE.BufferGeometry().setFromPoints(c.curve.getPoints(48));
        return (
          <group key={i}>
            <line>
              <primitive object={g} attach="geometry" />
              <lineBasicMaterial color={on ? MINT : METAL} transparent opacity={on ? 0.55 : 0.12} />
            </line>
            <mesh
              ref={(el) => {
                dots.current[i] = el;
              }}
            >
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color={on ? WHITE : METAL} transparent opacity={on ? 1 : 0.3} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function Rig() {
  useFrame(({ camera, pointer }, d) => {
    const k = 1 - Math.exp(-2.5 * Math.min(d, 0.05));
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * k;
    camera.position.y += (pointer.y * 0.5 - camera.position.y) * k;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Dust() {
  const geo = useMemo(() => {
    const r = rng(99),
      v: number[] = [];
    for (let i = 0; i < 600; i++) v.push((r() - 0.5) * 16, (r() - 0.5) * 9, (r() - 0.5) * 8 - 2);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, []);
  return <points geometry={geo} material={pointsMat(METAL, 0.018, 0.5)} />;
}

export default function HeroScene({
  focus,
  onFocus,
}: {
  focus: HeroDomainKey | null;
  onFocus: (k: HeroDomainKey | null) => void;
}) {
  const p = (k: HeroDomainKey) => ({ active: focus === k, dim: focus !== null && focus !== k });
  const hit = (k: HeroDomainKey) => ({
    onPointerOver: () => onFocus(k),
    onPointerOut: () => onFocus(null),
  });
  return (
    <Canvas
      camera={{ position: [0, 0, 7.2], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) =>
        gl.domElement.parentElement?.parentElement?.setAttribute("data-scene-ready", "true")
      }
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 4, 5]} intensity={40} color="#F4F6F5" />
      <pointLight position={[-5, -2, 3]} intensity={25} color="#83B8AD" />
      <Rig />
      <Dust />
      <Signals focus={focus} />
      <group {...hit("immune")}>
        <ImmuneCell {...p("immune")} />
      </group>
      <group {...hit("neural")}>
        <Neuron {...p("neural")} />
      </group>
      <group {...hit("genome")}>
        <Helix {...p("genome")} />
      </group>
      <group {...hit("microbiome")}>
        <Microbiome {...p("microbiome")} />
      </group>
      <group {...hit("tissue")}>
        <Tissue {...p("tissue")} />
      </group>
    </Canvas>
  );
}
