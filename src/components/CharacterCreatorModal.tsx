import React, { useState } from 'react';
import { PlayerCharacter, House } from '../types';
import { soundEngine } from '../utils/audio';
import { Sparkles, X, Wand2, Shield, User } from 'lucide-react';

interface CharacterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: PlayerCharacter;
  onSave: (updated: PlayerCharacter) => void;
}

const houseOptions: { id: House; label: string; emblem: string; desc: string; colors: string }[] = [
  {
    id: 'Gryffindor',
    label: 'Gryffindor',
    emblem: '🦁',
    desc: 'Bravery, daring, nerve, and chivalry.',
    colors: 'border-red-600/60 bg-red-950/40 text-amber-200',
  },
  {
    id: 'Slytherin',
    label: 'Slytherin',
    emblem: '🐍',
    desc: 'Ambition, cunning, leadership, and resourcefulness.',
    colors: 'border-emerald-600/60 bg-emerald-950/40 text-emerald-200',
  },
  {
    id: 'Ravenclaw',
    label: 'Ravenclaw',
    emblem: '🦅',
    desc: 'Intelligence, creativity, wisdom, and wit.',
    colors: 'border-sky-600/60 bg-sky-950/40 text-sky-200',
  },
  {
    id: 'Hufflepuff',
    label: 'Hufflepuff',
    emblem: '🦡',
    desc: 'Loyalty, dedication, patience, and fair play.',
    colors: 'border-amber-600/60 bg-amber-950/40 text-amber-200',
  },
];

const wandWoods = ['Black Walnut', 'Holly', 'Vine', 'Yew', 'Hawthorn', 'Willow', 'English Oak'];
const wandCores = ['Phoenix Feather', 'Dragon Heartstring', 'Unicorn Hair'];
const petTypes = ['Barn Owl', 'Tawny Owl', 'Black Cat', 'Ginger Cat', 'Toad', 'Ferret'] as const;

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({
  isOpen,
  onClose,
  character,
  onSave,
}) => {
  const [name, setName] = useState(character.name);
  const [house, setHouse] = useState<House>(character.house);
  const [wandWood, setWandWood] = useState(character.wand.wood);
  const [wandCore, setWandCore] = useState(character.wand.core);
  const [petType, setPetType] = useState(character.pet.type);
  const [petName, setPetName] = useState(character.pet.name);
  const [patronusMemory, setPatronusMemory] = useState(character.patronus.memory);
  const [boggartFear, setBoggartFear] = useState(character.boggart.fear);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playSpellCast('spark');
    onSave({
      ...character,
      name: name.trim() || 'Rowan Vance',
      house,
      wand: {
        ...character.wand,
        wood: wandWood,
        core: wandCore,
      },
      pet: {
        type: petType,
        name: petName.trim() || 'Archimedes',
      },
      patronus: {
        ...character.patronus,
        memory: patronusMemory,
      },
      boggart: {
        ...character.boggart,
        fear: boggartFear,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#14121a] border-2 border-amber-600/50 rounded-lg max-w-2xl w-full p-6 text-[#ded5c7] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-900/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d231b] pb-3">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="font-cinzel text-lg font-bold text-amber-200">
              Student Records · Year Three (1993)
            </h2>
          </div>
          <button onClick={onClose} className="text-[#8e8070] hover:text-amber-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Name */}
          <div>
            <label className="block font-cinzel text-amber-400 font-semibold mb-1">
              Witch / Wizard Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-[#1b1722] border border-[#3b2e22] rounded text-xs text-amber-100 focus:outline-none focus:border-amber-500 font-garamond text-sm"
            />
          </div>

          {/* House selection */}
          <div>
            <label className="block font-cinzel text-amber-400 font-semibold mb-2">
              Hogwarts House:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {houseOptions.map((h) => (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => setHouse(h.id)}
                  className={`p-3 rounded text-left border transition-all flex items-start gap-2.5 ${
                    house === h.id
                      ? `${h.colors} shadow-md scale-[1.01]`
                      : 'bg-[#18141d] border-[#2e241c] text-[#8e8070] hover:border-amber-700/50'
                  }`}
                >
                  <span className="text-2xl">{h.emblem}</span>
                  <div>
                    <div className="font-cinzel font-bold text-xs">{h.label}</div>
                    <div className="text-[11px] font-garamond italic">{h.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Wand customizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#191522] p-3 rounded border border-[#2f251c]">
            <div>
              <label className="block font-cinzel text-amber-400 font-semibold mb-1">
                Wand Wood:
              </label>
              <select
                value={wandWood}
                onChange={(e) => setWandWood(e.target.value)}
                className="w-full p-2 bg-[#201a2c] border border-[#3e3022] rounded text-xs text-amber-100 font-garamond"
              >
                {wandWoods.map((wood) => (
                  <option key={wood} value={wood}>
                    {wood}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-cinzel text-amber-400 font-semibold mb-1">
                Core Material:
              </label>
              <select
                value={wandCore}
                onChange={(e) => setWandCore(e.target.value)}
                className="w-full p-2 bg-[#201a2c] border border-[#3e3022] rounded text-xs text-amber-100 font-garamond"
              >
                {wandCores.map((core) => (
                  <option key={core} value={core}>
                    {core}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pet companion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-cinzel text-amber-400 font-semibold mb-1">
                Animal Companion:
              </label>
              <select
                value={petType}
                onChange={(e) => setPetType(e.target.value as typeof petType)}
                className="w-full p-2 bg-[#1b1722] border border-[#3b2e22] rounded text-xs text-amber-100 font-garamond"
              >
                {petTypes.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-cinzel text-amber-400 font-semibold mb-1">
                Pet Name:
              </label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full p-2 bg-[#1b1722] border border-[#3b2e22] rounded text-xs text-amber-100 font-garamond"
              />
            </div>
          </div>

          {/* Patronus Memory */}
          <div>
            <label className="block font-cinzel text-amber-400 font-semibold mb-1">
              Core Happiest Memory (Patronus Anchor):
            </label>
            <input
              type="text"
              value={patronusMemory}
              onChange={(e) => setPatronusMemory(e.target.value)}
              className="w-full p-2.5 bg-[#1b1722] border border-[#3b2e22] rounded text-xs text-amber-100 font-garamond"
            />
          </div>

          {/* Boggart Fear */}
          <div>
            <label className="block font-cinzel text-amber-400 font-semibold mb-1">
              Deepest Boggart Fear:
            </label>
            <input
              type="text"
              value={boggartFear}
              onChange={(e) => setBoggartFear(e.target.value)}
              className="w-full p-2.5 bg-[#1b1722] border border-[#3b2e22] rounded text-xs text-amber-100 font-garamond"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-[#2d231b]">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-cinzel text-xs font-bold rounded shadow transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Seal Hogwarts Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
