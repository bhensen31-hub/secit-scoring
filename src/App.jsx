import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import TeamSelector from './components/TeamSelector';
import HomePage from './pages/HomePage';
import MatchupPage from './pages/MatchupPage';

const TEAM_KEY = 'secit_team';

function loadTeam() {
  const stored = localStorage.getItem(TEAM_KEY);
  if (stored === '1') return 1;
  if (stored === '2') return 2;
  if (stored === 'null') return null;
  return undefined; // not yet chosen
}

function saveTeam(team) {
  localStorage.setItem(TEAM_KEY, String(team));
}

export default function App() {
  const [team, setTeam] = useState(loadTeam);
  const [showSelector, setShowSelector] = useState(false);

  const handleSelectTeam = useCallback((selected) => {
    setTeam(selected);
    saveTeam(selected);
    setShowSelector(false);
  }, []);

  // Show team selector on first visit
  const needsTeam = team === undefined;

  return (
    <div className="min-h-screen bg-fairway-950 text-white">
      <Header
        team={team}
        onChangeTeam={() => setShowSelector(true)}
      />

      {(needsTeam || showSelector) && (
        <TeamSelector onSelect={handleSelectTeam} />
      )}

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/matchup/:matchupId" element={<MatchupPage myTeam={team} />} />
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
