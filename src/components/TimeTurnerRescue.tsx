import React, { useState } from 'react';
import { soundEngine } from '../utils/audio';
import { Sparkles, Clock, CheckCircle, Wind, ShieldCheck } from 'lucide-react';

interface TimeTurnerRescueProps {
  onComplete: (housePoints: number, resultText: string) => void;
  onClose?: () => void;
}

type Step = 'hourglass' | 'pumpkin_patch' | 'dark_tower' | 'triumph';

export const TimeTurnerRescue: React.FC<TimeTurnerRescueProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState<Step>('hourglass');
  const [turnCount, setTurnCount] = useState(0);
  const [stealthProgress, setStealthProgress] = useState(0);

  const handleTurnHourglass = () => {
    soundEngine.playParchmentRustle();
    const next = turnCount + 1;
    setTurnCount(next);

    if (next >= 3) {
      soundEngine.playPatronusBurst();
      setTimeout(() => {
        setStep('pumpkin_patch');
      }, 900);
    }
  };

  const handleSneakPumpkin = () => {
    soundEngine.playSpellCast('charm');
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setStealthProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        soundEngine.playHippogriffSwoop();
        setStep('dark_tower');
      }
    }, 220);
  };

  const handleUnlockSirius = () => {
    soundEngine.playSpellCast('force');
    setTimeout(() => {
      soundEngine.playHippogriffSwoop();
      setStep('triumph');
    }, 800);
  };

  const handleFinish = () => {
    onComplete(
      50,
      'You turned back the sands of time with Hermione Granger, rescued Buckbeak from the executioner, and freed Sirius Black into the night sky!'
    );
  };

  return (
    <div className="bg-[#10121c] border border-amber-600/40 rounded-lg p-5 sm:p-7 shadow-2xl max-w-4xl mx-auto my-4 text-[#ded5c7]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#2d241c] pb-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#201912] flex items-center justify-center text-2xl border border-amber-500/40">
            ⏳
          </div>
          <div>
            <h2 className="font-cinzel text-xl text-amber-200 font-bold tracking-wide">
              The Hourglass of Time & The Dark Tower
            </h2>
            <p className="text-xs text-[#a09080] font-garamond italic">
              Ministry Time-Turner Rescue Sequence · “Three turns should do it.”
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[#8e8070] hover:text-amber-200 px-2 py-1 text-xs">
            ✕
          </button>
        )}
      </div>

      {step === 'hourglass' && (
        <div className="space-y-6 text-center">
          <div className="bg-[#171520] border border-amber-600/40 rounded-lg p-8 space-y-4">
            <div className="text-6xl animate-spin">⏳✨</div>
            <h3 className="font-cinzel text-xl text-amber-200 font-bold">
              Hermione’s Golden Time-Turner
            </h3>
            <p className="text-sm font-garamond italic text-[#c8bcab] max-w-lg mx-auto">
              Hermione loops the golden chain around your neck. The miniature hourglass spins in its concentric rings, sand sparkling with pure temporal magic.
            </p>

            <div className="p-3 bg-[#241a12] border border-amber-600/30 rounded max-w-xs mx-auto text-xs text-amber-300 font-cinzel">
              Turns Completed: {turnCount} / 3
            </div>

            <div className="pt-2">
              <button
                onClick={handleTurnHourglass}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-cinzel font-bold text-sm rounded shadow-lg transition-all transform hover:scale-105"
              >
                Turn Hourglass ({turnCount + 1} of 3) ⏳
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'pumpkin_patch' && (
        <div className="space-y-6">
          <div className="bg-[#171520] border border-[#3b2e22] rounded-lg p-6 space-y-4 text-center">
            <div className="text-5xl">🎃🪓</div>
            <h3 className="font-cinzel text-xl text-amber-200 font-bold">
              The Pumpkin Patch at Sunset
            </h3>
            <p className="text-sm font-garamond italic text-[#c8bcab] max-w-lg mx-auto">
              You are three hours in the past! Down by Hagrid’s hut, the executioner Macnair and Minister Fudge are walking toward the cabin door. Buckbeak is tethered among the giant pumpkins.
            </p>

            {stealthProgress > 0 && (
              <div className="max-w-md mx-auto space-y-1">
                <div className="flex justify-between text-xs font-cinzel text-amber-300">
                  <span>Untying Buckbeak & Slipping into Woods</span>
                  <span>{stealthProgress}%</span>
                </div>
                <div className="w-full bg-[#201812] h-2.5 rounded-full overflow-hidden border border-[#3e2e20]">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-200"
                    style={{ width: `${stealthProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleSneakPumpkin}
                disabled={stealthProgress > 0}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-emerald-100 font-cinzel text-xs font-bold rounded shadow transition-all"
              >
                Distract Executioner & Untie Buckbeak
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'dark_tower' && (
        <div className="space-y-6 text-center">
          <div className="bg-[#141829] border border-sky-800/40 rounded-lg p-6 space-y-4">
            <div className="text-6xl animate-pulse">🏰🦅🗝️</div>
            <h3 className="font-cinzel text-xl text-sky-200 font-bold">
              The Dark Tower: Flitwick’s High Window
            </h3>
            <p className="text-sm font-garamond italic text-[#c8bcab] max-w-lg mx-auto">
              You soar on Buckbeak’s back up to the highest tower window! Behind the iron bars sits Sirius Black, expecting the Dementor’s Kiss at dawn.
            </p>
            <p className="text-xs font-garamond italic text-sky-300">
              Aim your wand at the lock: “Alohomora!”
            </p>

            <div className="pt-2">
              <button
                onClick={handleUnlockSirius}
                className="px-8 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-cinzel font-bold text-sm rounded shadow-lg transition-all"
              >
                BLAST LOCK: “ALOHOMORA!” 🗝️
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'triumph' && (
        <div className="bg-[#151f18] border border-emerald-600/40 rounded-lg p-7 text-center space-y-5">
          <div className="text-7xl animate-bounce">🌌🦅✨</div>
          <div className="text-emerald-400 font-cinzel text-xl font-bold">
            TWO INNOCENT LIVES SAVED!
          </div>
          <h3 className="font-cinzel text-2xl text-amber-200 font-bold">
            Sirius Black Takes Flight into the Stars
          </h3>
          <p className="text-sm font-garamond text-[#c8bcab] max-w-lg mx-auto">
            Sirius clambers onto Buckbeak’s back. With a magnificent leap, the Hippogriff wheels around against the full moon and vanishes into the high clouds, flying to freedom. You sprint back to the Hospital Wing just as the heavy doors click shut!
          </p>

          <div className="p-4 bg-[#1f2820] border border-emerald-500/30 rounded max-w-md mx-auto text-xs text-emerald-300 space-y-1">
            <div className="font-bold flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Dumbledore’s Mission Accomplished</span>
            </div>
            <div>+50 House Points Awarded</div>
            <div>Dumbledore whispers: “Well done. Outstanding work, all three of you.”</div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-emerald-100 font-cinzel text-sm font-bold rounded shadow-lg transition-all"
            >
              Complete the Third Year Adventure
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
