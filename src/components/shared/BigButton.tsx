import { ReactNode } from 'react'

interface BigButtonProps {
  icon: ReactNode
  label: string
  onClick: () => void
  color?: 'pink' | 'purple' | 'amber' | 'green' | 'red' | 'gray'
  disabled?: boolean
}

const styles: Record<string, { border: string; icon: string }> = {
  pink:   { border: 'border-l-4 border-l-pink-500',   icon: 'text-pink-500' },
  purple: { border: 'border-l-4 border-l-violet-500', icon: 'text-violet-500' },
  amber:  { border: 'border-l-4 border-l-amber-500',  icon: 'text-amber-500' },
  green:  { border: 'border-l-4 border-l-green-500',  icon: 'text-green-600' },
  red:    { border: 'border-l-4 border-l-red-500',    icon: 'text-red-500' },
  gray:   { border: 'border-l-4 border-l-gray-400',   icon: 'text-gray-500' },
}

export default function BigButton({ icon, label, onClick, color = 'pink', disabled }: BigButtonProps) {
  const s = styles[color]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-white ${s.border}
        flex flex-col items-center justify-center gap-3
        w-full rounded-2xl py-6 px-4
        text-center font-semibold text-gray-800 text-base
        shadow-sm border border-gray-100
        active:scale-95 transition-transform
        disabled:opacity-40 disabled:cursor-not-allowed
        min-h-[110px]
      `}
    >
      <span className={s.icon}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}
