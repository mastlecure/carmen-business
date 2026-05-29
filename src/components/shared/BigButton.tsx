interface BigButtonProps {
  icon: string
  label: string
  onClick: () => void
  color?: 'pink' | 'purple' | 'amber' | 'green' | 'red' | 'gray'
  disabled?: boolean
}

const colors = {
  pink:   'bg-carmen-500 hover:bg-carmen-600 text-white',
  purple: 'bg-salon-500 hover:bg-salon-600 text-white',
  amber:  'bg-store-500 hover:bg-store-600 text-white',
  green:  'bg-green-500 hover:bg-green-600 text-white',
  red:    'bg-red-500 hover:bg-red-600 text-white',
  gray:   'bg-gray-200 hover:bg-gray-300 text-gray-800',
}

export default function BigButton({ icon, label, onClick, color = 'pink', disabled }: BigButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${colors[color]}
        flex flex-col items-center justify-center gap-2
        w-full rounded-3xl py-6 px-4
        text-center font-bold text-lg
        shadow-md active:scale-95 transition-transform
        disabled:opacity-40 disabled:cursor-not-allowed
        min-h-[120px]
      `}
    >
      <span className="text-4xl">{icon}</span>
      <span>{label}</span>
    </button>
  )
}
