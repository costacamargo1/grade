// components/BentoMenu.tsx
"use client";

import { LayoutGrid, FileText, BarChart3, Building, Package, type LucideIcon } from 'lucide-react';

type Tab = 'grade' | 'orgaos' | 'resultados' | 'processos' | 'produtos';

interface BentoMenuProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

interface MenuItem {
  id: Tab;
  title: string;
  icon: LucideIcon;
}

const mainItems: MenuItem[] = [
  { id: 'grade', title: 'Grade', icon: LayoutGrid },
  { id: 'processos', title: 'Processos', icon: FileText },
  { id: 'orgaos', title: 'Órgãos', icon: Building },
  { id: 'produtos', title: 'Produtos', icon: Package },
];

const standaloneItem: MenuItem = { id: 'resultados', title: 'Resultados', icon: BarChart3 };

const NavButton = ({ item, activeTab, setActiveTab }: { item: MenuItem, activeTab: Tab, setActiveTab: (tab: Tab) => void }) => {
  const isActive = activeTab === item.id;
  return (
    <button
      key={item.id}
      onClick={() => setActiveTab(item.id)}
      className={`
        group flex items-center gap-2 rounded-md py-2 px-4
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-slate-500 focus:ring-offset-slate-200
        ${isActive 
          ? 'bg-white text-slate-900 shadow-sm' 
          : 'text-slate-600 hover:bg-slate-300/60 hover:text-slate-800'
        }
      `}
    >
      <item.icon 
        size={16} 
        className={`transition-colors ${isActive ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-700'}`} 
      />
      <h3 className="font-semibold text-sm tracking-tight">{item.title}</h3>
    </button>
  );
};

export default function BentoMenu({ activeTab, setActiveTab }: BentoMenuProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Botões Principais */}
      <div className="flex items-center space-x-1 rounded-lg bg-slate-200 p-1">
        {mainItems.map((item) => (
          <NavButton key={item.id} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
        ))}
      </div>

      {/* Separador */}
      <span aria-hidden="true" className="h-6 w-px bg-slate-300" />

      {/* Botão Standalone */}
      <div className="flex items-center rounded-lg bg-slate-200 p-1">
        <NavButton item={standaloneItem} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
