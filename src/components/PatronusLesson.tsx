import React, { useState } from 'react';
import { soundEngine } from '../utils/audio';
import { Sparkles, Moon, Shield, Award, CheckCircle } from 'lucide-react';

interface PatronusLessonProps {
  playerPatronus: { form: string; memory: string };
  onComplete: (housePoints: number, resultText: string) => void;
  onClose?: () => void;
}

const memories = [
  {
    id: 'letter',
    title: 'The Owl with the Hogwarts Letter',
    desc: 'The morning a majestic barn owl tapped the glass with an envelope written in emerald ink, discovering magic is real.',
  },
  {
    id: 'first_feast',
    title: 'First Sight of the Candlelit Great Hall',
    desc: 'Gliding across the midnight Black Lake in small boats, rounding the cliff to see Hogwarts ablaze with thousands of windows.',
  },
  {
    id: 'common_room',
    title: 'Warm Hearth with True Companions',
    desc: 'Sitting by the roaring fire late at night, sharing butterbeer, laughing until tears stream down your cheeks with people who truly know you.',
  },
  {
    id: 'flying_freedom',
    title: 'First Flight into the Scottish Sunset',
    desc: 'Kicking off the damp turf on a broomstick, soaring higher than the towers, weightless and completely free.',
  },
];

