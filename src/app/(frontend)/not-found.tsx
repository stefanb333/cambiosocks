import { Header } from '@/components/layout/Header'
import { PrimaryPillButton, SoftPillButton } from '@/components/ui/Buttons'

/** 404 (nema Figma frejm): veliki natpis u stilu "CAMBIO" wordmark-a iz footer-a i dugmad iz biblioteke. */
export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="sadrzaj"
        className="flex min-h-[70svh] flex-col items-center justify-center gap-6 bg-white px-[var(--gutter)] py-16 text-center"
      >
        <p
          aria-hidden
          className="pr-[0.06em] font-display leading-[0.82] font-bold tracking-[-0.06em] text-neutral-200"
          style={{ fontSize: 'clamp(140px, 30vw, 340px)' }}
        >
          404
        </p>
        <h1 className="t-heading -mt-4 text-black">Stranica nije pronađena</h1>
        <p className="max-w-[440px] text-[16px] leading-6 text-neutral-700">
          Stranica koju tražite ne postoji ili je premeštena. Pogledajte kolekciju ili se vratite na
          početnu.
        </p>
        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <PrimaryPillButton href="/kolekcije/sve" className="w-full max-w-[280px] sm:w-[193px]">
            Pogledaj Kolekciju
          </PrimaryPillButton>
          <SoftPillButton href="/" className="w-full max-w-[280px] sm:w-[193px]">
            Početna
          </SoftPillButton>
        </div>
      </main>
    </>
  )
}
