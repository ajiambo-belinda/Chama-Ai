import { useState } from 'react'
import { Plus, X, Users, ArrowRight, Crown, Check, Search, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useChama } from '../context/ChamaContext'
import { useAuth } from '../context/AuthContext'
import { lookupUser } from '../api/users'

export default function Groups() {
  const { user } = useAuth()
  const { groups, activeGroupId, createGroup, switchActiveGroup } = useChama()

  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formCycle, setFormCycle] = useState('Monthly')
  const [selectedMembers, setSelectedMembers] = useState([]) // [{ _id, name, email, savings }]
  const [emailInput, setEmailInput] = useState('')
  const [lookupError, setLookupError] = useState('')
  const [looking, setLooking] = useState(false)

  const selectedBalance = selectedMembers.reduce((sum, m) => sum + (m.savings || 0), 0)

  async function handleAddByEmail() {
    setLookupError('')
    if (!emailInput.trim()) return

    if (emailInput.trim().toLowerCase() === user.email.toLowerCase()) {
      setLookupError("That's your own account — you're added automatically.")
      return
    }
    if (selectedMembers.some((m) => m.email === emailInput.trim().toLowerCase())) {
      setLookupError('Already added.')
      return
    }

    setLooking(true)
    try {
      const found = await lookupUser(emailInput.trim())
      setSelectedMembers((prev) => [...prev, found])
      setEmailInput('')
    } catch (err) {
      setLookupError(err.response?.data?.message || 'Member not found')
    } finally {
      setLooking(false)
    }
  }

  function removeMember(id) {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== id))
  }

  async function handleCreateGroup() {
    if (!formName.trim()) return
    const memberIds = [user._id, ...selectedMembers.map((m) => m._id)]
    await createGroup(formName.trim(), memberIds, formCycle)
    setFormName('')
    setSelectedMembers([])
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Groups</h1>
          <p className="text-sm text-text-muted mt-1">Every chama you belong to, in one place</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Create Group'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted block mb-1.5">Group name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Neighborhood Chama 2026"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1.5">Contribution cycle</label>
              <select
                value={formCycle}
                onChange={(e) => setFormCycle(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Bi-weekly">Bi-weekly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-2">
              Add members by email — they must already have a Chama AI account
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setLookupError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddByEmail())}
                  placeholder="member@example.com"
                  className="w-full bg-bg border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <Button type="button" variant="outline" onClick={handleAddByEmail} disabled={looking}>
                {looking ? 'Searching...' : 'Add'}
              </Button>
            </div>

            {lookupError && (
              <p className="text-xs text-danger flex items-center gap-1.5 mt-2">
                <AlertCircle size={13} />
                {lookupError}
              </p>
            )}

            {selectedMembers.length > 0 && (
              <div className="border border-border rounded-lg divide-y divide-border mt-3">
                {selectedMembers.map((m) => (
                  <div key={m._id} className="flex items-center justify-between px-3 py-2.5">
                    <div>
                      <span className="text-sm text-text">{m.name}</span>
                      <span className="text-xs text-text-muted ml-2">{m.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-text-muted">
                        KES {m.savings.toLocaleString()} saved
                      </span>
                      <button onClick={() => removeMember(m._id)} className="text-text-muted hover:text-danger">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-text-muted">
              {selectedMembers.length + 1} member{selectedMembers.length !== 0 ? 's' : ''} (including you)
            </span>
            <span className="text-accent font-mono font-medium">
              Starting balance: KES {selectedBalance.toLocaleString()}
            </span>
          </div>

          <Button onClick={handleCreateGroup} disabled={!formName.trim()} className="gap-2">
            <Plus size={16} />
            Create Group
          </Button>
        </div>
      )}

      {groups.length === 0 && !showForm ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <Users size={28} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text">No groups yet</p>
          <p className="text-xs text-text-muted mt-1">Create your first chama to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {groups.map((g) => {
            const isActive = g._id === activeGroupId
            const balance = g.members.reduce((sum, m) => sum + (m.savings || 0), 0)
            const isTreasurer = g.treasurer?._id === user._id || g.treasurer === user._id

            return (
              <div
                key={g._id}
                className={`bg-surface border rounded-xl p-5 transition-colors ${
                  isActive ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">{g.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{g.members.length} members · {g.cycle}</p>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-text-muted">Group balance</p>
                    <p className="text-sm font-mono font-semibold text-text mt-0.5">
                      KES {balance.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    {isTreasurer && <Crown size={12} className="text-accent" />}
                    {isTreasurer ? 'Treasurer' : 'Member'}
                  </span>
                </div>

                {!isActive && (
                  <button
                    onClick={() => switchActiveGroup(g._id)}
                    className="w-full mt-4 text-xs font-medium text-primary flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border hover:bg-surface-hover transition-colors"
                  >
                    Switch to this group
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}