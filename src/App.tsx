import ProfileHeader from "./components/ProfileHeader"
import SpectateCalendar from "./components/SpectateCalendar"
import DiaryFeed from "./components/DiaryFeed"

/* ------------------------------------------------------------------ */
/* Theme styles (self-contained, no Tailwind config required)          */
/* ------------------------------------------------------------------ */

const themeStyles = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');

.lck-root {
  --background: oklch(0.985 0.004 240);
  --foreground: oklch(0.21 0.03 250);
  --card: oklch(1 0 0);
  --primary: oklch(0.55 0.16 250);
  --primary-foreground: oklch(0.99 0.005 240);
  --muted: oklch(0.955 0.008 240);
  --muted-foreground: oklch(0.52 0.025 250);
  --accent: oklch(0.8 0.12 85);
  --accent-foreground: oklch(0.28 0.05 80);
  --border: oklch(0.9 0.012 240);
  --victory: oklch(0.55 0.16 250);
  --defeat: oklch(0.58 0.22 25);
  --gold: oklch(0.78 0.13 80);
  --font-heading: 'Oswald', system-ui, sans-serif;

  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--foreground);
  background-color: var(--background);
}
.lck-root .font-heading { font-family: var(--font-heading); }
`

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <div className="lck-root min-h-screen">
      <style>{themeStyles}</style>

      {/* Top app bar */}
      <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-[var(--primary)] font-heading text-sm text-[var(--primary-foreground)]">
              LCK
            </span>
            <span className="font-heading text-lg tracking-tight text-[var(--foreground)]">
              직관 다이어리
            </span>
          </div>
          <span className="hidden text-xs text-[var(--muted-foreground)] sm:block">
            나만을 위한 ��라이빗 직관 기록
          </span>
        </div>
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <ProfileHeader />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <SpectateCalendar />
          </div>
          <div className="lg:col-span-3">
            <DiaryFeed />
          </div>
        </div>
      </main>
    </div>
  )
}