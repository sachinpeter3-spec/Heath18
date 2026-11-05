/** Phase 8 replaces this with weight/waist/poop charts. For now it hosts the original burn planner. */
export default function ProgressPage() {
  return (
    <>
      <h2 className="m-0 font-display text-2xl uppercase">Progress</h2>
      <p className="m-0 text-sm text-muted">
        Your burn planner, unchanged (same saved data). <a href="/burn/" className="text-ink">Open full screen</a>
      </p>
      <iframe src="/burn/" title="Burn planner" className="box h-[1400px] w-full" />
    </>
  )
}
