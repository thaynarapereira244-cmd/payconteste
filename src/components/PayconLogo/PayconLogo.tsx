type PayconLogoProps = {
  className?: string;
  height?: number;
};

/**
 * Wordmark recriado em SVG a partir das cores extraídas do arquivo de logo
 * oficial (ver tokens.css). "PAY" em azul institucional, "CON" em cinza.
 */
export function PayconLogo({ className, height = 22 }: PayconLogoProps) {
  return (
    <svg
      viewBox="0 0 132 28"
      height={height}
      width={(132 / 28) * height}
      className={className}
      role="img"
      aria-label="Paycon"
    >
      <text
        x="0"
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
