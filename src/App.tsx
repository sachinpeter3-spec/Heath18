import { NavLink, Route, Routes } from 'react-router-dom'
import { Disclaimer } from './components/Disclaimer'
import DayPage from './pages/DayPage'
import FoodPage from './pages/FoodPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'
import TodayPage from './pages/TodayPage'
import WeekPage from './pages/WeekPage'

const NAV = [
  { to: '/', label: 'Today' },
  { to: '/week', label: 'Week' },
  { to: '/food', label: 'Food' },
  { to: '/progress', label: 'Progress' },
  { to: '/settings', label: 'Settings' },
]

export default function App() {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-4 px-4 pt-5 pb-16">
      <header className="flex items-end justify-between border-b-[3px] border-ink pb-2.5">
        <h1 className="m-0 font-display text-[40px] leading-[.85] uppercase tracking-tight">
          <span className="border-[3px] border-ink bg-yellow px-1 text-black">Heath</span>18
        </h1>
        <span className="cap text-right">Lean &amp; Healthy OS</span>
      </header>
      <nav className="flex flex-wrap gap-1.5">
        {NAV.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `cap border-2 border-ink px-2.5 py-1.5 no-underline ${isActive ? 'bg-ink text-bg' : 'bg-card text-ink'}`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
      <main className="flex flex-col gap-4">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/week" element={<WeekPage />} />
          <Route path="/day/:dow" element={<DayPage />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <Disclaimer />
    </div>
  )
}
