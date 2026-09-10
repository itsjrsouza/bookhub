import { BookMarked, Library, Moon, NotebookPen, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import type { Tab } from '../types';

interface NavProps {
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: typeof Library }[] = [
  { id: 'catalogo', label: 'Catálogo', icon: Library },
  { id: 'estante', label: 'Minha Estante', icon: BookMarked },
];

function Nav({ activeTab, onChangeTab }: NavProps) {
  const { isDark, toggleDark } = useDarkMode();

  return (
    <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white">
            📚
          </span>
          BookHub
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}

          <a
            href="/diario/"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <NotebookPen className="size-4" />
            Diário de Leitura
          </a>

          <button
            type="button"
            onClick={toggleDark}
            aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
