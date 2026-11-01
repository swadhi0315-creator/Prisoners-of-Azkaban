import React, { useState } from 'react';
import { Discovery } from '../types';
import { soundEngine } from '../utils/audio';
import { KeyRound, ShieldAlert, Sparkles, Moon, CheckCircle } from 'lucide-react';

interface SecretsViewProps {
  discoveries: Discovery[];
  onCurfewSneak: () => void;
  isCurfew: boolean;
}

export const SecretsView: React.FC<SecretsViewProps> = ({
  discoveries,
  onCurfewSneak,
  isCurfew,
}) => {
  const [selectedDisc, setSelectedDisc] = useState<Discovery>(discoveries[0]);
  const [sneakStatus, setSneakStatus] = useState<string | null>(null);

  const handleSelect = (d: Discovery) => {
    soundEngine.playParchmentRustle();
    setSelectedDisc(d);
  };

  const handleProwl = () => {
    soundEngine.playSpellCast('spark');
    onCurfewSneak();
    const outcomes = [
      'You slip into the shadows behind a suit of armor as Filch’s yellow lantern casts long silhouettes across the flagstones! Safe!',
      'Mrs. Norris’s glowing red eyes glance your way, but you cast a quick muffled distraction and slip into the secret tapestry!',
      'You discover faint chalk markings left by previous third-years detailing the passage behind Gregory the Smarmy!',
    ];
    const picked = outcomes[Math.floor(Math.random() * outcomes.length)];
    setSneakStatus(picked);
    setTimeout(() => setSneakStatus(null), 4500);
  };

  return (
    <div className="max-w-6xl mx-auto my-4 px-2 sm:px-4 space-y-6">
      {/* Header bar */}
      <div className="bg-[#14121a] border border-[#3b2e22] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="font-cinzel text-xl text-amber-200 font-bold tracking-wide flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <span>Castle Discoveries & Forbidden Lore</span>
          </h2>
          <p className="text-xs text-[#a09080] font-garamond italic">
            Secrets of Hogwarts · Clues surrounding Sirius Black, the Marauders, and Castle Oddities.
          </p>
        </div>

        <button
          onClick={handleProwl}
          className="px-4 py-2 bg-[#2a1728] hover:bg-[#381f35] text-purple-200 border border-purple-700/50 rounded text-xs font-cinzel font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <Moon className="w-3.5 h-3.5 text-purple-400" />
          <span>Sneak Corridors at Curfew</span>
        </button>
      </div>

      {sneakStatus && (
        <div className="p-3.5 bg-purple-950/70 border border-purple-600/50 rounded-lg text-xs font-garamond italic text-purple-100 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>{sneakStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Secrets list */}
        <div className="md:col-span-5 space-y-2 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-900/40">
          {discoveries.map((disc) => {
            const isSelected = selectedDisc.id === disc.id;
            return (
              <button
                key={disc.id}
                onClick={() => handleSelect(disc)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#291e14] border-amber-500/80 text-amber-200 shadow-md scale-[1.01]'
                    : 'bg-[#15131a] border-[#2e241b] text-[#c0b3a0] hover:border-amber-700/50 hover:bg-[#1d171d]'
                }`}
              >
                <div>
                  <div className="font-cinzel text-xs font-bold text-amber-300">
                    {disc.title}
                  </div>
                  <div className="text-[11px] font-cinzel text-amber-500/70 mt-0.5">
                    {disc.category}
                  </div>
                  <div className="text-[11px] font-garamond italic text-[#8a7b6b] mt-0.5">
                    Location: {disc.foundAt}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-cinzel px-2 py-0.5 rounded border ${
                    disc.unlocked
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40'
                      : 'bg-[#211a14] text-[#8e7e6e] border-[#3d2e20]'
                  }`}
                >
                  {disc.unlocked ? 'Unlocked' : 'Rumored'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected discovery dossier card */}
        <div className="md:col-span-7 bg-[#14121a] border border-[#3b2e22] rounded-lg p-6 space-y-5 shadow-2xl">
          <div className="border-b border-[#2d231b] pb-4">
            <span className="text-xs font-cinzel text-amber-500/90 uppercase tracking-widest font-semibold">
              {selectedDisc.category}
            </span>
            <h3 className="font-cinzel text-2xl font-bold text-amber-200 mt-1">
              {selectedDisc.title}
            </h3>
            <div className="text-xs font-garamond italic text-[#8a7b6b] mt-0.5">
              Source: {selectedDisc.foundAt}
            </div>
          </div>

          <div className="space-y-3 font-garamond text-sm text-[#d4c6b2]">
            <p className="leading-relaxed italic">{selectedDisc.description}</p>
            <div className="p-3 bg-[#1c1722] rounded border border-[#382b20] text-xs text-[#a09080]">
              <span className="font-bold text-amber-400 font-cinzel">Clue Note:</span>{' '}
              {selectedDisc.clue}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
