import Sidebar from '../components/Sidebar'

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 px-8 py-7 max-w-[1200px]">{children}</main>
    </div>
  )
}