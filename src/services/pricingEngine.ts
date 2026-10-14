import React from 'react';
import { Bot, Search, Calculator, Package, Github, Send } from 'lucide-react';
import { KorchaSaddleIcon } from './KorchaSaddleIcon';

type TabKey = 'simulator' | 'search' | 'calculator' | 'orders' | 'github';

interface HeaderProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  orderCount?: number;
}

const NAV_ITEMS: Array<{
  key: TabKey;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  showOrderBadge?: boolean;
}> = [
  { key: 'simulator', label: 'ቴሌግራም ቦት', mobileLabel: 'ቴሌግራም ቦት', icon: Bot },
  { key: 'orders', label: 'የእኔ ትዕዛዞች (My Orders)', mobileLabel: 'ትዕዛዞች', icon: Package, showOrderBadge: true },
  { key: 'search', label: 'ሱቆች መፈለጊያ', mobileLabel: 'ሱቆች', icon: Search },
  { key: 'calculator', label: 'ዋጋ ማስያ & QR', mobileLabel: 'ዋጋ ማስያ', icon: Calculator },
  { key: 'github', label: 'telegram_korcha', mobileLabel: 'Repo', icon: Github },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, orderCount }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div onClick={() => setActiveTab('simulator')} className="flex items-center gap-3 cursor-pointer select-none">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-700 to-amber-900 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <KorchaSaddleIcon className="w-7 h-7 text-amber-300 drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Korcha <span className="text-amber-400 font-bold text-sm">(ኮርቻ)</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Telegram Bot
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                ከቻይና እቃዎች ወደ ኢትዮጵያ በታማኝነት • China to Ethiopia Shopping
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {NAV_ITEMS.map(({ key, label, mobileLabel, icon: Icon, showOrderBadge }) => {
              const isActive = activeTab === key;
              const isOrdersTab = key === 'orders';

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  } ${isOrdersTab ? 'relative' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className={key === 'github' ? 'hidden md:inline' : ''}>{label}</span>
                  {key === 'github' && <span className="md:hidden">{mobileLabel}</span>}
                  {!isOrdersTab && key !== 'github' && <span className="hidden sm:inline">{mobileLabel}</span>}
                  {showOrderBadge && typeof orderCount === 'number' && orderCount > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${
                        isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {orderCount}
                    </span>
                  )}
                </button>
              );
            })}

            <a
              href="https://t.me/korcha_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 transition-all cursor-pointer"
              title="ክፈት በቴሌግራም መተግበሪያ (Open directly in Telegram)"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">ቴሌግራም ቦት ክፈት</span>
              <span className="sm:hidden">ቴሌግራም</span>
            </a>

            <a
              href="https://t.me/korcha_support"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>💬 ከአስተናጋጅ ጋር አውራ</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

