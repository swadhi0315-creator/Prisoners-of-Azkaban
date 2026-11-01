import React, { useState } from 'react';
import { HogwartsLocation } from '../types';
import { soundEngine } from '../utils/audio';
import { MapPin, ShieldAlert, Sparkles, User, CheckCircle } from 'lucide-react';

interface HogwartsMapViewProps {
  locations: HogwartsLocation[];
  onInteract: (locationId: string, interactionId: string) => void;
  isCurfew: boolean;
}

export const HogwartsMapView: React.FC<HogwartsMapViewProps> = ({
  locations,
  onInteract,
  isCurfew,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<HogwartsLocation>(locations[0]);
  const [activeTab, setActiveTab] = useState<'All' | 'Castle Interior' | 'Grounds' | 'Secret Passages'>('All');
  const [interactionResult, setInteractionResult] = useState<string | null>(null);

  const filteredLocations =
    activeTab === 'All'
      ? locations
      : locations.filter((loc) => loc.area === activeTab);

  const handleSelectLocation = (loc: HogwartsLocation) => {
    soundEngine.playParchmentRustle();
    setSelectedLocation(loc);
    setInteractionResult(null);
  };

  const handleTriggerAction = (actionId: string, label: string) => {
    soundEngine.playSpellCast('spark');
    onInteract(selectedLocation.id, actionId);
    setInteractionResult(`You performed: "${label}". The echoes of ancient magic stir.`);
    setTimeout(() => setInteractionResult(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto my-4 px-2 sm:px-4 space-y-6">
      {/* Header bar */}
      <div className="bg-[#14121a] border border-[#3b2e22] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="font-cinzel text-xl text-amber-200 font-bold tracking-wide flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Hogwarts Castle & Grounds</span>
          </h2>
          <p className="text-xs text-[#a09080] font-garamond italic">
            Third Year Navigation · {isCurfew ? 'Curfew Alert: Avoid roaming prefects!' : 'Normal daytime term hours'}
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-1.5 text-xs font-cinzel">
          {(['All', 'Castle Interior', 'Grounds', 'Secret Passages'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === tab
                  ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50'
                  : 'bg-[#1b171c] text-[#8e8070] border border-[#2e241c] hover:text-[#c4b5a0]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main split grid: Location list and Selected location detailed card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column: Location buttons */}
        <div className="md:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-900/40">
          {filteredLocations.map((loc) => {
            const isSelected = selectedLocation.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => handleSelectLocation(loc)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#291e14] border-amber-500/80 text-amber-200 shadow-md scale-[1.01]'
                    : 'bg-[#15131a] border-[#2e241b] text-[#c0b3a0] hover:border-amber-700/50 hover:bg-[#1d171d]'
                }`}
              >
                <div className="truncate">
                  <div className="font-cinzel text-sm font-bold truncate flex items-center gap-2">
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-[#7e6d5b]'}`} />
                    <span>{loc.name}</span>
                  </div>
                  <div className="text-[11px] font-garamond italic text-[#8a7b6b] truncate mt-0.5">
                    {loc.atmosphere}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] font-cinzel text-amber-400/80 px-2 py-0.5 bg-[#1f1915] rounded border border-[#3d2e20]">
                    {loc.area}
                  </span>
                  {loc.curfewRisk === 'Severe' && (
                    <span className="text-[9px] text-red-400 flex items-center gap-0.5">
                      <ShieldAlert className="w-2.5 h-2.5" /> High Risk
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right column: Detailed Location View */}
        <div className="md:col-span-7 bg-[#14121a] border border-[#3b2e22] rounded-lg p-6 space-y-5 shadow-2xl">
          <div className="border-b border-[#2d231b] pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel uppercase tracking-widest text-amber-500/90 font-semibold">
                {selectedLocation.area}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded border font-cinzel ${
                  selectedLocation.curfewRisk === 'Safe'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40'
                    : selectedLocation.curfewRisk === 'Moderate'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-700/40'
                    : 'bg-red-950/60 text-red-300 border-red-700/40'
                }`}
              >
                Curfew: {selectedLocation.curfewRisk}
              </span>
            </div>
            <h3 className="font-cinzel text-2xl font-bold text-amber-200 mt-1">
              {selectedLocation.name}
            </h3>
            <p className="text-sm font-garamond italic text-[#d4c6b2] mt-2">
              {selectedLocation.description}
            </p>
          </div>

          {/* Occupants present */}
          <div>
            <div className="text-xs font-cinzel text-[#9c8c7a] flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Often Sighted Here:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedLocation.occupants.map((occ, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-[#1e181c] border border-[#3b2e22] rounded text-xs text-[#cfbfab] font-garamond"
                >
                  {occ}
                </span>
              ))}
            </div>
          </div>

          {/* Ambience & Danger */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#18141d] p-3.5 rounded border border-[#2d241c]">
            <div>
              <div className="font-cinzel text-amber-400 font-semibold mb-1">Atmosphere:</div>
              <div className="text-[#a59583] font-garamond italic">{selectedLocation.atmosphere}</div>
            </div>
            <div>
              <div className="font-cinzel text-red-400 font-semibold mb-1">Perils & Vigilance:</div>
              <div className="text-[#a59583] font-garamond italic">{selectedLocation.dangers}</div>
            </div>
          </div>

          {/* Interactive actions */}
          <div>
            <div className="text-xs font-cinzel text-amber-400 font-semibold mb-2.5">
              Available Interactions & Actions:
            </div>
            <div className="space-y-2">
              {selectedLocation.interactions.map((act) => (
                <div
                  key={act.id}
                  className="p-3 bg-[#1c1722] border border-[#362b20] hover:border-amber-600/50 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <div className="font-cinzel text-xs font-bold text-amber-200">
                      {act.label}
                    </div>
                    <div className="text-xs text-[#a09080] font-garamond italic">
                      {act.description}
                    </div>
                  </div>
                  <button
                    onClick={() => handleTriggerAction(act.id, act.label)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-cinzel text-xs font-bold rounded shadow transition-all whitespace-nowrap"
                  >
                    Engage
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback message banner */}
          {interactionResult && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-600/40 rounded text-xs text-emerald-200 font-garamond flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{interactionResult}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
