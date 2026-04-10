import { Link, useLocation } from 'react-router-dom';

export default function TabBar() {
  const { pathname } = useLocation();

  if (pathname.startsWith('/matchup')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-fairway-900 border-t border-fairway-700 z-40 safe-area-bottom">
      <div className="max-w-2xl mx-auto flex">
        <Link
          to="/"
          className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors
            ${pathname === '/' ? 'text-gold-400' : 'text-fairway-500 hover:text-fairway-300'}`}
        >
          <span className="text-xl leading-none">⛳</span>
          <span>Cup</span>
        </Link>
        <Link
          to="/gold"
          className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors
            ${pathname === '/gold' ? 'text-gold-400' : 'text-fairway-500 hover:text-fairway-300'}`}
        >
          <span className="text-xl leading-none">🥇</span>
          <span>Gold</span>
        </Link>
        <Link
          to="/19th-hole"
          className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors
            ${pathname === '/19th-hole' ? 'text-gold-400' : 'text-fairway-500 hover:text-fairway-300'}`}
        >
          <span className="text-xl leading-none">🍺</span>
          <span>19th Hole</span>
        </Link>
      </div>
    </nav>
  );
}
