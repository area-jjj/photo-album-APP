interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
