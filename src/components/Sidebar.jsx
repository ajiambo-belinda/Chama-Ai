import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Wallet, HandCoins, FileBarChart, Sparkles, Settings, User, Coins,
  Menu, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'My Account', icon: User },
  { to: '/groups', label: 'Groups', icon: Users },
  { to: '/contributions', label: 'Contributions', icon: Wallet },
  { to: '/loans', label: 'Loans', icon: HandCoins },
  { to: '/dividends', label: 'Dividends', icon: Coins },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/ai-treasurer', label: 'AI Treasurer', icon: Sparkles, highlight: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavItems = ({ onNavigate }) => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navItems.map(({ to, label, icon: Icon, highlight }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-primary/15 text-primary font-medium'
                : 'text-text-muted hover:text-text hover:bg-surface-hover'
            }`
          }
        >
          <Icon size={17} className={highlight ? 'text-accent' : ''} />
          {label}
          {highlight && (
            <span className="ml-auto text-[10px] font-mono uppercase tracking-wide text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              AI
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )

  const UserFooter = () => (
    <div className="px-4 py-4 border-t border-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary shrink-0">
          {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text truncate">{user?.name}</p>
          <p className="text-xs text-text-muted truncate">{user?.email}</p>
        </div>
        <button onClick={logout} className="text-text-muted hover:text-danger transition-colors shrink-0" title="Log out">
          <X size={0} className="hidden" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <Logo size={26} />
        <button onClick={() => setMobileOpen(true)} className="text-text p-1.5">
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 h-screen sticky top-0 border-r border-border bg-surface flex-col">
        <div className="px-5 py-5 border-b border-border">
          <Logo size={30} />
        </div>
        <NavItems />
        <UserFooter />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[80vw] h-full bg-surface border-r border-border flex flex-col">
            <div className="px-5 py-5 border-b border-border flex items-center justify-between">
              <Logo size={28} />
              <button onClick={() => setMobileOpen(false)} className="text-text-muted p-1">
                <X size={20} />
              </button>
            </div>
            <NavItems onNavigate={() => setMobileOpen(false)} />
            <UserFooter />
          </aside>
        </div>
      )}
    </>
  )
}