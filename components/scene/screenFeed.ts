import * as THREE from "three";
import { Buddy } from "./buddy";

/** The buddy canvas as a three.js texture for the 3D laptop screen. */
export class ScreenFeed {
  readonly texture: THREE.CanvasTexture;
  private buddy = new Buddy();

  constructor() {
    this.texture = new THREE.CanvasTexture(this.buddy.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
  }

  draw(t: number, ui: number, mx: number, my: number) {
    this.buddy.draw(t, ui, mx, my);
    if (this.buddy.dirty) {
      this.buddy.dirty = false;
      this.texture.needsUpdate = true;
    }
  }

  dispose() {
    this.texture.dispose();
  }
}
