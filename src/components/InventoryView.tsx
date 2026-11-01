import React, { useState } from 'react';
import { InventoryItem, Spell, PlayerCharacter } from '../types';
import { soundEngine } from '../utils/audio';
import { Wand2, Sparkles, BookOpen, Package, CheckCircle } from 'lucide-react';

interface InventoryViewProps {
  items: InventoryItem[];
  spells: Spell[];
  character: PlayerCharacter;
  onUseItem: (itemId: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  spells,
  character,
  onUseItem,
}) => {
  const [activeTab, setActiveTab] = useState<'spells' | 'trunk'>('spells');
  const [castEffect, setCastEffect] = useState<string | null>(null);
  const [itemResult, setItemResult] = useState<string | null>(null);

  const handleCast = (spell: Spell) => {
    if (spell.id === 'patronus') {
      soundEngine.playPatronusBurst();
    } else if (spell.id === 'riddikulus') {
      soundEngine.playRiddikulus();
    } else if (spell.id === 'expelliarmus') {
      soundEngine.playSpellCast('force');
    } else {
      soundEngine.playSpellCast('charm');
    }

    setCastEffect(`You cast "${spell.incantation}"! ${spell.effect}`);
    setTimeout(() => setCastEffect(null), 3500);
  };

  const handleAction = (item: InventoryItem) => {
    soundEngine.playSpellCast('spark');
    onUseItem(item.id);

    if (item.id === 'honeydukes_chocolate') {
      setItemResult('You take a bite of rich Honeydukes chocolate. Warmth floods through your chest, melting the Dementor chill!');
    } else if (item.id === 'sneakoscope') {
      setItemResult('The Sneakoscope spins furiously on your palm, whistling shrilly in a high-pitched hum! Someone nearby is untrustworthy!');
    } else if (item.id === 'monster_book') {
      setItemResult('You gently stroke the spine of the Monster Book. It shivers with delight and falls peacefully asleep.');
    } else if (item.id === 'butterbeer') {
      setItemResult('You take a long draft of frothing butterbeer. Rich butterscotch warmth tingles to your toes!');
    } else {
      setItemResult(`You inspected the ${item.name}: ${item.description}`);
    }

    setTimeout(() => setItemResult(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto my-4 px-2 sm:px-4 space-y-6">
      {/* Header bar */}
      <div className="bg-[#14121a] border border-[#3b2e22] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="font-cinzel text-xl text-amber-200 font-bold tracking-wide flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-amber-400" />
            <span>Spells & Student Trunk</span>
          </h2>
          <p className="text-xs text-[#a09080] font-garamond italic">
            Standard Book of Spells Grade 3 · Magical Curiosities & Artifacts
          </p>
        </div>

        <div className="flex gap-2 text-xs font-cinzel">
          <button
            onClick={() => setActiveTab('spells')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'spells'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50'
                : 'bg-[#1b171c] text-[#8e8070] border border-[#2e241c]'
            }`}
          >
            Spellbook ({spells.length})
          </button>
          <button
            onClick={() => setActiveTab('trunk')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'trunk'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50'
                : 'bg-[#1b171c] text-[#8e8070] border border-[#2e241c]'
            }`}
          >
            Trunk Items ({items.length})
          </button>
        </div>
      </div>

      {/* Wand Banner */}
      <div className="bg-gradient-to-r from-[#1c1613] via-[#241c16] to-[#1c1613] border border-amber-700/40 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#15100c] flex items-center justify-center text-xl border border-amber-600/50">
            🪄
          </div>
          <div>
            <div className="font-cinzel text-xs text-amber-400 uppercase tracking-wider font-semibold">
              Equipped Wand
            </div>
            <div className="font-cinzel text-base text-amber-200 font-bold">
              {character.wand.wood} with {character.wand.core} Core
            </div>
            <div className="text-xs text-[#a09080] font-garamond italic">
              Length: {character.wand.length} · Flexibility: {character.wand.flexibility}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playSpellCast('spark');
            setCastEffect(`Wand test spark: Golden sparks shower from the tip of your ${character.wand.wood} wand!`);
            setTimeout(() => setCastEffect(null), 3000);
          }}
          className="px-4 py-1.5 bg-[#322316] hover:bg-[#422e1c] text-amber-200 font-cinzel text-xs font-bold rounded border border-amber-600/40 transition-colors"
        >
          Sparks Flourish ✨
        </button>
      </div>

      {/* Cast & Item Feedback Toast */}
      {castEffect && (
        <div className="p-3 bg-sky-950/70 border border-sky-600/50 rounded-lg text-xs font-garamond text-sky-200 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span>{castEffect}</span>
        </div>
      )}
      {itemResult && (
        <div className="p-3 bg-amber-950/70 border border-amber-600/50 rounded-lg text-xs font-garamond text-amber-200 flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{itemResult}</span>
        </div>
      )}

      {/* Spells Grid */}
      {activeTab === 'spells' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spells.map((spell) => (
            <div
              key={spell.id}
              className="bg-[#15131a] border border-[#3b2e22] hover:border-amber-600/60 rounded-lg p-5 space-y-3 transition-colors shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-amber-200">
                    {spell.incantation}
                  </h3>
                  <div className="text-xs text-[#8e8070] font-garamond italic">
                    {spell.name}
                  </div>
                </div>
                <span className="text-[10px] font-cinzel px-2 py-0.5 bg-[#201914] text-amber-400 rounded border border-[#3d2e20]">
                  {spell.difficulty}
                </span>
              </div>

              <p className="text-xs font-garamond italic text-[#c8bcab]">
                {spell.effect}
              </p>

              <div className="bg-[#1b1722] p-2.5 rounded text-[11px] text-[#9d8d7b] font-garamond space-y-1">
                <div>
                  <span className="font-semibold text-amber-400">Flourish:</span>{' '}
                  {spell.wandMovement}
                </div>
                <div className="italic text-[#7d6f5f]">
                  “{spell.flavor}”
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => handleCast(spell)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-cinzel text-xs font-bold rounded shadow transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cast Incantation</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trunk Items Grid */}
      {activeTab === 'trunk' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#15131a] border border-[#3b2e22] hover:border-amber-600/60 rounded-lg p-5 space-y-3 transition-colors shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-[#201912] flex items-center justify-center text-2xl border border-[#3d2e20]">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-cinzel text-base font-bold text-amber-200">
                      {item.name}
                    </h3>
                    <div className="text-[11px] font-cinzel text-amber-500/80">
                      {item.category}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs font-garamond italic text-[#c8bcab]">
                {item.description}
              </p>

              <div className="text-[11px] font-garamond text-[#837565]">
                Acquired: {item.obtainedAt}
              </div>

              {item.actionName && (
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => handleAction(item)}
                    className="px-3.5 py-1.5 bg-[#251e18] hover:bg-[#322820] text-amber-200 font-cinzel text-xs font-bold rounded border border-[#483726] transition-all"
                  >
                    {item.actionName}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
