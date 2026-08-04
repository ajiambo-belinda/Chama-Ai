export default function Logo({ size = 32, showWordmark = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="17" stroke="var(--color-primary)" strokeWidth="4" />
        <path
          d="M20 3C27.4 3 33.8 7.6 36.2 14"
          stroke="var(--color-accent)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M13 21.5L17.5 26L27.5 15"
          stroke="var(--color-primary)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark && (
        <span className="font-semibold text-text tracking-tight" style={{ fontSize: size * 0.5 }}>
          Chama <span className="text-accent">AI</span>
        </span>
      )}
    </div>
  )
}