export const PatronusLesson: React.FC<PatronusLessonProps> = ({
  playerPatronus,
  onComplete,
  onClose,
}) => {
  const [selectedMemory, setSelectedMemory] = useState(memories[2]);
  const [stage, setStage] = useState<'ready' | 'focusing' | 'casting' | 'triumph'>('ready');
  const [silverCharge, setSilverCharge] = useState(0);
  const [patronusType, setPatronusType] = useState(playerPatronus.form || 'Silver Falcon');

  const handleStartFocus = () => {
    soundEngine.playDementorChill();
    setStage('focusing');
  };

  const handleCastPatronus = () => {
    setStage('casting');
    let charge = 0;
    const interval = setInterval(() => {
      charge += 20;
      setSilverCharge(charge);
      if (charge >= 100) {
        clearInterval(interval);
        soundEngine.playPatronusBurst();
        setStage('triumph');
      }
    }, 250);
  };

  const handleFinish = () => {
    onComplete(
      30,
      `You conjured a full corporeal Patronus in the form of a brilliant ${patronusType}, illuminating the darkness with the memory of ${selectedMemory.title}!`
    );
  };

  return (
    <div className="bg-[#0f111a] border border-[#2e3752] rounded-lg p-5 sm:p-7 shadow-2xl max-w-4xl mx-auto my-4 text-[#d9e2ec]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#252c42] pb-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#1c2238] flex items-center justify-center text-2xl border border-sky-400/40">
            🪄
          </div>
          <div>
            <h2 className="font-cinzel text-xl text-sky-200 font-bold tracking-wide">
              Expecto Patronum: Defense Against Despair
            </h2>
            <p className="text-xs text-[#9bb1d1] font-garamond italic">
              Private Lessons with Professor Lupin · The Silver Shield Charm
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[#8094b8] hover:text-sky-200 px-2 py-1 text-xs">
            ✕
          </button>
        )}
      </div>

      {stage === 'ready' && (
        <div className="space-y-6">
          <div className="bg-[#141926] border border-[#2b3652] rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-44 h-56 bg-gradient-to-b from-[#182033] to-[#0c101c] rounded border border-sky-500/40 flex flex-col items-center justify-between p-3 shadow-inner">
              <div className="text-xs font-cinzel text-sky-300">The Packing Crate</div>
              <div className="text-5xl animate-pulse">📦</div>
              <div className="text-[11px] font-garamond italic text-sky-400/80 text-center">
                *Frost spreading on iron latches*
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="text-sky-300 font-cinzel text-sm flex items-center gap-2">
                <span className="text-xl">🐺</span>
                <span>Professor Remus Lupin:</span>
              </div>
              <blockquote className="border-l-2 border-sky-500/40 pl-3 italic text-sm text-[#ccd9ed] font-garamond">
                “The Patronus is a kind of Anti-Dementor—a guardian which acts as a shield between you and the despair. But to conjure it, words alone are nothing. You must search your heart for the happiest, most powerful memory you possess.”
              </blockquote>
              <p className="text-xs text-[#8da0bd]">
                Select your core incandescent memory to channel into your wand:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {memories.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMemory(m)}
                    className={`p-2.5 rounded text-left border transition-all text-xs ${
                      selectedMemory.id === m.id
                        ? 'bg-[#1e2a44] border-sky-400 text-sky-100 shadow-md'
                        : 'bg-[#151c2e] border-[#25324d] text-[#93a7c7] hover:border-sky-600/60'
                    }`}
                  >
                    <div className="font-semibold text-sky-200 truncate">{m.title}</div>
                    <div className="text-[11px] text-[#7d93b5] line-clamp-2">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleStartFocus}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-700 to-indigo-600 hover:from-sky-600 hover:to-indigo-500 text-sky-100 font-cinzel text-sm font-bold rounded shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Unlock the Packing Crate</span>
            </button>
          </div>
        </div>
      )}

      {stage === 'focusing' && (
        <div className="space-y-6">
          <div className="relative bg-[#0d101a] border border-sky-950 rounded-lg p-7 text-center space-y-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-transparent to-blue-950/30 pointer-events-none" />
            <div className="text-xs uppercase tracking-widest text-sky-400 font-cinzel">
              The Cold Drops Like a Guillotine...
            </div>
            <div className="text-7xl animate-pulse">❄️👻</div>
            <h3 className="font-cinzel text-xl text-sky-200 font-bold">
              A Dementor Glides into the Room
            </h3>
            <p className="text-sm font-garamond italic text-[#b5c7e3] max-w-lg mx-auto">
              Your breath clouds in the freezing air. Despair grips the edges of your vision. But deep within your mind, you hold fiercely to:
            </p>
            <div className="p-3 bg-[#172036] border border-sky-400/40 rounded max-w-md mx-auto text-xs font-semibold text-sky-200">
              “{selectedMemory.title}”
            </div>

            <div className="pt-4">
              <button
                onClick={handleCastPatronus}
                className="px-8 py-3 bg-gradient-to-r from-sky-500 via-indigo-400 to-sky-300 hover:from-sky-400 hover:to-sky-200 text-slate-950 font-cinzel font-black tracking-widest text-base rounded shadow-[0_0_25px_rgba(56,189,248,0.6)] transition-all transform hover:scale-105"
              >
                THRUST WAND: “EXPECTO PATRONUM!” 🪄
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === 'casting' && (
        <div className="bg-[#101424] border border-sky-400/50 rounded-lg p-8 text-center space-y-5">
          <div className="text-5xl animate-spin">✨</div>
          <h3 className="font-cinzel text-xl text-sky-200 font-bold">
            Silver Vapor Swirling into Corporeal Form...
          </h3>
          <div className="w-full max-w-md mx-auto bg-[#1b2238] h-4 rounded-full overflow-hidden border border-sky-500/40">
            <div
              className="bg-gradient-to-r from-sky-400 via-white to-sky-300 h-full transition-all duration-200"
              style={{ width: `${silverCharge}%` }}
            />
          </div>
          <p className="text-xs font-garamond italic text-[#9bb3d6]">
            The room floods with radiant, dazzling silver daylight!
          </p>
        </div>
      )}

      {stage === 'triumph' && (
        <div className="bg-[#0f1b2b] border border-sky-400/50 rounded-lg p-7 text-center space-y-5">
          <div className="text-7xl animate-bounce">✨🦅✨</div>
          <div className="text-sky-300 font-cinzel text-xl font-bold">
            A Fully Corporeal Patronus Erupts!
          </div>
          <h3 className="font-cinzel text-2xl text-white font-extrabold tracking-wide">
            {patronusType}
          </h3>
          <p className="text-sm font-garamond text-[#d0e0f5] max-w-lg mx-auto">
            A magnificent, blinding silver creature gallops through the room! The Dementor shrieks, retreating back into the darkness of the crate. Warmth floods back into your hands and heart.
          </p>

          <div className="p-4 bg-[#18263d] border border-sky-400/40 rounded max-w-md mx-auto text-xs text-sky-200 space-y-1">
            <div className="font-bold flex items-center justify-center gap-1">
              <Award className="w-4 h-4 text-sky-300" />
              <span>Advanced NEWT-Level Charm Mastered!</span>
            </div>
            <div>+30 House Points Awarded by Professor Lupin</div>
            <div>Lupin hands you a large slab of Honeydukes dark chocolate: “Splendid work, Rowan. Outstanding.”</div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-sky-100 font-cinzel text-sm font-bold rounded shadow-lg transition-all"
            >
              Claim Victory & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
