type PayconLogoProps = {
  className?: string;
  height?: number;
};

/**
 * Wordmark em SVG com as cores extraídas do arquivo oficial (ver tokens.css).
 * "PAY" em azul institucional, "CON" em cinza.
 *
 * O texto começa em x=3 (não em 0) e o viewBox tem folga à direita: encostado
 * na borda, o "P" podia perder um fio de antialiasing na renderização.
 */
export function PayconLogo({ className, height = 22 }: PayconLogoProps) {
  return (
    <svg
      viewBox="0 0 140 28"
      height={height}
      width={(140 / 28) * height}
      className={className}
      role="img"
      aria-label="Paycon"
    >
      <text
        x="3"
        y="21"
        fontFamily="Inter, Helvetica Neue, Arial, sans-serif"
        fontWeight="700"
        fontSize="24"
        letterSpacing="0.5"
      >
        <tspan fill="var(--paycon-blue-300)">PAY</tspan>
        <tspan fill="var(--paycon-gray-400)">CON</tspan>
      </text>
    </svg>
  );
}
