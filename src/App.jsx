import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Contributions from './pages/Contributions'
import Loans from './pages/Loans'
import Profile from './pages/Profile'
import AiTreasurer from './pages/AiTreasurer'
import Groups from './pages/Groups'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contributions" element={<Contributions />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ai-treasurer" element={<AiTreasurer />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App