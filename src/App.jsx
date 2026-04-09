import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import MatchupPage from './pages/MatchupPage';

export default function App() {
  return (
    <div className="min-h-screen bg-fairway-950 text-white">
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/matchup/:matchupId" element={<MatchupPage />} />
          <Route path="*" element={
            <div className="text-center text-fairway-400 py-20">
              Page not found. <a href="/" className="text-gold-400 underline">Go home</a>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}
