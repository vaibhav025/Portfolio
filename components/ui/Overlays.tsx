/** Film grain, vignette and safe-area frame guides. Pure CSS, pointer-events: none. */
export function Overlays({ guides = true }: { guides?: boolean }) {
  return (
    <>
      <div className="fx-vignette" aria-hidden="true" />
      <div className="fx-grain" aria-hidden="true" />
      {guides ? (
        <div className="fx-guides" aria-hidden="true">
          <i className="tl" />
          <i className="tr" />
          <i className="bl" />
          <i className="br" />
          <span className="fx-guides-k">Title safe · 90%</span>
        </div>
      ) : null}
    </>
  );
}
