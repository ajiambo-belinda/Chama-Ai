import Sidebar from '../components/Sidebar'

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 px-4 py-5 lg:px-8 lg:py-7 max-w-[1200px] w-full mx-auto lg:mx-0">{children}</main>
    </div>
  )
}