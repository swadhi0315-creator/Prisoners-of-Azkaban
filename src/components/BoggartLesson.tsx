import React, { useState, useEffect } from 'react';
import { soundEngine } from '../utils/audio';
import { Sparkles, Laugh, Shield, Music, CheckCircle } from 'lucide-react';

interface BoggartLessonProps {
  onComplete: (housePoints: number, resultText: string) => void;
  onClose?: () => void;
}

const boggartForms = [
  {
    id: 'dementor',
    name: 'Towering Dementor of Azkaban',
    description: 'A decaying, hooded phantom draining every drop of warmth and joy from the air.',
    icon: '👻',
    ridiculousForm: 'A dancing scarecrow wrapped in bright yellow Hufflepuff scarves and clacking castanets!',
    ridiculousIcon: '🧣',
  },
  {
    id: 'snape',
    name: 'Severus Snape with Acid Glare',
    description: 'Billowing black robes, holding a zero-mark parchment and threatening eternal detentions.',
    icon: '🧪',
    ridiculousForm: 'Dressed in Mrs. Longbottom’s emerald green lace dress, crimson handbag, and vulture hat!',
    ridiculousIcon: '👒',
  },
  {
    id: 'spider',
    name: 'Giant Hairy Acromantula',
    description: 'Eight clicking hairy legs and venomous dripping mandibles snapping toward your face.',
    icon: '🕷️',
    ridiculousForm: 'Sliding around uncontrollably on eight roller skates like a baby giraffe on ice!',
    ridiculousIcon: '🛼',
  },
  {
    id: 'mummy',
    name: 'Creaking Bandaged Mummy',
    description: 'Lurching out of the dark with withered rotting linen and hollow groans.',
    icon: '🧟',
    ridiculousForm: 'Tripping over its loose bandages and rolling into a ball of wool like a kitten’s yarn!',
    ridiculousIcon: '🧶',
  },
  {
    id: 'moon',
    name: 'Glowing Silver Full Moon',
    description: 'A sinister lunar disc rising through dark pines, casting predatory shadows.',
    icon: '🌕',
    ridiculousForm: 'Popping like an over-inflated birthday balloon with a silly squeak!',
    ridiculousIcon: '🎈',
  },
];

