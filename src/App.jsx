import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import TabBar from './components/TabBar';
import HomePage from './pages/HomePage';
import MatchupPage from './pages/MatchupPage';
import NineteenthHolePage from './pages/NineteenthHolePage';

export default function App() {
  const { pathname } = useLocation();
  const showTabBar = !pathname.startsWith('/matchup');

  return (
    <div className="min-h-screen bg-fairway-950 text-white">
      <Header />

      <main className={showTabBar ? 'pb-16' : ''}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/19th-hole" element={<NineteenthHolePage />} />
          <Route path="/matchup/:matchupId" element={<MatchupPage />} />
          <Route path="*" element={
            <div className="text-center text-fairway-400 py-20">
              Page not found. <a href="/" className="text-gold-400 underline">Go home</a>
            </div>
          } />
        </Routes>
      </main>

      <TabBar />
    </div>
  );
}
