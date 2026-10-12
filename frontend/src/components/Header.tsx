import React from 'react';
import {
  Home,
  Search,
  Calculator,
  Users,
  Server,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'simulator' | 'search' | 'estimation' | 'workers' | 'deploy' | 'settings';
  setActiveTab: (tab: 'simulator' | 'search' | 'estimation' | 'workers' | 'deploy' | 'settings') => void;
  officialRate: number;
  setOfficialRate: (rate: number) => void;
  pendingOrdersCount: number;
  hasRealBotToken: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  officialRate,
  setOfficialRate,
  pendingOrdersCount,
  hasRealBotToken,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-extrabold text-xl tracking-wider">
              ኮ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Korcha <span className="text-amber-400 font-medium text-base">(ኮርቻ)</span>
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v5.2
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                ከቻይና እቃዎችን በርዎ ድረስ የማስመጫ አገልግሎት (Ethiopian Doorstep Concierge)
              </p>
            </div>
          </div>

          {/* Rate & Multiplier Ticker */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="text-slate-400">ይፋዊ ምንዛሬ (CBE Rate):</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px]">$1 =</span>
                <input
                  type="number"
                  step="0.5"
                  value={officialRate}
                  onChange={(e) => setOfficialRate(parseFloat(e.target.value) || 145.50)}
                  className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-bold text-emerald-400 text-center focus:outline-none focus:border-emerald-500"
                  title="Official Ethiopian Bank Exchange Rate"
                />
                <span className="text-emerald-400 font-medium">ብር</span>
              </div>
            </div>

            {hasRealBotToken && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-[11px] text-sky-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Live Bot Active</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">መነሻ / ቦት</span>
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">ሱቆች ፈልግ</span>
              <span>Search</span>
            </button>

            <button
              onClick={() => setActiveTab('estimation')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'estimation'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">ዋጋ ማስያ</span>
              <span>Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('workers')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'workers'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">የሰራተኞች ገጽ</span>
              <span>Workers</span>
              {pendingOrdersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white font-bold text-[10px] rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('deploy')}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'deploy'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Server className="w-4 h-4" />
              <span className="hidden md:inline">ኢትዮ ቴሌኮም</span>
              <span>Deploy</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
                activeTab === 'settings' ? 'bg-slate-800 text-amber-400' : ''
              }`}
              title="Bot Token & Configuration"
            >
              <Settings className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
