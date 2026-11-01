import React from 'react';
import {
  Compass,
  Map as MapIcon,
  Users,
  Wand2,
  GraduationCap,
  Sparkles,
  Mail,
  KeyRound,
  BookOpen,
  Shield,
} from 'lucide-react';

export type NavTab =
  | 'open_adventure'
  | 'story'
  | 'common_room'
  | 'marauder'
  | 'hogwarts_map'
  | 'relationships'
  | 'classes'
  | 'inventory'
  | 'quidditch'
  | 'owl_post'
  | 'discoveries'
  | 'dossiers';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadOwlPostCount: number;
}

const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badgeCount?: number }[] = [
  { id: 'open_adventure', label: 'Open Adventure (AI)', icon: Sparkles },
  { id: 'common_room', label: 'Common Room', icon: Shield },
  { id: 'story', label: 'Chronicle Acts', icon: Compass },
  { id: 'marauder', label: 'Marauder’s Map', icon: MapIcon },
  { id: 'hogwarts_map', label: 'Castle Grounds', icon: Sparkles },
  { id: 'relationships', label: 'Relationships', icon: Users },
  { id: 'classes', label: 'Classes & Practicals', icon: GraduationCap },
  { id: 'quidditch', label: 'Quidditch', icon: Sparkles },
  { id: 'inventory', label: 'Spells & Trunk', icon: Wand2 },
  { id: 'owl_post', label: 'Owl Post', icon: Mail },
  { id: 'discoveries', label: 'Secrets & Lore', icon: KeyRound },
  { id: 'dossiers', label: 'Characters', icon: BookOpen },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  unreadOwlPostCount,
}) => {
  return (
    <nav className="bg-[#121116] border-b border-[#2d251e] sticky top-[61px] z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-amber-900/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isOwl = item.id === 'owl_post' && unreadOwlPostCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-cinzel font-semibold whitespace-nowrap transition-all duration-200 relative ${
                  isActive
                    ? 'bg-[#2b2016] text-amber-300 border border-amber-600/60 shadow-[0_0_12px_rgba(217,119,6,0.2)]'
                    : 'text-[#9c8e7c] hover:text-[#e4d6c0] hover:bg-[#1a1714] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-[#857460]'}`} />
                <span>{item.label}</span>

                {isOwl && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
