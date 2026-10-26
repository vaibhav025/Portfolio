"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Laptop } from "./Laptop";
import { bindGate } from "./sceneState";

/** Stops/starts the R3F loop when the DOM desktop fully covers the canvas. */
function FrameGate() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    bindGate((on) => setFrameloop(on ? "always" : "never"));
    return () => bindGate(null);
  }, [setFrameloop]);
  return null;
}

/** Fires once the first frame has actually been drawn. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(onReady);
    });
    return () => cancelAnimationFrame(raf);
  }, [gl, onReady]);
  return null;
}

export default function LaptopScene({ onReady }: { onReady: () => void }) {
  return (
    <Canvas
      className="scene-canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      camera={{ fov: 32, near: 0.01, far: 60, position: [0, 2.35, 7.4] }}
      aria-hidden="true"
    >
      <fog attach="fog" args={["#0b0b0d", 9, 22]} />

      {/* soft studio lighting */}
      <ambientLight intensity={0.08} />
      <spotLight position={[-4, 7, 4]} angle={0.5} penumbra={1} intensity={60} color="#fff3e6" />
      <spotLight position={[5, 3, -5]} angle={0.6} penumbra={1} intensity={45} color="#ff6a3a" />
      <directionalLight position={[0, 4, 6]} intensity={0.35} />

      {/* reflections from procedural light panels: no HDR download */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, -2]} scale={[10, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.4} color="#ff4d1f" position={[6, 1, 0]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={1} color="#7fc6d6" position={[-6, 1, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="ring" intensity={0.8} position={[0, 2, 6]} scale={3} />
      </Environment>

      <Laptop />
      <ContactShadows position={[0, -0.42, 0]} opacity={0.65} scale={9} blur={2.6} far={2.2} resolution={512} color="#000000" />

      <FrameGate />
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}
