import { NavLink, Route, Routes } from 'react-router-dom'
import DeepSeekChatPage from './pages/DeepSeekChatPage.tsx'
import PdfViewerPage from './pages/PdfViewerPage.tsx'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>My PDF Workspace</h1>
        <nav className="app-nav">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'app-link active' : 'app-link')}
            end
          >
            PDF Viewer
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) => (isActive ? 'app-link active' : 'app-link')}
          >
            DeepSeek Chat
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<PdfViewerPage />} />
        <Route path="/chat" element={<DeepSeekChatPage />} />
      </Routes>
    </div>
  )
}

export default App
