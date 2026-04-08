import { Link, useLocation } from 'react-router-dom';

export default function Header({ team, onChangeTeam }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="bg-fairway-900 border-b border-fairway-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo + Title */}
        <Link to="/" className="flex items-center gap-2 min-w-0">
          {!isHome && (
            <span className="text-gold-400 text-lg leading-none mr-1">←</span>
          )}
          <div className="min-w-0">
            <div className="text-gold-400 font-display font-bold text-lg leading-tight tracking-wide truncate">
              SECIT VII
            </div>
            <div className="text-fairway-300 text-xs leading-tight truncate">Golf Cup</div>
          </div>
        </Link>

        {/* Team badge */}
        <button
          onClick={onChangeTeam}
          className={`
            flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
            ${team === 1
              ? 'bg-fairway-700 border-fairway-500 text-gold-300 hover:bg-fairway-600'
              : team === 2
              ? 'bg-rough-800 border-gold-600 text-gold-300 hover:bg-rough-700'
              : 'bg-fairway-800 border-fairway-600 text-fairway-300 hover:bg-fairway-700'
            }
          `}
        >
          {team ? `Team ${team} ▾` : 'Pick Team ▾'}
        </button>
      </div>
    </header>
  );
}
