import { Routes, Route, NavLink } from 'react-router-dom'
import FormPage from './pages/FormPage'
import ReportsPage from './pages/ReportsPage'
import './App.css'

function App() {
  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-brand">CHR</div>
        <div className="nav-links">
          <NavLink to="/" end>Submit Report</NavLink>
          <NavLink to="/reports">View Reports</NavLink>
        </div>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
