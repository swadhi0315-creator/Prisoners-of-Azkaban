import React, { useState, useEffect } from 'react';
import { soundEngine } from '../utils/audio';
import { MarauderFootprint } from '../types';
import { Compass, Eye, ShieldAlert, Sparkles, Feather } from 'lucide-react';

interface MaraudersMapViewProps {
  footprints: MarauderFootprint[];
  onInspectPerson?: (name: string) => void;
}

export const MaraudersMapView: React.FC<MaraudersMapViewProps> = ({
  footprints: initialFootprints,
  onInspectPerson,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<MarauderFootprint | null>(null);
  const [footprints, setFootprints] = useState<MarauderFootprint[]>(initialFootprints);
  const [activeFloor, setActiveFloor] = useState<'All Floors' | 'Dungeons' | 'Grounds' | 'High Towers'>('All Floors');

  // Footprint live pacing animation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setFootprints((prev) =>
        prev.map((fp) => {
          // slight random wander
          const dx = (Math.random() - 0.5) * 2;
          const dy = (Math.random() - 0.5) * 2;
          const newX = Math.max(10, Math.min(90, fp.x + dx));
          const newY = Math.max(10, Math.min(90, fp.y + dy));
          return {
            ...fp,
            x: newX,
            y: newY,
            direction: (fp.direction + 15) % 360,
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleOpenMap = () => {
    soundEngine.playParchmentRustle();
    setIsOpen(true);
  };

  const handleCloseMap = () => {
    soundEngine.playParchmentRustle();
    setIsOpen(false);
    setSelectedPerson(null);
  };

  return (
    <div className="max-w-6xl mx-auto my-4 px-2 sm:px-4">
      {!isOpen ? (
        /* Folded Map State */
        <div className="bg-[#e8dcbf] text-[#2c1d11] rounded-lg p-8 sm:p-12 shadow-2xl border-4 border-[#8c6d48] text-center max-w-xl mx-auto space-y-6 relative overflow-hidden">
          {/* Faint parchment lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#bba282_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
          <div className="text-5xl">📜</div>
          <h2 className="font-cinzel text-2xl font-bold tracking-wider text-[#422915]">
            An Old Square of Worn Parchment
          </h2>
          <p className="font-garamond italic text-sm text-[#5d3f23] max-w-md mx-auto">
            It looks like a blank, completely ordinary piece of paper until tapped with the tip of a wand.
          </p>
          <div className="pt-2">
            <button
              onClick={handleOpenMap}
              className="px-6 py-3 bg-[#3a2010] hover:bg-[#28150a] text-amber-100 font-cinzel text-sm font-bold tracking-wider rounded shadow-lg border border-amber-600/40 transition-all transform hover:scale-105"
            >
              “I solemnly swear that I am up to no good.” 🪄
            </button>
          </div>
        </div>
      ) : (
        /* Unfolded Animated Marauder's Map */
        <div className="bg-[#ede1c7] text-[#332213] rounded-lg shadow-2xl border-4 border-[#7a5c36] overflow-hidden relative">
          {/* Antique parchment banner header */}
          <div className="border-b-2 border-[#8e6c43]/40 p-4 sm:p-6 text-center bg-[#e4d4b4] relative">
            <button
              onClick={handleCloseMap}
              className="absolute right-4 top-4 text-xs font-cinzel font-bold text-[#5c3c1e] hover:text-[#8a1c14] border border-[#8e6c43] px-2.5 py-1 rounded bg-[#ebdcc2] transition-colors"
            >
              “Mischief Managed” ✕
            </button>

            <div className="max-w-2xl mx-auto space-y-1">
              <div className="text-xs uppercase tracking-widest text-[#77522d] font-cinzel font-semibold">
                Messrs. Moony, Wormtail, Padfoot, and Prongs
              </div>
              <div className="text-xs text-[#5f3e1f] font-garamond italic">
                Purveyors of Aids to Magical Mischief-Makers are proud to present
              </div>
              <h1 className="font-cinzel text-2xl sm:text-3xl font-black tracking-widest text-[#2f1807] uppercase">
                THE MARAUDER’S MAP
              </h1>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-cinzel">
              {(['All Floors', 'Dungeons', 'Grounds', 'High Towers'] as const).map((floor) => (
                <button
                  key={floor}
                  onClick={() => setActiveFloor(floor)}
                  className={`px-3 py-1 rounded border transition-colors ${
                    activeFloor === floor
                      ? 'bg-[#3b2311] text-amber-100 border-[#2b1708]'
                      : 'bg-[#ddcbb0] text-[#5c3e21] border-[#a18258] hover:bg-[#d4bf9f]'
                  }`}
                >
                  {floor}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Map Canvas Grid */}
          <div className="relative min-h-[520px] p-4 bg-[#f1e6cf] overflow-hidden border-t border-[#8e6c43]/30">
            {/* Castle blueprint architectural lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="parchment-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#684a2b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#parchment-grid)" />

              {/* Architectural Rooms */}
              <rect x="5%" y="8%" width="30%" height="28%" fill="none" stroke="#5a3d21" strokeWidth="2" strokeDasharray="4,2" />
              <text x="7%" y="14%" fill="#5a3d21" fontSize="12" fontFamily="Cinzel" fontWeight="bold">Gryffindor Tower</text>

              <rect x="55%" y="8%" width="40%" height="32%" fill="none" stroke="#5a3d21" strokeWidth="2" strokeDasharray="4,2" />
              <text x="57%" y="14%" fill="#5a3d21" fontSize="12" fontFamily="Cinzel" fontWeight="bold">The Library & Restricted Section</text>

              <rect x="35%" y="42%" width="30%" height="24%" fill="none" stroke="#5a3d21" strokeWidth="2" strokeDasharray="4,2" />
              <text x="37%" y="48%" fill="#5a3d21" fontSize="12" fontFamily="Cinzel" fontWeight="bold">DADA Classroom & Moving Stairs</text>

              <rect x="8%" y="70%" width="38%" height="24%" fill="none" stroke="#5a3d21" strokeWidth="2" strokeDasharray="4,2" />
              <text x="10%" y="76%" fill="#5a3d21" fontSize="12" fontFamily="Cinzel" fontWeight="bold">Potions Dungeons & Slytherin Gate</text>

              <rect x="65%" y="65%" width="30%" height="28%" fill="none" stroke="#5a3d21" strokeWidth="2" strokeDasharray="4,2" />
              <text x="67%" y="71%" fill="#5a3d21" fontSize="12" fontFamily="Cinzel" fontWeight="bold">Hagrid’s Cabin & Pumpkin Patch</text>

              {/* Secret Passage Lines */}
              <path
                d="M 38% 30% Q 55% 55% 72% 38%"
                fill="none"
                stroke="#8a2014"
                strokeWidth="1.5"
                strokeDasharray="6,4"
              />
              <text x="46%" y="40%" fill="#8a2014" fontSize="10" fontFamily="Cinzel" fontStyle="italic">One-Eyed Witch Tunnel</text>
            </svg>

            {/* Moving Footprints with ribbons */}
            {footprints.map((fp) => {
              const isSelected = selectedPerson?.id === fp.id;
              const isPettigrew = fp.isPettigrew;

              return (
                <div
                  key={fp.id}
                  onClick={() => setSelectedPerson(fp)}
                  className="absolute cursor-pointer transition-all duration-1000 z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${fp.x}%`, top: `${fp.y}%` }}
                >
                  <div className="flex flex-col items-center">
                    {/* Animated footprint dots */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs leading-none transform -rotate-12 select-none">
                        👣
                      </span>
                    </div>

                    {/* Character Parchment Ribbon Tag */}
                    <div
                      className={`px-2 py-0.5 rounded text-[11px] font-cinzel whitespace-nowrap shadow-md border transition-all ${
                        isPettigrew
                          ? 'bg-[#8a1c14] text-amber-100 border-red-900 font-bold animate-pulse'
                          : isSelected
                          ? 'bg-[#361f0d] text-amber-200 border-[#261407] scale-110 font-bold'
                          : 'bg-[#dfceb0] text-[#3e2714] border-[#8a6a44] hover:bg-[#361f0d] hover:text-amber-200'
                      }`}
                    >
                      {fp.name}
                      {isPettigrew && ' ⚠️'}
                    </div>

                    <div className="text-[9px] font-garamond italic text-[#6a4c2f]">
                      {fp.room}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Character Drawer / Lore Banner */}
          {selectedPerson && (
            <div className="border-t-2 border-[#8e6c43]/40 p-4 sm:p-5 bg-[#e3d1b0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#352010] text-amber-200 flex items-center justify-center text-xl font-cinzel font-bold border-2 border-[#8a6842]">
                  {selectedPerson.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-cinzel text-lg font-bold text-[#2e1808]">
                      {selectedPerson.name}
                    </h3>
                    {selectedPerson.isPettigrew && (
                      <span className="px-2 py-0.5 bg-red-900 text-amber-100 text-[10px] font-cinzel font-bold rounded">
                        ANOMALY SIGHTED!
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-garamond italic text-[#54361c]">
                    Current Location: {selectedPerson.room} · Status: {selectedPerson.status}
                  </p>
                  {selectedPerson.isPettigrew && (
                    <p className="text-xs text-red-900 font-bold font-garamond mt-0.5">
                      “Peter Pettigrew was supposed to have been killed by Sirius Black twelve years ago... why is his name walking the grounds?!”
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onInspectPerson && (
                  <button
                    onClick={() => onInspectPerson(selectedPerson.name)}
                    className="px-4 py-1.5 bg-[#3c2311] hover:bg-[#251509] text-amber-100 font-cinzel text-xs font-bold rounded shadow border border-[#6b4c2b]"
                  >
                    View Dossier
                  </button>
                )}
                <button
                  onClick={() => setSelectedPerson(null)}
                  className="px-3 py-1.5 text-xs text-[#5a3b1d] hover:text-[#2e1808]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
