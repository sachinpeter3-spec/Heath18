import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'

/** shadcn/ui-style Sheet built on Radix Dialog: bottom sheet on phones, right panel on wider screens. */
export function Sheet({ open, onOpenChange, title, subtitle, children, footer }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col border-t-[3px] border-ink bg-bg text-ink
                     sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[440px] sm:border-t-0 sm:border-l-[3px]"
        >
          <div className="flex items-start justify-between gap-3 border-b-[3px] border-ink p-4">
            <div className="min-w-0">
              <Dialog.Title className="m-0 font-display text-xl uppercase leading-tight">{title}</Dialog.Title>
              {subtitle && <div className="mt-1">{subtitle}</div>}
            </div>
            <Dialog.Close className="cap shrink-0 cursor-pointer border-2 border-ink bg-card px-2 py-1 text-ink" aria-label="Close">
              ✕
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
          {footer && <div className="flex gap-2 border-t-[3px] border-ink p-4 pb-[max(16px,env(safe-area-inset-bottom))]">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
