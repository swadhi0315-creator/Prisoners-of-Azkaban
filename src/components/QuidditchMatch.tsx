import React, { useState, useEffect } from 'react';
import { soundEngine } from '../utils/audio';
import { Wind, Zap, Award, Sparkles, Shield, AlertTriangle } from 'lucide-react';

interface QuidditchMatchProps {
  onComplete: (housePoints: number, resultText: string) => void;
  onClose?: () => void;
}

export const QuidditchMatch: React.FC<QuidditchMatchProps> = ({ onComplete, onClose }) => {
  const [altitude, setAltitude] = useState(60);
  const [snitchDistance, setSnitchDistance] = useState(85);
  const [weatherIntensity, setWeatherIntensity] = useState<'Stormy' | 'Torrential' | 'Dementor Freeze'>('Stormy');
  const [score, setScore] = useState({ home: 90, away: 80 });
  const [dementorAlert, setDementorAlert] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    'Match begins under darkening November skies! Gryffindor vs Hufflepuff.',
    'Rain sweeps sideways across the pitch in icy sheets.',
  ]);
  const [gameWon, setGameWon] = useState(false);

  // Storm lightning flicker
  const [lightning, setLightning] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setLightning(true);
      setTimeout(() => setLightning(false), 150);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleManeuver = (action: 'climb' | 'dive' | 'boost') => {
    soundEngine.playSpellCast('force');
    if (action === 'climb') {
      setAltitude((prev) => Math.min(prev + 15, 100));
      setLogs((prev) => ['Climbing through freezing rain above the goal hoops!', ...prev.slice(0, 3)]);
    } else if (action === 'dive') {
      setAltitude((prev) => Math.max(prev - 15, 10));
      setLogs((prev) => ['Executing steep Hawk-dive beneath incoming Bludger!', ...prev.slice(0, 3)]);
    } else {
      soundEngine.playSnitchFlutter();
      setSnitchDistance((prev) => Math.max(prev - 25, 0));
      setLogs((prev) => ['Leaning flat against broom handle, closing in on the Golden Snitch!', ...prev.slice(0, 3)]);

      if (snitchDistance <= 30 && !dementorAlert) {
        setDementorAlert(true);
        setWeatherIntensity('Dementor Freeze');
        soundEngine.playDementorChill();
        setLogs((prev) => [
          '⚠️ ALARM: Over a hundred cloaked Dementors drift through the storm clouds onto the pitch!',
          ...prev.slice(0, 3),
        ]);
      }
    }
  };

  const handleCatchSnitch = () => {
    soundEngine.playSnitchFlutter();
    setScore((prev) => ({ ...prev, home: prev.home + 150 }));
    setGameWon(true);
  };

  const handleCastPatronusOnPitch = () => {
    soundEngine.playPatronusBurst();
    setLogs((prev) => [
      'You draw your wand mid-flight: "EXPECTO PATRONUM!" Silver mist scatters the creeping shadows!',
      ...prev.slice(0, 3),
    ]);
    setTimeout(() => {
      handleCatchSnitch();
    }, 1200);
  };

  const handleFinish = () => {
    onComplete(
      35,
      `You braved the historic Quidditch storm, repelled Dementors with a mid-flight defensive flare, and caught the Golden Snitch for your house!`
    );
  };

  return (
    <div className={`bg-[#0d101a] border border-[#2b3552] rounded-lg p-5 sm:p-7 shadow-2xl max-w-4xl mx-auto my-4 text-[#d9e2ec] transition-colors duration-150 ${lightning ? 'bg-[#1e2844]' : ''}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#252c42] pb-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#1c2238] flex items-center justify-center text-2xl border border-amber-400/40">
            🧹
          </div>
          <div>
            <h2 className="font-cinzel text-xl text-amber-200 font-bold tracking-wide">
              The Tempest on the Quidditch Pitch
            </h2>
            <p className="text-xs text-[#9bb1d1] font-garamond italic">
              Third Year Quidditch Cup · Gale Force Storm & The Dementor Descent
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-cinzel text-amber-400 px-2 py-0.5 bg-[#1b2238] rounded border border-amber-600/30">
            Score: {score.home} - {score.away}
          </span>
          {onClose && (
            <button onClick={onClose} className="text-[#8094b8] hover:text-amber-200 px-2 py-1 text-xs">
              ✕
            </button>
          )}
        </div>
      </div>

      {!gameWon ? (
        <div className="space-y-6">
          {/* Pitch Status Display */}
          <div className="bg-[#131828] border border-sky-900/60 rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-cinzel">
              <div className="flex items-center gap-2 text-sky-300">
                <Wind className="w-4 h-4 animate-spin text-sky-400" />
                <span>Conditions: {weatherIntensity}</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Altitude: {altitude} ft · Snitch Distance: {snitchDistance} yds</span>
              </div>
            </div>

            {/* Stadium Radar visual */}
            <div className="relative h-48 bg-gradient-to-b from-[#0b0e1b] via-[#11192e] to-[#0a121e] rounded border border-sky-800/40 overflow-hidden flex items-center justify-center">
              {/* Rain animation overlay */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Pitch elements */}
              <div
                className="absolute text-4xl transition-all duration-300"
                style={{ top: `${100 - altitude}%`, left: '35%' }}
              >
                🧹
              </div>

              {/* Golden Snitch */}
              <div
                className="absolute text-2xl transition-all duration-300 animate-bounce"
                style={{ top: `${altitude > 50 ? 25 : 65}%`, left: `${100 - snitchDistance * 0.8}%` }}
              >
                ✨🪙
              </div>

              {/* Dementors on pitch */}
              {dementorAlert && (
                <div className="absolute bottom-2 inset-x-0 flex justify-around text-4xl animate-pulse opacity-85">
                  <span>👻</span>
                  <span>👻</span>
                  <span>👻</span>
                  <span>👻</span>
                </div>
              )}
            </div>

            {/* Emergency Dementor Banner */}
            {dementorAlert && (
              <div className="p-3 bg-red-950/70 border border-red-600/50 rounded flex items-center justify-between text-xs text-red-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 animate-ping" />
                  <span>The air is freezing! Dementors are circling the pitch!</span>
                </div>
                <button
                  onClick={handleCastPatronusOnPitch}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-cinzel rounded font-bold transition-all shadow-md"
                >
                  Cast Patronus Flare! 🪄
                </button>
              </div>
            )}

            {/* Flying Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleManeuver('climb')}
                className="p-2.5 bg-[#1b2238] border border-sky-600/40 hover:border-sky-400 rounded text-xs font-cinzel text-sky-200"
              >
                ⬆️ Climb Broomstick into Clouddeck
              </button>
              <button
                onClick={() => handleManeuver('dive')}
                className="p-2.5 bg-[#1b2238] border border-sky-600/40 hover:border-sky-400 rounded text-xs font-cinzel text-sky-200"
              >
                ⬇️ Steep Dive to Dodge Bludger
              </button>
              <button
                onClick={() => handleManeuver('boost')}
                className="p-2.5 bg-[#1b2238] border border-amber-600/40 hover:border-amber-400 rounded text-xs font-cinzel text-amber-200"
              >
                🚀 Accelerate Toward the Snitch!
              </button>
            </div>

            {snitchDistance <= 15 && (
              <div className="text-center pt-2">
                <button
                  onClick={handleCatchSnitch}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-cinzel font-black tracking-widest text-base rounded shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse"
                >
                  GRASP THE GOLDEN SNITCH! 🪙
                </button>
              </div>
            )}

            {/* Commentary log */}
            <div className="bg-[#0c0e18] rounded p-3 text-xs font-garamond italic text-[#b5c2d6] space-y-1">
              {logs.map((l, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-amber-400">✦</span>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#151f18] border border-emerald-600/40 rounded-lg p-7 text-center space-y-5">
          <div className="text-7xl animate-bounce">🪙🏆</div>
          <div className="text-emerald-400 font-cinzel text-xl font-bold">
            THE GOLDEN SNITCH IS CAUGHT!
          </div>
          <h3 className="font-cinzel text-2xl text-amber-200 font-bold">
            Final Score: {score.home} — {score.away}
          </h3>
          <p className="text-sm font-garamond text-[#c8bcab] max-w-lg mx-auto">
            Your fingers clamp around the fluttering gold wings just as lightning splits the gloom! The stands erupt into wild cheering, and Dumbledore’s silver mist drives the Dementors from the grounds!
          </p>

          <div className="p-4 bg-[#1f2820] border border-emerald-500/30 rounded max-w-md mx-auto text-xs text-emerald-300 space-y-1">
            <div className="font-bold flex items-center justify-center gap-1">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Quidditch Match Victor!</span>
            </div>
            <div>+35 House Points Awarded</div>
            <div>Reputation Raised with Cedric Diggory & Harry Potter</div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-emerald-100 font-cinzel text-sm font-bold rounded shadow-lg transition-all"
            >
              Return to Common Room Feast
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
