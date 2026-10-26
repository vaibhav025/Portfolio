/** Subtle film grain + vignette. Pure CSS, pointer-events: none, never blocks clicks. */
export function Overlays() {
  return (
    <>
      <div className="fx-vignette" aria-hidden="true" />
      <div className="fx-grain" aria-hidden="true" />
    </>
  );
}
