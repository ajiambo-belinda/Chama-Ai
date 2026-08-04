export default function ContributionRing({
  percent = 0,
  size = 44,
  strokeWidth = 4,
  label,
  sublabel,
  tone = 'primary', // primary | success | warning | danger
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference

  const toneColor = {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
  }[tone]

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={toneColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[10px] font-medium text-text">{Math.round(percent)}%</span>
        </div>
      </div>
      {label && (
        <div>
          <p className="text-sm font-medium text-text">{label}</p>
          {sublabel && <p className="text-xs text-text-muted">{sublabel}</p>}
        </div>
      )}
    </div>
  )
}