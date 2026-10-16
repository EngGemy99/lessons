import logo from '../assets/elgamallogo.jpg'
import { usePwaInstall } from '../hooks/usePwaInstall'

interface WelcomePageProps {
  onStart: () => void
}

export function WelcomePage({ onStart }: WelcomePageProps) {
  const { canInstall, showIosHint, install } = usePwaInstall()

  return (
    <div className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-linear-to-b from-brand-700 to-brand-500 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-200/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-brand-200/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <div>
          <img
            src={logo}
            alt="ElGamal Systems"
            className="h-auto w-[min(78vw,18rem)] rounded-full shadow-[0_0_40px_rgba(151,215,255,0.35)]"
          />
        </div>

        <h1 className="mt-8 text-[1.65rem] leading-relaxed font-bold text-white sm:text-3xl">
          الجمل للانظمة الحديثة
        </h1>

        <p className="mt-3 text-sm text-brand-100/90">نظم جمعيتك بكل سهولة</p>

        <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
          <button
            type="button"
            onClick={onStart}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-brand-200 text-base font-bold text-brand-700 shadow-[0_12px_30px_rgba(8,98,136,0.28)] transition active:scale-[0.98]"
          >
            ابدأ الآن
          </button>

          {canInstall ? (
            <button
              type="button"
              onClick={() => void install()}
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-white/35 bg-white/10 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 active:scale-[0.98]"
            >
              تنزيل التطبيق
            </button>
          ) : null}

          {showIosHint ? (
            <p className="mt-1 text-xs leading-6 text-brand-100/85">
              على iPhone: اضغط مشاركة ثم «إضافة إلى الشاشة الرئيسية»
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
