import React, { useState } from 'react';
import { soundEngine } from '../utils/audio';
import { Sparkles, Wind, Eye, CheckCircle, ShieldCheck } from 'lucide-react';

interface HippogriffLessonProps {
  onComplete: (housePoints: number, resultText: string) => void;
  onClose?: () => void;
}

type Stage = 'approach' | 'bow' | 'reaction' | 'stroke' | 'flight' | 'triumph';

export const HippogriffLesson: React.FC<HippogriffLessonProps> = ({ onComplete, onClose }) => {
  const [stage, setStage] = useState<Stage>('approach');
  const [eyeContactProgress, setEyeContactProgress] = useState(0);
  const [isBowing, setIsBowing] = useState(false);
  const [flightAltitude, setFlightAltitude] = useState(50);
  const [flightSpeed, setFlightSpeed] = useState(50);
  const [flightLogs, setFlightLogs] = useState<string[]>([]);

  const handleStepApproach = () => {
    soundEngine.playParchmentRustle();
    const interval = setInterval(() => {
      setEyeContactProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStage('bow');
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleExecuteBow = () => {
    setIsBowing(true);
    soundEngine.playParchmentRustle();
    setTimeout(() => {
      soundEngine.playHippogriffSwoop();
      setStage('reaction');
    }, 1400);
  };

  const handleStrokeBeak = () => {
    soundEngine.playParchmentRustle();
    setStage('stroke');
    setTimeout(() => {
      setStage('flight');
      soundEngine.playHippogriffSwoop();
      setFlightLogs([
        'Buckbeak leaps into the air with a mighty clap of wings!',
        'Rising high above Hagrid’s cabin into the crisp Scottish sky.',
      ]);
    }, 1200);
  };

  const handleFlightAction = (action: 'soar' | 'dive' | 'bank') => {
    soundEngine.playHippogriffSwoop();
    if (action === 'soar') {
      setFlightAltitude((prev) => Math.min(prev + 20, 100));
      setFlightLogs((prev) => [
        'Buckbeak catches a thermal rising toward the clouds above the Astronomy Tower!',
        ...prev.slice(0, 3),
      ]);
    } else if (action === 'dive') {
      setFlightAltitude((prev) => Math.max(prev - 20, 15));
      setFlightLogs((prev) => [
        'Swooping down to skim the glassy, mist-covered surface of the Black Lake! Talons brushing water!',
        ...prev.slice(0, 3),
      ]);
    } else {
      setFlightSpeed((prev) => Math.min(prev + 20, 100));
      setFlightLogs((prev) => [
        'Banking sharply around the stone viaduct arches! Hagrid is cheering wildly from the paddock below!',
        ...prev.slice(0, 3),
      ]);
    }
  };

  const handleFinishFlight = () => {
    soundEngine.playHippogriffSwoop();
    setStage('triumph');
  };

  const handleCompleteAll = () => {
    onComplete(
      25,
      'You earned the respect of Buckbeak the Hippogriff, bowing with true reverence and soaring majestically over the Black Lake and Hogwarts towers!'
    );
  };

  return (
    <div className="bg-[#121118] border border-[#3e3226] rounded-lg p-5 sm:p-7 shadow-2xl max-w-4xl mx-auto my-4 text-[#ded5c7]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#2d241c] pb-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#251e18] flex items-center justify-center text-2xl border border-amber-600/30">
            🦅
          </div>
          <div>
            <h2 className="font-cinzel text-xl text-amber-200 font-bold tracking-wide">
              Hagrid’s Lesson: Buckbeak the Hippogriff
            </h2>
            <p className="text-xs text-[#a09080] font-garamond italic">
              Care of Magical Creatures · Paddock & Flight Experience
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[#8e8070] hover:text-amber-200 px-2 py-1 text-xs">
            ✕
          </button>
        )}
      </div>

      {/* Stage: Approach */}
      {stage === 'approach' && (
        <div className="space-y-6">
          <div className="bg-[#18161e] border border-[#362c22] rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-48 h-48 bg-[#201912] rounded-full border-4 border-amber-700/40 flex flex-col items-center justify-center text-7xl shadow-inner">
              🦅
            </div>
            <div className="flex-1 space-y-3">
              <div className="text-amber-400 font-cinzel text-sm flex items-center gap-2">
                <span className="text-xl">🪓</span>
                <span>Professor Rubeus Hagrid:</span>
              </div>
              <blockquote className="border-l-2 border-amber-600/40 pl-3 italic text-sm text-[#c8bcab] font-garamond">
                “Look right at ‘im, Rowan. First rule o’ Hippogriffs: they’re proud beasts. Don’t blink! If yeh blink too much, he thinks yeh don’t trust ‘im. Walk forward real slow, and keep yer eyes locked on his.”
              </blockquote>
              <p className="text-xs text-[#9d8d7b]">
                Focus your unwavering gaze on Buckbeak’s fierce amber eagle eyes.
              </p>

              {eyeContactProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-cinzel text-amber-300">
                    <span>Unblinking Eye Contact</span>
                    <span>{eyeContactProgress}%</span>
                  </div>
                  <div className="w-full bg-[#201812] h-2.5 rounded-full overflow-hidden border border-[#3e2e20]">
                    <div
                      className="bg-amber-500 h-full transition-all duration-200"
                      style={{ width: `${eyeContactProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleStepApproach}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-cinzel text-sm font-bold rounded shadow-lg transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Step Forward Without Blinking</span>
            </button>
          </div>
        </div>
      )}

      {/* Stage: Bow */}
      {stage === 'bow' && (
        <div className="space-y-6">
          <div className="bg-[#18161e] border border-[#362c22] rounded-lg p-6 text-center space-y-4">
            <div className="text-6xl animate-pulse">🦅</div>
            <h3 className="font-cinzel text-xl text-amber-300 font-bold">
              Buckbeak Watches You Unflinchingly
            </h3>
            <p className="text-sm font-garamond italic text-[#c8bcab] max-w-lg mx-auto">
              His sharp steel talons dig into the turf. His razor beak clicks once. He is waiting to see if you show the proper deference due to his noble species.
            </p>

            <div className="pt-2">
              <button
                onClick={handleExecuteBow}
                disabled={isBowing}
                className="px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-cinzel font-bold text-sm rounded shadow-lg transition-all"
              >
                {isBowing ? 'Bowing Deeply at the Waist...' : 'Bow Deeply & Wait'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage: Reaction */}
      {stage === 'reaction' && (
        <div className="space-y-6">
          <div className="bg-[#141e17] border border-emerald-600/40 rounded-lg p-6 text-center space-y-4">
            <div className="text-7xl animate-bounce">🦅✨</div>
            <h3 className="font-cinzel text-2xl text-emerald-300 font-bold">
              Buckbeak Bows His Head!
            </h3>
            <p className="text-sm font-garamond italic text-[#c8bcab] max-w-lg mx-auto">
              For two breathless seconds, Buckbeak shifts on his hind legs. Then, slowly and gracefully, he bends his front eagle knees and sinks his feathered head all the way to the grass!
            </p>
            <div className="p-3 bg-[#1e2a22] border border-emerald-500/30 rounded max-w-md mx-auto text-xs text-emerald-300">
              Hagrid claps his enormous hands together: “Good boy, Rowan! Well done! Go on, give ‘im a pat on the beak!”
            </div>

            <div className="pt-2">
              <button
                onClick={handleStrokeBeak}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-emerald-100 font-cinzel text-sm font-bold rounded shadow-lg transition-all"
              >
                Gently Stroke His Feathers & Beak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage: Stroke */}
      {stage === 'stroke' && (
        <div className="bg-[#18161e] border border-amber-600/40 rounded-lg p-8 text-center space-y-4">
          <div className="text-5xl animate-pulse">🪶</div>
          <h3 className="font-cinzel text-xl text-amber-300 font-bold">
            Feathers Warm as Sun-Baked Stone
          </h3>
          <p className="text-sm font-garamond italic text-[#c8bcab] max-w-lg mx-auto">
            Buckbeak closes his orange eyes contentedly as you stroke his feathered brow. Hagrid lifts you up effortlessly onto the glossy gray feathers behind the wings.
          </p>
          <div className="text-xs text-amber-400 font-cinzel animate-pulse">
            “Hold on tight to his neck, Rowan! Off yeh go!”
          </div>
        </div>
      )}

      {/* Stage: Flight */}
      {stage === 'flight' && (
        <div className="space-y-6">
          <div className="bg-[#141724] border border-sky-800/40 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sky-900/40 pb-2">
              <div className="flex items-center gap-2 text-sky-300 font-cinzel text-sm font-bold">
                <Wind className="w-4 h-4 text-sky-400 animate-spin" />
                <span>Soaring Above Hogwarts Castle & Black Lake</span>
              </div>
              <div className="text-xs text-sky-400 font-cinzel">
                Altitude: {flightAltitude}% · Wind Velocity: {flightSpeed}%
              </div>
            </div>

            {/* Flight altitude visually */}
            <div className="relative h-44 bg-gradient-to-b from-indigo-950 via-slate-900 to-teal-950 rounded border border-sky-900/50 overflow-hidden flex flex-col justify-between p-3">
              <div className="text-[11px] font-cinzel text-sky-300/60">Clouds & Astronomy Spire</div>
              <div
                className="text-4xl transition-all duration-300 flex items-center justify-center"
                style={{ transform: `translateY(${50 - flightAltitude * 0.4}px)` }}
              >
                🦅
              </div>
              <div className="text-[11px] font-cinzel text-teal-300/60">Glassy Surface of the Black Lake</div>
            </div>

            {/* Flight controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleFlightAction('soar')}
                className="p-2.5 bg-[#1b2234] border border-sky-600/40 hover:border-sky-400 rounded text-xs font-cinzel text-sky-200 transition-colors"
              >
                ☁️ Soar Higher into the Clouds
              </button>
              <button
                onClick={() => handleFlightAction('dive')}
                className="p-2.5 bg-[#1b2234] border border-sky-600/40 hover:border-sky-400 rounded text-xs font-cinzel text-sky-200 transition-colors"
              >
                🌊 Skim the Waters of Black Lake
              </button>
              <button
                onClick={() => handleFlightAction('bank')}
                className="p-2.5 bg-[#1b2234] border border-sky-600/40 hover:border-sky-400 rounded text-xs font-cinzel text-sky-200 transition-colors"
              >
                🏰 Bank Around Castle Arches
              </button>
            </div>

            {/* Flight commentary log */}
            <div className="bg-[#0f121d] rounded p-3 text-xs font-garamond italic text-[#b5c2d6] space-y-1">
              {flightLogs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-sky-400">✦</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleFinishFlight}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-700 to-indigo-600 hover:from-sky-600 hover:to-indigo-500 text-sky-100 font-cinzel text-sm font-bold rounded shadow-lg transition-all"
              >
                Glide Down to Land Safely
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage: Triumph */}
      {stage === 'triumph' && (
        <div className="bg-[#151f18] border border-emerald-600/40 rounded-lg p-7 text-center space-y-5">
          <div className="text-6xl animate-bounce">🏆🦅</div>
          <div className="text-emerald-400 font-cinzel text-lg font-bold">
            A Flawless Landing in the Paddock!
          </div>
          <h3 className="font-cinzel text-2xl text-amber-200 font-bold">
            You Are a Bonded Hippogriff Rider
          </h3>
          <p className="text-sm font-garamond text-[#c8bcab] max-w-lg mx-auto">
            Buckbeak touches down gently with a soft rustle of feathers. Hagrid’s eyes are glistening with happy tears, while Harry and Hermione applaud enthusiastically. Even Malfoy scowls in bitter silence, unable to find fault with your courage!
          </p>

          <div className="p-4 bg-[#1f2820] border border-emerald-500/30 rounded max-w-md mx-auto text-xs text-emerald-300 space-y-1">
            <div className="font-bold flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Care of Magical Creatures Practicum Passed</span>
            </div>
            <div>+25 House Points Awarded</div>
            <div>Bond Formed: Buckbeak the Hippogriff</div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCompleteAll}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-emerald-100 font-cinzel text-sm font-bold rounded shadow-lg transition-all"
            >
              Return to Adventure
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
