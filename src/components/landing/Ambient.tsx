// Fixed gradient backdrop behind everything, with soft blobs that drift at
// different speeds as the page scrolls (see data-depth in useScrollFx).
export default function Ambient() {
  return (
    <div className="landing-bg" aria-hidden>
      <span className="depth-blob depth-blob-1" data-depth="0.5" />
      <span className="depth-blob depth-blob-2" data-depth="1.1" />
      <span className="depth-blob depth-blob-3" data-depth="0.8" />
    </div>
  );
}
