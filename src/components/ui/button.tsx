import type { ButtonHTMLAttributes } from 'react'

type Variant = 'solid' | 'outline' | 'yellow'
const STYLE: Record<Variant, string> = {
  solid: 'bg-ink text-bg',
  outline: 'bg-card text-ink',
  yellow: 'bg-yellow text-black',
}

export function Button({ variant = 'outline', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...p}
      className={`cap cursor-pointer border-2 border-ink px-3 py-2 disabled:cursor-default disabled:opacity-40 ${STYLE[variant]} ${className}`}
    />
  )
}
