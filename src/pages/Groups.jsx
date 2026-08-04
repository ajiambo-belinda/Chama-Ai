import { useState } from 'react'
import { Plus, X, Users, ArrowRight, Crown, Check } from 'lucide-react'
import { Button } from '../components/ui/button'

// Registered members and their current savings — later this comes from the backend (all users on the platform)
const registeredMembers = [
  { name: 'James Mwangi', savings: 15000, active: true },
  { name: 'Grace Wanjiru', savings: 13000, active: true },
  { name: 'Peter Otieno', savings: 4000, active: true },
  { name: 'Susan Achieng', savings: 8300, active: true },
  { name: 'Daniel Kiplagat', savings: 0, active: false }, // inactive — hasn't logged in / no activity yet
]

export default function Groups() {
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Bumbe Genesis Savings Group',
      members: ['James Mwangi', 'Grace Wanjiru', 'Peter Otieno', 'Susan Achieng'],
      role: 'Treasurer',
      cycle: 'Monthly',
      active: true,
    },
    {
      id: 2,
      name: 'Familia Table Banking',
      members: ['James Mwangi', 'Grace Wanjiru'],
      role: 'Member',
      cycle: 'Weekly',
      active: false,
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formCycle, setFormCycle] = useState('Monthly')
  const [selectedMembers, setSelectedMembers] = useState([])

  const activeMembers = registeredMembers.filter((m) => m.active)

  function toggleMember(name) {
    setSelectedMembers((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    )
  }

  const selectedBalance = registeredMembers
    .filter((m) => selectedMembers.includes(m.name))
    .reduce((sum, m) => sum + m.savings, 0)

  function groupBalance(memberNames) {
    return registeredMembers
      .filter((m) => memberNames.includes(m.name))
      .reduce((sum, m) => sum + m.savings, 0)
  }

  function handleCreateGroup() {
    if (!formName.trim() || selectedMembers.length === 0) return

    setGroups((list) => [
      ...list,
      {
        id: Date.now(),
        name: formName.trim(),
        members: selectedMembers,
        role: 'Treasurer',
        cycle: formCycle,
        active: false,
      },
    ])
    setFormName('')
    setSelectedMembers([])
    setShowForm(false)
  }

  function handleSwitchGroup(id) {
    setGroups((list) => list.map((g) => ({ ...g, active: g.id === id })))
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
              Add members ({activeMembers.length} active members registered on Chama AI)
            </label>
            <div className="border border-border rounded-lg divide-y divide-border max-h-52 overflow-y-auto">
              {activeMembers.map((m) => {
                const isSelected = selectedMembers.includes(m.name)
                return (
                  <button
                    key={m.name}
                    onClick={() => toggleMember(m.name)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-surface-hover transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isSelected ? 'bg-primary border-primary' : 'border-border'
                        }`}
                      >
                        {isSelected && <Check size={11} className="text-white" />}
                      </div>
                      <span className="text-sm text-text">{m.name}</span>
                    </div>
                    <span className="text-xs font-mono text-text-muted">
                      KES {m.savings.toLocaleString()} saved
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {selectedMembers.length > 0 && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-text-muted">
                {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
              </span>
              <span className="text-accent font-mono font-medium">
                Group balance: KES {selectedBalance.toLocaleString()}
              </span>
            </div>
          )}

          <Button onClick={handleCreateGroup} disabled={!formName.trim() || selectedMembers.length === 0} className="gap-2">
            <Plus size={16} />
            Create Group
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {groups.map((g) => {
          const balance = groupBalance(g.members)
          return (
            <div
              key={g.id}
              className={`bg-surface border rounded-xl p-5 transition-colors ${
                g.active ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'
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
                {g.active && (
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
                  {g.role === 'Treasurer' && <Crown size={12} className="text-accent" />}
                  {g.role}
                </span>
              </div>

              {!g.active && (
                <button
                  onClick={() => handleSwitchGroup(g.id)}
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
    </div>
  )
}