import { NavLink, Route, Routes } from 'react-router-dom'
import DeepSeekChatPage from './pages/DeepSeekChatPage.tsx'
import FlexPlaygroundPage from './pages/FlexPlaygroundPage.tsx'
import PdfViewerPage from './pages/PdfViewerPage.tsx'
import SvgPlaygroundPage from './pages/SvgPlaygroundPage.tsx'
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
          <NavLink
            to="/flex"
            className={({ isActive }) => (isActive ? 'app-link active' : 'app-link')}
          >
            Flex 示例
          </NavLink>
          <NavLink
            to="/svg"
            className={({ isActive }) => (isActive ? 'app-link active' : 'app-link')}
          >
            SVG 示例
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<PdfViewerPage />} />
        <Route path="/chat" element={<DeepSeekChatPage />} />
        <Route path="/flex" element={<FlexPlaygroundPage />} />
        <Route path="/svg" element={<SvgPlaygroundPage />} />
      </Routes>
    </div>
  )
}

export default App
