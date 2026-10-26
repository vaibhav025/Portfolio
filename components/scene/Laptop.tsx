"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "./sceneState";
import { ScreenFeed } from "./screenFeed";

/* ---------- tweakables ---------- */
export const LAPTOP = {
  baseW: 3.3,
  baseD: 2.3,
  baseH: 0.11,
  lidD: 2.18,
  lidT: 0.055,
  screenW: 3.02,
  screenH: 1.8875, // 16:10
  openAngle: THREE.MathUtils.degToRad(106),
  aluminium: "#2b2b30",
  accent: "#ff4d1f",
};
const FOLLOW = 3.2; // how fast the laptop glides to its scroll pose (higher = snappier)
const LID_SPEED = 0.62; // lid opening, fraction per second (~1.6 s)
const CAM = new THREE.Vector3(0, 1.05, 9.2); // resting camera
const LOOK = new THREE.Vector3(0, 0.35, 0);

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const expoInOut = (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

// scratch objects reused every frame (no per-frame allocation)
const vScreen = new THREE.Vector3();
const vNormal = new THREE.Vector3();
const vUp = new THREE.Vector3();
const vCover = new THREE.Vector3();
const vPos = new THREE.Vector3();
const vLook = new THREE.Vector3();
const vCamUp = new THREE.Vector3();
const qScreen = new THREE.Quaternion();
const WORLD_UP = new THREE.Vector3(0, 1, 0);

export function Laptop() {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const screen = useRef<THREE.Mesh>(null);
  const keys = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.PointLight>(null);
  const screenMat = useRef<THREE.MeshBasicMaterial>(null);
  const { camera, size } = useThree();
  // current (eased) pose; starts at the hero pose
  const pose = useRef({ ...sceneState.target });
  const lidOpen = useRef(0);

  // a little animated editor buddy lives on the screen
  const feed = useMemo(() => (typeof document === "undefined" ? null : new ScreenFeed()), []);
  useLayoutEffect(() => () => feed?.dispose(), [feed]);

  const KEY_COLS = 14;
  const KEY_ROWS = 6;

  // lay out the keyboard once
  useLayoutEffect(() => {
    const m = keys.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const pitch = 0.205;
    let n = 0;
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let c = 0; c < KEY_COLS; c++) {
        o.position.set((c - (KEY_COLS - 1) / 2) * pitch, LAPTOP.baseH + 0.004, -0.98 + r * pitch);
        // the space bar: stretch one key across the middle of the last row
        if (r === KEY_ROWS - 1 && c >= 4 && c <= 9) {
          if (c !== 4) o.scale.set(0.0001, 0.0001, 0.0001);
          else {
            o.position.x = 0;
            o.scale.set(6.0, 1, 1);
          }
        } else o.scale.set(1, 1, 1);
        o.updateMatrix();
        m.setMatrixAt(n++, o.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    const l = lid.current;
    const s = screen.current;
    if (!g || !l || !s) return;
    const dt = Math.min(delta, 1 / 20);
    const t = state.clock.elapsedTime;
    const P = pose.current;
    const T = sceneState.target;

    // glide toward the scroll pose (frame-rate independent exponential ease)
    const k = 1 - Math.exp(-FOLLOW * dt);
    P.x += (T.x - P.x) * k;
    P.y += (T.y - P.y) * k;
    P.s += (T.s - P.s) * k;
    P.ry += (T.ry - P.ry) * k;
    P.rx += (T.rx - P.rx) * k;
    P.dive += (T.dive - P.dive) * k;
    P.lid += (T.lid - P.lid) * k;
    sceneState.diveNow = P.dive;

    // lid: opens once (Play / first scroll), on its own clock
    if (sceneState.opened) lidOpen.current = Math.min(1, lidOpen.current + dt * LID_SPEED);
    const lidP = easeInOut(lidOpen.current) * P.lid;
    l.rotation.x = -LAPTOP.openAngle * lidP;

    const diveE = expoInOut(Math.min(1, Math.max(0, P.dive)));
    const calm = 1 - diveE; // idle float + parallax fade out while inside the screen

    g.position.set(P.x * calm, P.y * calm + Math.sin(t * 0.9) * 0.06 * calm, 0);
    g.scale.setScalar(P.s);
    g.rotation.set(
      P.rx * calm + sceneState.mouseY * 0.08 * calm,
      P.ry * calm + sceneState.mouseX * 0.25 * calm,
      0,
    );

    // screen backlight follows the lid, light spills onto the keyboard
    const power = Math.min(1, Math.max(0, (lidP - 0.45) / 0.45));
    if (screenMat.current) screenMat.current.color.setScalar(0.04 + power * 0.96);
    // the buddy fades out while the camera is inside the screen (Work section sits on it)
    if (feed && power > 0.02) feed.draw(t, power * Math.max(0, 1 - diveE * 1.6), sceneState.mouseX, sceneState.mouseY);
    if (glow.current) glow.current.intensity = power * 5.5;

    // camera: resting view, or inside the screen (cover pose) as dive -> 1
    const cam = camera as THREE.PerspectiveCamera;
    vPos.copy(CAM);
    vLook.copy(LOOK);
    vCamUp.copy(WORLD_UP);
    if (diveE > 0.0001) {
      g.updateMatrixWorld(true);
      s.getWorldPosition(vScreen);
      s.getWorldQuaternion(qScreen);
      vNormal.set(0, 0, 1).applyQuaternion(qScreen);
      vUp.set(0, 1, 0).applyQuaternion(qScreen);
      const aspect = size.width / Math.max(1, size.height);
      const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
      // distance at which the screen just covers the viewport in both axes
      const d = Math.min((LAPTOP.screenH * P.s) / (2 * tanH), (LAPTOP.screenW * P.s) / (2 * tanH * aspect)) * 0.96;
      vCover.copy(vScreen).addScaledVector(vNormal, d);
      vPos.lerp(vCover, diveE);
      vLook.lerp(vScreen, diveE);
      vCamUp.lerp(vUp, diveE).normalize();
    }
    cam.position.copy(vPos);
    cam.up.copy(vCamUp);
    cam.lookAt(vLook);
  });

  const alu = (
    <meshStandardMaterial color={LAPTOP.aluminium} metalness={0.92} roughness={0.34} />
  );

  return (
    <group ref={group}>
      {/* base */}
      <RoundedBox args={[LAPTOP.baseW, LAPTOP.baseH, LAPTOP.baseD]} radius={0.05} smoothness={4} position={[0, LAPTOP.baseH / 2, 0]}>
        {alu}
      </RoundedBox>
      {/* keyboard well */}
      <mesh position={[0, LAPTOP.baseH + 0.001, -0.47]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 1.32]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.8} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, KEY_COLS * KEY_ROWS]}>
        <boxGeometry args={[0.172, 0.012, 0.172]} />
        <meshStandardMaterial color="#111114" roughness={0.55} metalness={0.1} />
      </instancedMesh>
      {/* trackpad */}
      <mesh position={[0, LAPTOP.baseH + 0.0015, 0.66]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.3, 0.72]} />
        <meshStandardMaterial color="#323238" metalness={0.7} roughness={0.22} />
      </mesh>

      {/* lid, pivoting on the hinge at the back edge */}
      <group ref={lid} position={[0, LAPTOP.baseH + 0.012, -LAPTOP.baseD / 2 + 0.06]}>
        <RoundedBox
          args={[LAPTOP.baseW, LAPTOP.lidT, LAPTOP.lidD]}
          radius={0.025}
          smoothness={4}
          position={[0, LAPTOP.lidT / 2 + 0.006, LAPTOP.lidD / 2]}
        >
          {alu}
        </RoundedBox>
        {/* REC mark on the back of the lid (original, not a brand) */}
        <mesh position={[0, LAPTOP.lidT + 0.0075, LAPTOP.lidD / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.09, 40]} />
          <meshStandardMaterial color={LAPTOP.accent} emissive={LAPTOP.accent} emissiveIntensity={0.6} roughness={0.3} />
        </mesh>
        {/* glossy bezel */}
        <mesh position={[0, 0.005, LAPTOP.lidD / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[LAPTOP.baseW - 0.08, LAPTOP.lidD - 0.08]} />
          <meshStandardMaterial color="#040405" roughness={0.12} metalness={0.2} />
        </mesh>
        {/* display: faces the keyboard when closed, the viewer when open */}
        <mesh ref={screen} position={[0, 0.001, LAPTOP.lidD / 2 + 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[LAPTOP.screenW, LAPTOP.screenH]} />
          <meshBasicMaterial ref={screenMat} map={feed?.texture ?? null} toneMapped={false} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
        <pointLight ref={glow} position={[0, -0.6, LAPTOP.lidD / 2]} color="#ffd9c7" distance={4.5} decay={1.6} intensity={0} />
      </group>
    </group>
  );
}
