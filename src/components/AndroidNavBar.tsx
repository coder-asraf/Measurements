import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Crosshair,
  Box,
  Calculator,
  TrendingUp,
  GraduationCap,
  BookOpen,
  FolderCode
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'clinometer'
  | 'targetSight'
  | 'coordinates3D'
  | 'calculator'
  | 'slopeTerrain'
  | 'educational'
  | 'notebook'
  | 'androidHub';

interface AndroidNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({ activeTab, onSelectTab }) => {
  const primaryTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clinometer', label: 'Clinometer', icon: Compass },
    { id: 'targetSight', label: 'Target Sight', icon: Crosshair },
    { id: 'coordinates3D', label: '3D XYZ', icon: Box },
    { id: 'calculator', label: 'Trig Lab', icon: Calculator },
    { id: 'slopeTerrain', label: 'Slope', icon: TrendingUp },
    { id: 'educational', label: 'Experiments', icon: GraduationCap },
    { id: 'notebook', label: 'Notebook', icon: BookOpen },
    { id: 'androidHub', label: 'APK Project', icon: FolderCode },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 text-zinc-300">
      <div className="max-w-7xl mx-auto px-2 flex items-center justify-between overflow-x-auto no-scrollbar py-1">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as ActiveTab)}
              className={`flex flex-col items-center justify-center min-w-[62px] py-1.5 px-1.5 rounded-lg transition-all ${
                isActive
                  ? 'text-cyan-400 bg-cyan-950/40 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px] font-sans">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
