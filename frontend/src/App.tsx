import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Portfolio from './pages/Portfolio'
import SleepAid from './pages/SleepAid'
import McTaskApp from './pages/mc-task/App'
import ArtChat from './pages/ArtChat'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/sleep-aid/*" element={<SleepAid />} />
        <Route path="/mc-task/*" element={<McTaskApp />} />
        <Route path="/art-chat/*" element={<ArtChat />} />
      </Routes>
    </BrowserRouter>
  )
}
