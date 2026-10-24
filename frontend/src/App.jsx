import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Monitor from './pages/Monitor.jsx'

// Two pages:  "/" explains the product,  "/monitor" is the live dashboard.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/monitor" element={<Monitor />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
