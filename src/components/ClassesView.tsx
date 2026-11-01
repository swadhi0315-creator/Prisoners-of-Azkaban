import React, { useState } from 'react';
import { soundEngine } from '../utils/audio';
import { GraduationCap, Sparkles, BookOpen, CheckCircle } from 'lucide-react';

interface ClassesViewProps {
  onLaunchBoggart: () => void;
  onLaunchHippogriff: () => void;
  onLaunchPatronus: () => void;
  onAwardPoints: (points: number, reason: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  onLaunchBoggart,
  onLaunchHippogriff,
  onLaunchPatronus,
  onAwardPoints,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'potions' | 'divination'>('schedule');
  const [teaLeafResult, setTeaLeafResult] = useState<string | null>(null);
  const [potionSteps, setPotionSteps] = useState<{ step: number; complete: boolean }>({ step: 1, complete: false });

  const handleReadTeaLeaves = () => {
    soundEngine.playParchmentRustle();
    const omens = [
      'The Grim! A colossal, ghostly black dog looming in the bottom of your cup—an omen of grave danger and mortality!',
      'A Falcon! You have a deadly enemy, but wings to soar above them if you remain watchful.',
      'A Club! An attack is imminent; keep your wand within reach when walking the corridors after dark.',
      'The Acorn! Unexpected gold and a loyal alliance from an unforeseen source.',
    ];
    const picked = omens[Math.floor(Math.random() * omens.length)];
    setTeaLeafResult(picked);
    onAwardPoints(5, 'Attending Divination and interpreting the dregs');
  };

  const handleAdvancePotion = (step: number) => {
    soundEngine.playSpellCast('spark');
    if (step === 3) {
      setPotionSteps({ step: 3, complete: true });
      onAwardPoints(15, 'Brewing a flawless emerald Shrinking Solution for Snape');
    } else {
      setPotionSteps({ step: step + 1, complete: false });
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-4 px-2 sm:px-4 space-y-6">
      {/* Header bar */}
      <div className="bg-[#14121a] border border-[#3b2e22] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="font-cinzel text-xl text-amber-200 font-bold tracking-wide flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <span>Third-Year Hogwarts Curriculum</span>
          </h2>
          <p className="text-xs text-[#a09080] font-garamond italic">
            Term 1993–1994 · Master defensive magic, dangerous beasts, and complex brews.
          </p>
        </div>

        <div className="flex gap-2 text-xs font-cinzel">
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSubTab === 'schedule'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50'
                : 'bg-[#1b171c] text-[#8e8070] border border-[#2e241c]'
            }`}
          >
            Class Roster
          </button>
          <button
            onClick={() => setActiveSubTab('potions')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSubTab === 'potions'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50'
                : 'bg-[#1b171c] text-[#8e8070] border border-[#2e241c]'
            }`}
          >
            Potions Lab
          </button>
          <button
            onClick={() => setActiveSubTab('divination')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSubTab === 'divination'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50'
                : 'bg-[#1b171c] text-[#8e8070] border border-[#2e241c]'
            }`}
          >
            Tea Leaves & Divination
          </button>
        </div>
      </div>

      {activeSubTab === 'schedule' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Defense Against the Dark Arts Card */}
          <div className="bg-[#16131c] border border-amber-700/40 rounded-lg p-5 space-y-4 hover:border-amber-500 transition-colors shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel uppercase tracking-widest text-amber-400 font-bold">
                Defense Against the Dark Arts
              </span>
              <span className="text-xs font-garamond italic text-[#a09080]">Prof. Lupin</span>
            </div>
            <h3 className="font-cinzel text-lg text-amber-200 font-bold">
              The Boggart Wardrobe & The Patronus
            </h3>
            <p className="text-xs font-garamond italic text-[#c5b8a5]">
              Practice practical defense against shapeshifting Boggarts with the comic “Riddikulus” charm, and train in the legendary Patronus Charm to repel soul-freezing Dementors.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={onLaunchBoggart}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-cinzel text-xs font-bold rounded shadow transition-all"
              >
                Face Lupin’s Boggart 🚪
              </button>
              <button
                onClick={onLaunchPatronus}
                className="px-3.5 py-1.5 bg-gradient-to-r from-sky-700 to-indigo-600 hover:from-sky-600 hover:to-indigo-500 text-sky-100 font-cinzel text-xs font-bold rounded shadow transition-all"
              >
                Practice Expecto Patronum 🪄
              </button>
            </div>
          </div>

          {/* Care of Magical Creatures Card */}
          <div className="bg-[#16131c] border border-emerald-800/40 rounded-lg p-5 space-y-4 hover:border-emerald-600 transition-colors shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel uppercase tracking-widest text-emerald-400 font-bold">
                Care of Magical Creatures
              </span>
              <span className="text-xs font-garamond italic text-[#a09080]">Prof. Hagrid</span>
            </div>
            <h3 className="font-cinzel text-lg text-emerald-200 font-bold">
              Hippogriffs & The Monster Book
            </h3>
            <p className="text-xs font-garamond italic text-[#c5b8a5]">
              Learn how to soothe snapping textbooks by stroking their spine, and master the etiquette of bowing to Buckbeak the Hippogriff before taking flight across the Black Lake.
            </p>
            <div className="pt-1">
              <button
                onClick={onLaunchHippogriff}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-emerald-100 font-cinzel text-xs font-bold rounded shadow transition-all"
              >
                Approach Buckbeak in Paddock 🦅
              </button>
            </div>
          </div>

          {/* Potions Card */}
          <div className="bg-[#16131c] border border-[#3d2e22] rounded-lg p-5 space-y-4 hover:border-amber-600/50 transition-colors shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel uppercase tracking-widest text-purple-400 font-bold">
                Potions
              </span>
              <span className="text-xs font-garamond italic text-[#a09080]">Prof. Snape</span>
            </div>
            <h3 className="font-cinzel text-lg text-purple-200 font-bold">
              Shrinking Solution & Wolfsbane Lore
            </h3>
            <p className="text-xs font-garamond italic text-[#c5b8a5]">
              Dice daisy roots, peel Shrivelfig, and slice dead caterpillars to turn your cauldron bright acid green without incurring Snape’s wrath.
            </p>
            <div className="pt-1">
              <button
                onClick={() => setActiveSubTab('potions')}
                className="px-3.5 py-1.5 bg-[#251e18] hover:bg-[#322820] text-amber-200 font-cinzel text-xs font-bold rounded border border-[#483726] transition-all"
              >
                Enter Cauldron Brewing 🧪
              </button>
            </div>
          </div>

          {/* Divination Card */}
          <div className="bg-[#16131c] border border-[#3d2e22] rounded-lg p-5 space-y-4 hover:border-amber-600/50 transition-colors shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel uppercase tracking-widest text-amber-400 font-bold">
                Divination
              </span>
              <span className="text-xs font-garamond italic text-[#a09080]">Prof. Trelawney</span>
            </div>
            <h3 className="font-cinzel text-lg text-amber-200 font-bold">
              Tasseomancy: Reading the Dregs
            </h3>
            <p className="text-xs font-garamond italic text-[#c5b8a5]">
              Climb to the stifling North Tower, sip hot tea, and decipher shadows in wet leaves for omens of the Grim and impending omens.
            </p>
            <div className="pt-1">
              <button
                onClick={() => setActiveSubTab('divination')}
                className="px-3.5 py-1.5 bg-[#251e18] hover:bg-[#322820] text-amber-200 font-cinzel text-xs font-bold rounded border border-[#483726] transition-all"
              >
                Swirl Teacup & Read Omens 🔮
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Potions Brewing Lab */}
      {activeSubTab === 'potions' && (
        <div className="bg-[#14121a] border border-[#3b2e22] rounded-lg p-6 space-y-5 shadow-2xl">
          <div className="border-b border-[#2d231b] pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-cinzel text-xl font-bold text-amber-200">
                Brewing Shrinking Solution
              </h3>
              <p className="text-xs text-[#a09080] font-garamond italic">
                Cauldron bubbling at a low simmer · Standard Book of Spells Grade 3
              </p>
            </div>
            <span className="text-3xl">🧪</span>
          </div>

          {!potionSteps.complete ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#1a1722] border border-[#3b2e22] rounded text-xs space-y-2">
                <div className="font-cinzel text-amber-400 font-bold">
                  Step {potionSteps.step} of 3:
                </div>
                {potionSteps.step === 1 && (
                  <p className="text-[#cfc0ae] font-garamond italic">
                    Finely dice daisy roots and peel Shrivelfig skin with silver knife. Add to the cauldron and stir counter-clockwise three times.
                  </p>
                )}
                {potionSteps.step === 2 && (
                  <p className="text-[#cfc0ae] font-garamond italic">
                    Add four sliced caterpillars and one dash of leech juice. Watch for the smoke to shift from dark crimson to lime green.
                  </p>
                )}
                {potionSteps.step === 3 && (
                  <p className="text-[#cfc0ae] font-garamond italic">
                    Wave wand over cauldron in a figure-eight and adjust fire to extinguish the simmer.
                  </p>
                )}
              </div>

              <button
                onClick={() => handleAdvancePotion(potionSteps.step)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-emerald-100 font-cinzel text-xs font-bold rounded shadow transition-all"
              >
                {potionSteps.step === 3 ? 'Finalize & Bottle Solution' : `Execute Step ${potionSteps.step}`}
              </button>
            </div>
          ) : (
            <div className="p-5 bg-emerald-950/60 border border-emerald-600/40 rounded-lg text-center space-y-3">
              <div className="text-4xl">✨🧪✨</div>
              <h4 className="font-cinzel text-lg font-bold text-emerald-300">
                A Perfect Vivid Acid Green Solution!
              </h4>
              <p className="text-xs font-garamond italic text-[#c8d9c5]">
                Snape passes your workbench, pauses, curls his lip in reluctant respect, and marks your parchment with an ‘Exceeds Expectations’.
              </p>
              <div className="text-xs font-cinzel text-amber-300 font-bold">
                +15 House Points Awarded
              </div>
              <button
                onClick={() => setPotionSteps({ step: 1, complete: false })}
                className="px-4 py-1.5 bg-[#251e18] text-amber-200 text-xs font-cinzel rounded border border-[#483726]"
              >
                Brew Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Divination Teacup Reader */}
      {activeSubTab === 'divination' && (
        <div className="bg-[#14121a] border border-[#3b2e22] rounded-lg p-6 space-y-5 shadow-2xl text-center">
          <div className="text-5xl animate-pulse">🔮🍵</div>
          <h3 className="font-cinzel text-xl font-bold text-amber-200">
            Tasseomancy in the North Tower
          </h3>
          <p className="text-xs font-garamond italic text-[#c5b8a5] max-w-md mx-auto">
            Drain the scalding spiced tea until only the soggy dregs remain at the bottom of your porcelain cup. Swirl the cup three times counter-clockwise, overturn it on the saucer, and peer inside.
          </p>

          <button
            onClick={handleReadTeaLeaves}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-cinzel text-xs font-bold rounded shadow transition-all"
          >
            Swirl Cup & Read the Leaves
          </button>

          {teaLeafResult && (
            <div className="p-4 bg-[#1f1926] border border-amber-600/50 rounded-lg max-w-lg mx-auto text-xs font-garamond italic text-amber-100 space-y-1 animate-fadeIn">
              <div className="font-cinzel text-amber-400 font-bold not-italic">
                Professor Trelawney gasps:
              </div>
              <p>“{teaLeafResult}”</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
