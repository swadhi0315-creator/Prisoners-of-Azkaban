import React from 'react';
import { House, PlayerCharacter } from '../types';
import { soundEngine } from '../utils/audio';
import { Volume2, VolumeX, Sparkles, Moon, Sun, Feather, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  character: PlayerCharacter;
  isCurfew: boolean;
  onToggleCurfew: () => void;
  onOpenCharacterModal: () => void;
  onOpenAssessment: () => void;
  onOpenJournal: () => void;
  isJournalOpen: boolean;
  housePoints: number;
}

const houseThemes: Record<House, { primary: string; secondary: string; border: string; emblem: string; label: string }> = {
  Gryffindor: {
    primary: 'bg-red-950/80 text-amber-200',
    secondary: 'text-amber-400',
    border: 'border-amber-600/40',
    emblem: '🦁',
    label: 'Gryffindor',
  },
  Slytherin: {
    primary: 'bg-emerald-950/80 text-emerald-200',
    secondary: 'text-emerald-400',
    border: 'border-emerald-600/40',
    emblem: '🐍',
    label: 'Slytherin',
  },
  Ravenclaw: {
    primary: 'bg-sky-950/80 text-sky-200',
    secondary: 'text-sky-300',
    border: 'border-sky-600/40',
    emblem: '🦅',
    label: 'Ravenclaw',
  },
  Hufflepuff: {
    primary: 'bg-amber-950/80 text-amber-100',
    secondary: 'text-amber-300',
    border: 'border-amber-600/40',
    emblem: '🦡',
    label: 'Hufflepuff',
  },
};

export const Header: React.FC<HeaderProps> = ({
  character,
  isCurfew,
  onToggleCurfew,
  onOpenCharacterModal,
  onOpenAssessment,
  onOpenJournal,
  isJournalOpen,
  housePoints,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundEngine.getIsMuted());
  const [isAmbienceOn, setIsAmbienceOn] = React.useState(soundEngine.getIsAmbiencePlaying());

  const theme = houseThemes[character.house];

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleAmbience = () => {
    const playing = soundEngine.toggleHogwartsAmbience();
    setIsAmbienceOn(playing);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0e0f14]/95 backdrop-blur-md border-b border-[#2d251e] shadow-2xl">
      {/* Subtle floating candle glow line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Crest & Title */}
        <div className="flex items-center gap-3">
          <div
            onClick={onOpenCharacterModal}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[#1a1410] border border-[#524131] cursor-pointer hover:border-amber-400/70 transition-all hover:scale-105 shadow-inner"
            title="Inspect / Edit Character"
          >
            {theme.emblem}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-lg tracking-wider text-[#e6d5b8] font-bold">
                Hogwarts 1993
              </span>
              <span className="text-xs uppercase tracking-widest text-amber-500/90 font-cinzel font-semibold hidden sm:inline">
                Year III · Prisoner of Azkaban
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#a09080]">
              <button
                onClick={onOpenCharacterModal}
                className="hover:text-amber-300 transition-colors flex items-center gap-1 font-garamond text-sm italic"
              >
                <span>{character.name}</span>
                <span className="text-[#6d5e50]">·</span>
                <span className={theme.secondary}>{theme.label}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center: Curfew & House Points Tracker */}
        <div className="flex items-center gap-4 text-xs font-cinzel">
          {/* House Points Hourglass */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#161412] rounded border border-[#3d2f23]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-[#a09080]">House Points:</span>
            <span className="font-bold text-amber-300 font-garamond text-base">
              {housePoints}
            </span>
          </div>

          {/* Curfew Mode Toggle */}
          <button
            onClick={onToggleCurfew}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all border ${
              isCurfew
                ? 'bg-red-950/70 text-red-300 border-red-700/60 shadow-[0_0_12px_rgba(185,28,28,0.3)]'
                : 'bg-[#161412] text-[#c0b098] border-[#3d2f23] hover:border-amber-600/40'
            }`}
            title={isCurfew ? 'Curfew in effect: Prefects & Snape roaming!' : 'Daytime classes'}
          >
            {isCurfew ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold">Night Curfew</span>
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs">Daytime</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Audio & Journal sidebar toggle */}
        <div className="flex items-center gap-2">
          {/* Ambience toggle */}
          <button
            onClick={handleToggleAmbience}
            className={`px-2.5 py-1 text-xs rounded border transition-all flex items-center gap-1.5 ${
              isAmbienceOn
                ? 'bg-amber-950/60 text-amber-300 border-amber-600/50 shadow-[0_0_10px_rgba(217,119,6,0.2)]'
                : 'bg-[#161412] text-[#8e8070] border-[#3d2f23] hover:text-[#c0b098]'
            }`}
            title="Toggle Castle Hearth & Rain Ambience"
          >
            <span className="text-[11px] font-cinzel">Hearth</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isAmbienceOn ? 'bg-amber-400 animate-ping' : 'bg-[#504030]'}`} />
          </button>

          {/* Sound FX mute toggle */}
          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded bg-[#161412] border border-[#3d2f23] text-[#a09080] hover:text-amber-300 transition-colors"
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Sorting Hat / Psychological Assessment Button */}
          <button
            onClick={onOpenAssessment}
            className="px-2.5 py-1 rounded bg-[#201813] border border-[#5a422d] hover:border-amber-500/80 text-amber-200 text-xs font-cinzel font-semibold tracking-wider flex items-center gap-1.5 transition-all hover:scale-105 shadow-sm"
            title="Hogwarts Psychological Assessment & Sorting Hat"
          >
            <span>🎩</span>
            <span className="hidden md:inline">Sorting Hat</span>
          </button>

          {/* Student Journal Button */}
          <button
            onClick={onOpenJournal}
            className={`px-3 py-1 rounded text-xs font-cinzel tracking-wider flex items-center gap-1.5 transition-all border ${
              isJournalOpen
                ? 'bg-amber-900/60 text-amber-200 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-[#1c1612] text-[#d6c4a8] border-[#4a3928] hover:border-amber-500/70'
            }`}
          >
            <Feather className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Journal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
