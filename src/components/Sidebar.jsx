import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Wallet, HandCoins, FileBarChart, Sparkles, Settings, User, Coins } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import { LogOut } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'My Account', icon: User },
  { to: '/groups', label: 'Groups', icon: Users },
  { to: '/contributions', label: 'Contributions', icon: Wallet },
  { to: '/loans', label: 'Loans', icon: HandCoins },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/ai-treasurer', label: 'AI Treasurer', icon: Sparkles, highlight: true },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/dividends', label: 'Dividends', icon: Coins },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 border-r border-border bg-surface flex flex-col">
      <div className="px-5 py-5 border-b border-border">
  <Logo size={30} />
</div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, highlight }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
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

      <div className="px-4 py-4 border-t border-border">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
      {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm text-text truncate">{user?.name}</p>
      <p className="text-xs text-text-muted truncate">{user?.email}</p>
    </div>
    <button onClick={logout} className="text-text-muted hover:text-danger transition-colors" title="Log out">
      <LogOut size={16} />
    </button>
  </div>
</div>
    </aside>
  )
}