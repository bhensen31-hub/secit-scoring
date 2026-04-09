import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="bg-fairway-900 border-b border-fairway-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
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
      </div>
    </header>
  );
}
