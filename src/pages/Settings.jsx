import { useState } from 'react'
import { Save, Moon, Sun, Bell, Shield, Percent, Users2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useTheme } from '../hooks/useTheme'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()

  const [interestRate, setInterestRate] = useState(10)
  const [loanMultiplier, setLoanMultiplier] = useState(3)
  const [cycle, setCycle] = useState('Monthly')
  const [savedMessage, setSavedMessage] = useState('')

  const [notifications, setNotifications] = useState({
    contributionReminders: true,
    loanDue: true,
    aiInsights: true,
    withdrawalRequests: true,
  })

  function handleSaveChamaSettings() {
    setSavedMessage('Chama settings updated.')
    setTimeout(() => setSavedMessage(''), 2500)
  }

  function toggleNotification(key) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-text">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Manage your chama rules, account, and preferences</p>
      </div>

      {/* Chama-wide financial rules */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Percent size={16} className="text-primary" />
          <h2 className="text-sm font-medium text-text">Loan rules</h2>
        </div>
        <p className="text-xs text-text-muted mb-4">
          These apply chama-wide — changing them affects how interest and loan limits are calculated for every member.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted block mb-1.5">Interest rate (% per cycle)</label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1.5">Loan limit multiplier (x savings)</label>
            <input
              type="number"
              value={loanMultiplier}
              onChange={(e) => setLoanMultiplier(Number(e.target.value))}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs text-text-muted block mb-1.5">Contribution cycle</label>
          <select
            value={cycle}
            onChange={(e) => setCycle(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Weekly">Weekly</option>
            <option value="Bi-weekly">Bi-weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Button onClick={handleSaveChamaSettings} className="gap-2">
            <Save size={15} />
            Save changes
          </Button>
          {savedMessage && <span className="text-xs text-success">{savedMessage}</span>}
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-primary" />}
            <div>
              <h2 className="text-sm font-medium text-text">Appearance</h2>
              <p className="text-xs text-text-muted mt-0.5">Currently using {theme} mode</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-primary" />
          <h2 className="text-sm font-medium text-text">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { key: 'contributionReminders', label: 'Contribution reminders' },
            { key: 'loanDue', label: 'Loan payment due alerts' },
            { key: 'aiInsights', label: 'AI Treasurer insights' },
            { key: 'withdrawalRequests', label: 'Withdrawal request updates' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-text">{item.label}</span>
              <button
                onClick={() => toggleNotification(item.key)}
                className={`w-10 h-5.5 rounded-full relative transition-colors ${
                  notifications[item.key] ? 'bg-primary' : 'bg-border'
                }`}
                style={{ height: 22, width: 40 }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ transform: notifications[item.key] ? 'translateX(18px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-primary" />
          <h2 className="text-sm font-medium text-text">Security</h2>
        </div>
        <p className="text-xs text-text-muted mb-4">
          Password and two-factor authentication settings will be available once accounts are connected to the backend.
        </p>
        <Button variant="outline" size="sm" disabled>
          Change password
        </Button>
      </div>

      {/* Members management shortcut */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 size={16} className="text-primary" />
          <div>
            <p className="text-sm font-medium text-text">Manage members</p>
            <p className="text-xs text-text-muted mt-0.5">Invite, remove, or change roles for chama members</p>
          </div>
        </div>
        <Button variant="outline" size="sm" disabled>
          Coming soon
        </Button>
      </div>
    </div>
  )
}