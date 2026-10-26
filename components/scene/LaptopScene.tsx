"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { setConsoleFunction } from "three";
import { Laptop } from "./Laptop";

/*
 * R3F 9.x still creates a THREE.Clock internally, which three r183+ flags as
 * deprecated on every load. Drop only that one message; everything else from
 * three.js is passed through unchanged. Remove once R3F switches to THREE.Timer.
 */
setConsoleFunction((type: "log" | "warn" | "error", message: string, ...params: unknown[]) => {
  if (type === "warn" && message.startsWith("THREE.Clock: This module has been deprecated")) return;
  console[type](message, ...params);
});

/** Pause rendering while the tab is hidden (rAF already stops; this also skips the resume burst). */
function VisibilityGate() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    const on = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, [setFrameloop]);
  return null;
}

/** Fires once the first frame has been drawn, so the canvas can fade in. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(onReady);
    });
    return () => cancelAnimationFrame(raf);
  }, [onReady]);
  return null;
}

export default function LaptopScene({ onReady, videoSrc }: { onReady: () => void; videoSrc?: string }) {
  return (
    <Canvas
      className="scene-canvas"
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      camera={{ fov: 32, near: 0.01, far: 60, position: [0, 1.05, 9.2] }}
      aria-hidden="true"
    >
      <fog attach="fog" args={["#0b0b0d", 11, 24]} />
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

      <Laptop videoSrc={videoSrc} />
      <VisibilityGate />
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}
