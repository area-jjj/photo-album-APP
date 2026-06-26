interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'danger'
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-primary-light text-primary',
    danger: 'bg-red-50 text-red-500',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
