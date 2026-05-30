import type { ReactNode } from 'react'

interface BigButtonProps {
  icon: ReactNode
  label: string
  onClick: () => void
  color?: 'pink' | 'purple' | 'amber' | 'green' | 'red' | 'gray'
  disabled?: boolean
}

const styles: Record<string, { iconBg: string; iconColor: string; accent: string }> = {
  pink:   { iconBg: 'bg-carmen-100',  iconColor: 'text-carmen-600', accent: 'bg-carmen-500' },
  purple: { iconBg: 'bg-salon-100',   iconColor: 'text-salon-600',  accent: 'bg-salon-500' },
  amber:  { iconBg: 'bg-store-100',   iconColor: 'text-store-600',  accent: 'bg-store-500' },
  green:  { iconBg: 'bg-green-100',   iconColor: 'text-green-700',  accent: 'bg-green-500' },
  red:    { iconBg: 'bg-red-100',     iconColor: 'text-red-600',    accent: 'bg-red-500' },
  gray:   { iconBg: 'bg-gray-100',    iconColor: 'text-gray-600',   accent: 'bg-gray-400' },
}

export default function BigButton({ icon, label, onClick, color = 'pink', disabled }: BigButtonProps) {
  const s = styles[color]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        relative bg-white rounded-2xl overflow-hidden
        flex flex-col items-center justify-center gap-3
        w-full py-6 px-4 text-center
        shadow-sm border border-gray-200
        active:scale-95 active:shadow-none
        transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        min-h-[110px]
        group
      "
    >
      {/* Accent dot top-right */}
      <span className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${s.accent} opacity-60`} />

      {/* Icon container */}
      <span className={`w-14 h-14 ${s.iconBg} rounded-2xl flex items-center justify-center ${s.iconColor} transition-transform group-active:scale-95`}>
        {icon}
      </span>

      {/* Label */}
      <span className="font-semibold text-gray-800 text-sm text-center leading-tight">{label}</span>
    </button>
  )
}
