import type { ReactNode } from 'react'
import { Link } from 'react-router'

interface AppShellProps {
  title: string
  subtitle?: string
  backTo?: string
  action?: ReactNode
  children: ReactNode
}

export function AppShell({
  title,
  subtitle,
  backTo,
  action,
  children,
}: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col bg-slate-50 shadow-xl shadow-slate-200/60">
      <header className="sticky top-0 z-20 border-b border-brand-800/20 bg-brand-700 text-white">
        <div className="flex items-center gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          {backTo ? (
            <Link
              to={backTo}
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-white/10 text-xl transition hover:bg-white/20"
              aria-label="رجوع"
            >
              →
            </Link>
          ) : null}

          <div className="min-w-0 flex-1 text-right">
            <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
            {subtitle ? (
              <p className="truncate text-sm text-brand-100">{subtitle}</p>
            ) : null}
          </div>

          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  )
}
