/**
 * A 24-spoke Ashoka-style wheel drawn in SVG.
 *
 * This is a decorative civic motif, not the State Emblem, so it is safe to use
 * as a low-opacity watermark in headers and hero panels.
 */
export function SovereignChakra({
  className = "",
  stroke = "currentColor",
}: {
  className?: string;
  stroke?: string;
}) {
  const spokes = Array.from({ length: 24 }, (_, index) => (index * 360) / 24);
  const round = (value: number) => Math.round(value * 1000) / 1000;

  return (
    <svg
      viewBox="0 0 200 200"
      role="presentation"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth="1.4"
    >
      <circle cx="100" cy="100" r="96" />
      <circle cx="100" cy="100" r="87" />
      <circle cx="100" cy="100" r="15" />
      <circle cx="100" cy="100" r="6" fill={stroke} stroke="none" />
      {spokes.map((angle) => (
        <line
          key={angle}
          x1="100"
          y1="100"
          x2={round(100 + 86 * Math.cos((angle * Math.PI) / 180))}
          y2={round(100 + 86 * Math.sin((angle * Math.PI) / 180))}
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
