import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function webglAvailable() {
  try {
    if (typeof document === "undefined") return false;
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function HouseMesh({ accent = "#c45c26" }) {
  return (
    <group position={[0, 0.15, 0]}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.1, 1.4]} />
        <meshStandardMaterial color="#f4efe6" roughness={0.62} />
      </mesh>
      <mesh position={[0, 1.28, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.45, 0.7, 4]} />
        <meshStandardMaterial color={accent} roughness={0.45} />
      </mesh>
      <mesh position={[0.55, 0.42, 0.71]}>
        <boxGeometry args={[0.28, 0.38, 0.04]} />
        <meshStandardMaterial color="#7eb6d9" metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[-0.35, 0.22, 0.71]}>
        <boxGeometry args={[0.32, 0.62, 0.05]} />
        <meshStandardMaterial color="#6b4f3a" roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#d7e4c7" />
      </mesh>
    </group>
  );
}

function Scene({ accent }) {
  return (
    <>
      <color attach="background" args={["#eef4fb"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 8, 3]} intensity={1.15} castShadow />
      <HouseMesh accent={accent} />
      <OrbitControls enablePan={false} minDistance={3} maxDistance={10} maxPolarAngle={Math.PI / 2.05} />
    </>
  );
}

function FallbackHouse({ address }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-emerald-50 text-center px-4">
      <div className="w-28 h-20 bg-stone-100 border-2 border-stone-400 relative">
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "64px solid transparent",
            borderRight: "64px solid transparent",
            borderBottom: "36px solid #c45c26",
          }}
        />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        3D canvas fallback (WebGL unavailable). {address || "Set a GPS location to label this preview."}
      </p>
    </div>
  );
}

export default function Studio3DViewer({ latitude, longitude, address, loading }) {
  const canRender3d = useMemo(() => webglAvailable(), []);
  const accent = address ? "#c45c26" : "#64748b";
  const label = loading
    ? "Resolving site…"
    : address
      ? address
      : latitude != null && longitude != null
        ? `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`
        : "3D home preview — use GPS to pin this site";

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">3D preview</p>
        <p className="text-sm font-medium mt-1 line-clamp-2">{label}</p>
      </div>
      <div className="h-[360px] w-full bg-slate-100">
        {canRender3d ? (
          <Suspense fallback={<div className="h-full grid place-items-center text-sm text-muted-foreground">Loading 3D…</div>}>
            <Canvas shadows camera={{ position: [3.2, 2.4, 3.6], fov: 45 }} gl={{ antialias: true }}>
              <Scene accent={accent} />
            </Canvas>
          </Suspense>
        ) : (
          <FallbackHouse address={address} />
        )}
      </div>
    </div>
  );
}