export const BoggartLesson: React.FC<BoggartLessonProps> = ({ onComplete, onClose }) => {
  const [stage, setStage] = useState<'intro' | 'facing' | 'casting' | 'triumph'>('intro');
  const [selectedBoggart, setSelectedBoggart] = useState(boggartForms[0]);
  const [isWardrobeShaking, setIsWardrobeShaking] = useState(true);
  const [spellPower, setSpellPower] = useState(0);
  const [isPhonographPlaying, setIsPhonographPlaying] = useState(true);

  // Wardrobe shaking loop
  useEffect(() => {
    const interval = setInterval(() => {
      setIsWardrobeShaking((prev) => !prev);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleStartEncounter = () => {
    soundEngine.playParchmentRustle();
    setStage('facing');
  };

  const handleCastRiddikulus = () => {
    setStage('casting');
    soundEngine.playSpellCast('charm');

    let power = 0;
    const timer = setInterval(() => {
      power += 25;
      setSpellPower(power);
      if (power >= 100) {
        clearInterval(timer);
        soundEngine.playRiddikulus();
        setStage('triumph');
      }
    }, 180);
  };

  const handleFinish = () => {
    onComplete(20, `You banished the Boggart with a brilliant "Riddikulus!", turning the ${selectedBoggart.name} into ${selectedBoggart.ridiculousForm}`);
  };

  return (
    <div className="bg-[#121118] border border-[#3e3226] rounded-lg p-5 sm:p-7 shadow-2xl max-w-4xl mx-auto my-4 text-[#ded5c7]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#2d241c] pb-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#251e18] flex items-center justify-center text-2xl border border-amber-600/30">
            🚪
          </div>
          <div>
            <h2 className="font-cinzel text-xl text-amber-200 font-bold tracking-wide">
              Professor Lupin’s Boggart Practical
            </h2>
            <p className="text-xs text-[#a09080] font-garamond italic">
              Staffroom Wardrobe · “Riddikulus!” Spell Training
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPhonographPlaying(!isPhonographPlaying)}
            className={`px-2.5 py-1 text-xs rounded border flex items-center gap-1.5 transition-colors ${
              isPhonographPlaying
                ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                : 'bg-[#181410] border-[#30261c] text-[#7d6f60]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span className="text-[11px] font-cinzel">Gramophone Jazz</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#8e8070] hover:text-amber-200 px-2 py-1 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main interactive stage */}
      {stage === 'intro' && (
        <div className="space-y-6">
          <div className="relative bg-[#18151c] border border-[#332a22] rounded-lg p-6 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
            {/* Wardrobe visual */}
            <div className="relative w-44 h-56 bg-gradient-to-b from-[#3a2212] to-[#211309] rounded border-4 border-[#5a381e] flex flex-col items-center justify-between p-3 shadow-2xl">
              <div className="w-full text-center text-xs font-cinzel text-amber-300/80 border-b border-amber-900/50 pb-1">
                Lupin’s Wardrobe
              </div>
              <div
                className={`text-5xl transition-transform duration-100 ${
                  isWardrobeShaking ? 'translate-x-1 -rotate-1 scale-105' : '-translate-x-1 rotate-1'
                }`}
              >
                🚪
              </div>
              <div className="text-[11px] font-garamond italic text-amber-400/90 animate-pulse text-center">
                *Rattle! Thump! Bang!*
              </div>
            </div>

            {/* Lupin's instruction */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-cinzel text-sm">
                <span className="text-xl">🐺</span>
                <span>Professor Remus Lupin:</span>
              </div>
              <blockquote className="border-l-2 border-amber-600/40 pl-3 italic text-sm text-[#c8bcab] font-garamond">
                “Now, Rowan... the Boggart sitting in the darkness has not yet assumed a shape. It does not yet know what will frighten you most. When you open that door, you must have one clear thought in your mind: force it to become something truly ridiculous. Laughter is our true weapon.”
              </blockquote>
              <p className="text-xs text-[#9d8d7b]">
                Select the form your Boggart takes as it bursts from the rattling wardrobe:
              </p>

              {/* Selection cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {boggartForms.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBoggart(b)}
                    className={`p-2.5 rounded text-left border transition-all text-xs flex items-center gap-2.5 ${
                      selectedBoggart.id === b.id
                        ? 'bg-[#302216] border-amber-500 text-amber-200 shadow-md'
                        : 'bg-[#1b171f] border-[#362b22] text-[#aba090] hover:border-amber-700/60'
                    }`}
                  >
                    <span className="text-xl">{b.icon}</span>
                    <div className="truncate">
                      <div className="font-semibold text-amber-300 truncate">{b.name}</div>
                      <div className="text-[11px] text-[#8e8272] truncate">{b.ridiculousForm}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleStartEncounter}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-cinzel text-sm font-bold rounded shadow-lg transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Step Forward & Draw Wand</span>
            </button>
          </div>
        </div>
      )}

      {stage === 'facing' && (
        <div className="space-y-6">
          <div className="bg-[#18151c] border border-red-900/40 rounded-lg p-6 text-center space-y-4 relative overflow-hidden">
            <div className="text-xs uppercase tracking-widest text-red-400 font-cinzel">
              Wardrobe Burst Open!
            </div>
            <div className="text-6xl animate-bounce">{selectedBoggart.icon}</div>
            <h3 className="font-cinzel text-2xl text-red-300 font-bold">{selectedBoggart.name}</h3>
            <p className="text-sm font-garamond italic max-w-lg mx-auto text-[#cbbead]">
              {selectedBoggart.description}
            </p>

            <div className="p-4 bg-[#211a14] border border-amber-600/30 rounded max-w-md mx-auto text-xs text-amber-200">
              <span className="font-bold">Your Comic Counter-Plan:</span>{' '}
              {selectedBoggart.ridiculousForm}
            </div>

            <div className="pt-4">
              <button
                onClick={handleCastRiddikulus}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-cinzel font-black tracking-widest text-base rounded shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 animate-pulse"
              >
                SHOUT: “RIDDIKULUS!” 🪄
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === 'casting' && (
        <div className="bg-[#18151c] border border-amber-500/50 rounded-lg p-8 text-center space-y-5">
          <div className="text-4xl animate-spin">🪄</div>
          <h3 className="font-cinzel text-xl text-amber-300 font-bold">
            Channeling Pure Laughter & Wand Flourish...
          </h3>
          <div className="w-full max-w-md mx-auto bg-[#231b14] h-4 rounded-full overflow-hidden border border-amber-600/40">
            <div
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 h-full transition-all duration-200"
              style={{ width: `${spellPower}%` }}
            />
          </div>
          <p className="text-xs font-garamond italic text-[#a39482]">
            Flicking wand forward with uncontrollable amusement!
          </p>
        </div>
      )}

      {stage === 'triumph' && (
        <div className="bg-[#151f18] border border-emerald-600/40 rounded-lg p-7 text-center space-y-5">
          <div className="text-6xl animate-bounce">{selectedBoggart.ridiculousIcon}</div>
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-cinzel text-lg font-bold">
            <Laugh className="w-5 h-5 text-yellow-400 animate-spin" />
            <span>CRACK! The Boggart Transforms!</span>
          </div>
          <h3 className="font-cinzel text-2xl text-amber-200 font-bold">
            {selectedBoggart.ridiculousForm}
          </h3>
          <p className="text-sm font-garamond text-[#c8bcab] max-w-lg mx-auto">
            The entire staffroom erupts into roaring laughter! Neville claps, Hermione beams, and the Boggart lets out a confused squeak before dissolving into a puff of harmless blue smoke, vanishing back into the wardrobe!
          </p>

          <div className="p-4 bg-[#1f2820] border border-emerald-500/30 rounded max-w-md mx-auto text-xs text-emerald-300 space-y-1">
            <div className="font-bold flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Lesson Completed!</span>
            </div>
            <div>+20 House Points Awarded by Professor Lupin</div>
            <div>Unlocked: Boggart Banisher Mastery</div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-emerald-100 font-cinzel text-sm font-bold rounded shadow-lg transition-all"
            >
              Continue Adventure
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
