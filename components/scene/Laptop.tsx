"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "./sceneState";

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

/** camera keyframes: hero (closed), lid open, then computed "cover" pose inside the screen */
const CAM_HERO = new THREE.Vector3(0, 2.35, 7.4);
const CAM_OPEN = new THREE.Vector3(0, 1.55, 5.5);
const LOOK_HERO = new THREE.Vector3(0, 0.3, 0);

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // power3.inOut
const expoInOut = (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

// scratch objects, reused every frame (no per-frame allocation)
const vScreen = new THREE.Vector3();
const vNormal = new THREE.Vector3();
const vUp = new THREE.Vector3();
const vCover = new THREE.Vector3();
const vPos = new THREE.Vector3();
const vLook = new THREE.Vector3();
const vCamUp = new THREE.Vector3();
const qScreen = new THREE.Quaternion();
const WORLD_UP = new THREE.Vector3(0, 1, 0);

/** Wallpaper painted to a canvas so the 3D screen matches the DOM desktop pixel-for-pixel in tone. */
function makeWallpaper() {
  const c = document.createElement("canvas");
  c.width = 1280;
  c.height = 800;
  const g = c.getContext("2d")!;
  const lin = g.createLinearGradient(0, 0, c.width * 0.55, c.height);
  lin.addColorStop(0, "#17161a");
  lin.addColorStop(0.55, "#0c0c0f");
  lin.addColorStop(1, "#09090b");
  g.fillStyle = lin;
  g.fillRect(0, 0, c.width, c.height);
  const blob = (x: number, y: number, r: number, color: string) => {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, color);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, c.width, c.height);
  };
  blob(c.width * 0.78, c.height * 0.08, c.width * 0.62, "rgba(255,77,31,0.30)");
  blob(c.width * 0.08, c.height * 1.0, c.width * 0.55, "rgba(40,90,110,0.34)");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function Laptop() {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const screen = useRef<THREE.Mesh>(null);
  const keys = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.PointLight>(null);
  const screenMat = useRef<THREE.MeshBasicMaterial>(null);
  const { camera, size } = useThree();

  const wallpaper = useMemo(() => (typeof document === "undefined" ? null : makeWallpaper()), []);

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
        // the space bar: stretch the middle of the last row
        if (r === KEY_ROWS - 1 && c >= 4 && c <= 9) {
          if (c !== 4) {
            o.scale.set(0.0001, 0.0001, 0.0001);
          } else {
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

  useLayoutEffect(() => () => wallpaper?.dispose(), [wallpaper]);

  useFrame((state) => {
    const g = group.current;
    const l = lid.current;
    const s = screen.current;
    if (!g || !l || !s) return;
    const t = state.clock.elapsedTime;
    const { lid: lidP, dive, power, mouseX, mouseY } = sceneState;
    const calm = 1 - expoInOut(Math.min(1, dive * 1.2)); // idle motion fades out during the dive

    // idle float + mouse parallax
    g.position.y = Math.sin(t * 0.9) * 0.05 * calm;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, (mouseX * 0.22 - 0.05) * calm, 0.06);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, mouseY * 0.06 * calm, 0.06);

    // lid hinge (scrubbed)
    l.rotation.x = -LAPTOP.openAngle * ease(lidP);

    // screen backlight + light spill onto the keyboard
    if (screenMat.current) screenMat.current.color.setScalar(0.04 + power * 0.96);
    if (glow.current) glow.current.intensity = power * 5.5;

    // ---- camera: hero -> open -> inside the screen ----
    g.updateMatrixWorld(true);
    s.getWorldPosition(vScreen);
    s.getWorldQuaternion(qScreen);
    vNormal.set(0, 0, 1).applyQuaternion(qScreen); // plane faces +z locally
    vUp.set(0, 1, 0).applyQuaternion(qScreen);

    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    // distance at which the screen just covers the viewport in both axes
    const d = Math.min(LAPTOP.screenH / (2 * tanH), LAPTOP.screenW / (2 * tanH * aspect)) * 0.965;
    vCover.copy(vScreen).addScaledVector(vNormal, d);

    const lidE = ease(lidP);
    const diveE = expoInOut(dive);
    vPos.lerpVectors(CAM_HERO, CAM_OPEN, lidE).lerp(vCover, diveE);
    vLook.lerpVectors(LOOK_HERO, vScreen, Math.min(1, lidE * 0.8 + diveE));
    vCamUp.copy(WORLD_UP).lerp(vUp, diveE).normalize();

    cam.position.copy(vPos);
    cam.up.copy(vCamUp);
    cam.lookAt(vLook);
  });

  const alu = (
    <meshPhysicalMaterial color={LAPTOP.aluminium} metalness={0.92} roughness={0.34} clearcoat={0.35} clearcoatRoughness={0.4} />
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
        <meshPhysicalMaterial color="#323238" metalness={0.7} roughness={0.22} clearcoat={0.6} />
      </mesh>
      {/* front notch */}
      <mesh position={[0, LAPTOP.baseH - 0.02, LAPTOP.baseD / 2 + 0.001]}>
        <planeGeometry args={[0.5, 0.03]} />
        <meshBasicMaterial color="#101012" />
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
        <mesh position={[0, 0.004, LAPTOP.lidD / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[LAPTOP.baseW - 0.08, LAPTOP.lidD - 0.08]} />
          <meshPhysicalMaterial color="#040405" roughness={0.12} metalness={0.2} clearcoat={1} />
        </mesh>
        {/* display: faces +z after the x-rotation, i.e. towards the keyboard / viewer */}
        <mesh ref={screen} position={[0, 0.0032, LAPTOP.lidD / 2 + 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[LAPTOP.screenW, LAPTOP.screenH]} />
          <meshBasicMaterial ref={screenMat} map={wallpaper} toneMapped={false} side={THREE.FrontSide} />
        </mesh>
        <pointLight ref={glow} position={[0, -0.6, LAPTOP.lidD / 2]} color="#ffd9c7" distance={4.5} decay={1.6} intensity={0} />
      </group>
    </group>
  );
}
