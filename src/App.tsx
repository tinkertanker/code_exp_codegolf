import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TeamEntry from './components/TeamEntry'
import Challenge from './components/Challenge'
import Leaderboard from './components/Leaderboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TeamEntry />} />
        <Route path="/challenge" element={<Challenge />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  )
}

export default App