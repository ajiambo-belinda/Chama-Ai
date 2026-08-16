import { useState, useEffect } from 'react'
import { Save, Moon, Sun, Bell, Shield, Percent, Users2, AlertCircle, Crown, Lock, X, UserMinus, Plus } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useTheme } from '../hooks/useTheme'
import { useChama } from '../context/ChamaContext'
import { useAuth } from '../context/AuthContext'
import { assignOfficialsAPI } from '../api/groups'
import { changePasswordAPI } from '../api/auth'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const { activeGroup, updateGroupSettings, addGroupMember, removeGroupMember } = useChama()

  const isTreasurer = activeGroup && (activeGroup.treasurer?._id === user._id || activeGroup.treasurer === user._id)

  const [interestRate, setInterestRate] = useState(10)
  const [loanMultiplier, setLoanMultiplier] = useState(3)
  const [cycle, setCycle] = useState('Monthly')
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [error, setError] = useState('')

  const [chairman, setChairman] = useState('')
  const [secretary, setSecretary] = useState('')
  const [treasurerId, setTreasurerId] = useState('')
  const [officialsSaving, setOfficialsSaving] = useState(false)
  const [officialsMessage, setOfficialsMessage] = useState('')

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMessage, setPwMessage] = useState('')
  const [pwError, setPwError] = useState('')

  const [showMemberForm, setShowMemberForm] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [memberSaving, setMemberSaving] = useState(false)
  const [memberError, setMemberError] = useState('')

  const [notifications, setNotifications] = useState({
    contributionReminders: true,
    loanDue: true,
    aiInsights: true,
    withdrawalRequests: true,
  })

  useEffect(() => {
    if (activeGroup) {
      setInterestRate(activeGroup.interestRate)
      setLoanMultiplier(activeGroup.loanLimitMultiplier)
      setCycle(activeGroup.cycle)
    }
  }, [activeGroup])

  useEffect(() => {
    if (activeGroup?.officials) {
      setChairman(activeGroup.officials.chairman?._id || '')
      setSecretary(activeGroup.officials.secretary?._id || '')
      setTreasurerId(activeGroup.officials.treasurer?._id || '')
    }
  }, [activeGroup])

  async function handleSaveChamaSettings() {
    setError('')
    setSaving(true)
    try {
      await updateGroupSettings({
        interestRate: Number(interestRate),
        loanLimitMultiplier: Number(loanMultiplier),
        cycle,
      })
      setSavedMessage('Chama settings updated.')
      setTimeout(() => setSavedMessage(''), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveOfficials() {
    setOfficialsSaving(true)
    try {
      await assignOfficialsAPI(activeGroup._id, { chairman, secretary, treasurer: treasurerId })
      setOfficialsMessage('Officials updated.')
      setTimeout(() => setOfficialsMessage(''), 2500)
    } finally {
      setOfficialsSaving(false)
    }
  }

  async function handleChangePassword() {
    setPwError('')
    setPwMessage('')
    if (newPw.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    setPwSaving(true)
    try {
      await changePasswordAPI(currentPw, newPw)
      setPwMessage('Password updated successfully.')
      setCurrentPw('')
      setNewPw('')
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password.')
    } finally {
      setPwSaving(false)
    }
  }

  async function handleAddMember() {
    setMemberError('')
    if (!memberEmail.trim()) return
    setMemberSaving(true)
    try {
      await addGroupMember(memberEmail.trim())
      setMemberEmail('')
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member.')
    } finally {
      setMemberSaving(false)
    }
  }

  async function handleRemoveMember(memberId) {
    await removeGroupMember(memberId)
  }

  function toggleNotification(key) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-text">Settings</h1>
        <p className="text-sm text-text-muted mt-1">
          {activeGroup ? activeGroup.name : 'Manage your account and preferences'}
        </p>
      </div>

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

      {!activeGroup && (
        <div className="bg-surface border border-border rounded-xl p-6 text-center text-text-muted text-sm">
          No active group — create or select a group to manage loan rules, officials, and members.
        </div>
      )}

      {activeGroup && (
        <>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Percent size={16} className="text-primary" />
              <h2 className="text-sm font-medium text-text">Loan rules</h2>
            </div>

            {!isTreasurer && (
              <p className="text-xs text-warning mb-4 flex items-center gap-1.5">
                <AlertCircle size={13} />
                Only the treasurer can change these settings. You can view them here.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-muted block mb-1.5">Interest rate (% per cycle)</label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  disabled={!isTreasurer}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1.5">Loan limit multiplier (x savings)</label>
                <input
                  type="number"
                  value={loanMultiplier}
                  onChange={(e) => setLoanMultiplier(e.target.value)}
                  disabled={!isTreasurer}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs text-text-muted block mb-1.5">Contribution cycle</label>
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
                disabled={!isTreasurer}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            {isTreasurer && (
              <div className="flex items-center gap-3 mt-4">
                <Button onClick={handleSaveChamaSettings} disabled={saving} className="gap-2">
                  <Save size={15} />
                  {saving ? 'Saving...' : 'Save changes'}
                </Button>
                {savedMessage && <span className="text-xs text-success">{savedMessage}</span>}
                {error && <span className="text-xs text-danger">{error}</span>}
              </div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crown size={16} className="text-accent" />
              <h2 className="text-sm font-medium text-text">Chama officials</h2>
            </div>

            {!isTreasurer && (
              <p className="text-xs text-warning mb-4 flex items-center gap-1.5">
                <AlertCircle size={13} />
                Only the treasurer can assign roles.
              </p>
            )}

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Chairman', value: chairman, setter: setChairman },
                { label: 'Secretary', value: secretary, setter: setSecretary },
                { label: 'Treasurer', value: treasurerId, setter: setTreasurerId },
              ].map(({ label, value, setter }) => (
                <div key={label}>
                  <label className="text-xs text-text-muted block mb-1.5">{label}</label>
                  <select
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    disabled={!isTreasurer}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="">Unassigned</option>
                    {activeGroup.members.map((m) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {isTreasurer && (
              <div className="flex items-center gap-3 mt-4">
                <Button onClick={handleSaveOfficials} disabled={officialsSaving} className="gap-2">
                  <Save size={15} />
                  {officialsSaving ? 'Saving...' : 'Save officials'}
                </Button>
                {officialsMessage && <span className="text-xs text-success">{officialsMessage}</span>}
              </div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users2 size={16} className="text-primary" />
                <p className="text-sm font-medium text-text">Manage members</p>
              </div>
              {isTreasurer && (
                <Button variant="outline" size="sm" onClick={() => setShowMemberForm((s) => !s)} className="gap-1.5">
                  {showMemberForm ? <X size={14} /> : <Plus size={14} />}
                  {showMemberForm ? 'Cancel' : 'Add member'}
                </Button>
              )}
            </div>

            {showMemberForm && (
              <div className="flex gap-2 mb-4">
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button onClick={handleAddMember} disabled={memberSaving} size="sm">
                  {memberSaving ? 'Adding...' : 'Add'}
                </Button>
              </div>
            )}
            {memberError && <p className="text-xs text-danger mb-3">{memberError}</p>}

            <div className="border border-border rounded-lg divide-y divide-border">
              {activeGroup.members.map((m) => (
                <div key={m._id} className="flex items-center justify-between px-3 py-2.5">
                  <div>
                    <span className="text-sm text-text">{m.name}</span>
                    <span className="text-xs text-text-muted ml-2">{m.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-text-muted">KES {m.savings.toLocaleString()}</span>
                    {isTreasurer && m._id !== user._id && (
                      <button onClick={() => handleRemoveMember(m._id)} className="text-text-muted hover:text-danger" title="Remove member">
                        <UserMinus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

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
                className={`rounded-full relative transition-colors ${
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

      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-primary" />
          <h2 className="text-sm font-medium text-text">Security</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted block mb-1.5">Current password</label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1.5">New password</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {pwError && <p className="text-xs text-danger mt-2">{pwError}</p>}
        {pwMessage && <p className="text-xs text-success mt-2">{pwMessage}</p>}

        <Button onClick={handleChangePassword} disabled={pwSaving} size="sm" className="gap-2 mt-3">
          <Lock size={14} />
          {pwSaving ? 'Updating...' : 'Change password'}
        </Button>
      </div>
    </div>
  )
}