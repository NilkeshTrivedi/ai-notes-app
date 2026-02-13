import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import './Layout.css'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <header className="header">
          <h1>AI Notes</h1>
          <div className="header-user">
            <span>{user?.name}</span>
            <button onClick={logout} className="btn-logout">Logout</button>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
