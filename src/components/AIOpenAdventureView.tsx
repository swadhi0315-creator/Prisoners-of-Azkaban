import React, { useState, useRef, useEffect } from 'react';
import {
  PlayerCharacter,
  Relationship,
  AdventureMemory,
  AITurnResponse,
  SpontaneousEvent,
} from '../types';
import {
  generateLocalStoryTurn,
  spontaneousEventsCatalog,
} from '../utils/aiStoryEngine';
import { soundEngine } from '../utils/audio';
import {
  Feather,
  Sparkles,
  Send,
  Zap,
  MapPin,
  Compass,
  Eye,
  AlertTriangle,
  Users,
  Shield,
  MessageSquare,
  HelpCircle,
  Heart,
} from 'lucide-react';

interface AIOpenAdventureViewProps {
  character: PlayerCharacter;
  relationships: Relationship[];
  memory: AdventureMemory;
  currentLocation: string;
  isCurfew: boolean;
  onUpdateMemory: (updater: (prev: AdventureMemory) => AdventureMemory) => void;
  onUpdateRelationships: (
    updates: { characterId: string; nuancedChanges: any; summaryReason: string }[]
  ) => void;
  onAwardPoints: (points: number, reason: string) => void;
  onAddDetention: (amount: number) => void;
  onAddDiscovery: (clue: string) => void;
}

interface NarrativeLogEntry {
  id: string;
  timestamp: string;
  narrative: string[];
  characterSpeech?: { speaker: string; speech: string; expression: string }[];
  userAction?: string;
  consequences?: AITurnResponse['consequences'];
  relationshipNotes?: string[];
  spontaneousEvent?: SpontaneousEvent | null;
}

export const AIOpenAdventureView: React.FC<AIOpenAdventureViewProps> = ({
  character,
  relationships,
  memory,
  currentLocation,
  isCurfew,
  onUpdateMemory,
  onUpdateRelationships,
  onAwardPoints,
  onAddDetention,
  onAddDiscovery,
}) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSpontaneousEvent, setActiveSpontaneousEvent] = useState<SpontaneousEvent | null>(
    null
  );
  const [suggestedActions, setSuggestedActions] = useState<string[]>(() => {
    const list = [
      'Ask Professor Lupin about the Boggart’s true nature over tea',
      'Whisper to Hermione in the library about the strange rumors regarding Sirius Black',
      'Confront Draco Malfoy in the courtyard about his taunts toward Buckbeak',
      'Consult the Marauder’s Map to see who is pacing the third-floor corridor',
    ];
    if (character.romanticPartner) {
      list.unshift(
        `Meet ${character.romanticPartner.name} in the secret alcove behind the tapestry`,
        `Slip away to the Astronomy Tower with ${character.romanticPartner.name} to watch the stars`
      );
    }
    return list;
  });

  const [showRomanticOptions, setShowRomanticOptions] = useState(false);

  const [narrativeHistory, setNarrativeHistory] = useState<NarrativeLogEntry[]>([
    {
      id: 'entry_init',
      timestamp: 'Autumn Term 1993',
      narrative: [
        `The candles float high in the vaulted stone ceiling of Hogwarts. The Scottish highlands outside are wrapped in freezing November mists, and the Dementors of Azkaban patrol the outer iron gates like hollow shadows.`,
        `You stand in ${currentLocation}. The weight of your ${character.wand.wood} wand is warm against your palm. Every corridor whispers with secrets, rivalries, and the impending trial of Buckbeak the Hippogriff.`,
      ],
    },
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [narrativeHistory, isLoading]);

  // Handle free-form player turn
  const handleSubmitTurn = async (customText?: string) => {
    const textToSubmit = (customText || userInput).trim();
    if (!textToSubmit || isLoading) return;

    soundEngine.playParchmentRustle();
    setUserInput('');
    setIsLoading(true);

    try {
      let turnResponse: AITurnResponse | null = null;

      // 1. Try server-side Gemini API route first
      try {
        const res = await fetch('/api/adventure/turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userInput: textToSubmit,
            character,
            memory,
            currentLocation,
            relationships,
            isCurfew,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (!data.fallback && data.narrative) {
            turnResponse = data;
          }
        }
      } catch (err) {
        console.warn('Backend turn endpoint unavailable, using local engine:', err);
      }

      // 2. Intelligent client-side fallback if backend unavailable
      if (!turnResponse) {
        turnResponse = generateLocalStoryTurn(
          textToSubmit,
          character,
          memory,
          currentLocation
        );
      }

      // Process consequences
      if (turnResponse.consequences.housePointsChange) {
        onAwardPoints(
          turnResponse.consequences.housePointsChange,
          `Action: "${textToSubmit.slice(0, 35)}..."`
        );
      }
      if (turnResponse.consequences.detentionChange) {
        onAddDetention(turnResponse.consequences.detentionChange);
      }
      if (turnResponse.consequences.discoveredClue) {
        onAddDiscovery(turnResponse.consequences.discoveredClue);
      }

      // Update relationships
      if (turnResponse.relationshipUpdates.length > 0) {
        onUpdateRelationships(turnResponse.relationshipUpdates);
      }

      // Update memory
      onUpdateMemory((prev) => ({
        ...prev,
        recentLocations: [currentLocation, ...prev.recentLocations.slice(0, 4)],
        conversationLog: [
          {
            speaker: character.name,
            text: textToSubmit,
            location: currentLocation,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...(turnResponse?.characterSpeech || []).map((cs) => ({
            speaker: cs.speaker,
            text: cs.speech,
            location: currentLocation,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })),
          ...prev.conversationLog.slice(0, 10),
        ],
        uncoveredClues: turnResponse?.consequences.discoveredClue
          ? [turnResponse.consequences.discoveredClue, ...prev.uncoveredClues]
          : prev.uncoveredClues,
      }));

      // Check if spontaneous event should trigger (e.g. 25% chance or if response provided one)
      let triggeredSpont = turnResponse.spontaneousEvent;
      if (!triggeredSpont && Math.random() < 0.28) {
        const randEvent =
          spontaneousEventsCatalog[
            Math.floor(Math.random() * spontaneousEventsCatalog.length)
          ];
        triggeredSpont = randEvent;
        soundEngine.playSpellCast('charm');
      }

      if (triggeredSpont) {
        setActiveSpontaneousEvent(triggeredSpont);
      }

      // Record to narrative log
      const relationshipNotes = turnResponse.relationshipUpdates.map((u) => {
        const found = relationships.find((r) => r.id === u.characterId);
        return `${found?.name || u.characterId}: ${u.summaryReason}`;
      });

      const newEntry: NarrativeLogEntry = {
        id: `turn_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userAction: textToSubmit,
        narrative: turnResponse.narrative,
        characterSpeech: turnResponse.characterSpeech,
        consequences: turnResponse.consequences,
        relationshipNotes,
        spontaneousEvent: triggeredSpont,
      };

      setNarrativeHistory((prev) => [...prev, newEntry]);
      if (turnResponse.suggestedIntentions?.length > 0) {
        setSuggestedActions(turnResponse.suggestedIntentions);
      }
    } catch (err) {
      console.error('Error during story turn:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpontaneousChoice = (actionText: string) => {
    setActiveSpontaneousEvent(null);
    handleSubmitTurn(actionText);
  };

  return (
    <div className="max-w-5xl mx-auto my-4 px-2 sm:px-4 space-y-5">
      {/* HUD Header */}
      <div className="bg-[#14121a] border border-[#3b2e22] rounded-lg p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#201813] border border-amber-600/40 flex items-center justify-center text-xl shadow-inner">
            🪄
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel text-lg text-amber-200 font-bold tracking-wide">
                Live Interactive Chronicle
              </h2>
              <span className="text-[10px] font-cinzel px-2 py-0.5 bg-amber-950/70 border border-amber-600/40 text-amber-300 rounded font-semibold">
                AI Storyteller Engine
              </span>
            </div>
            <div className="text-xs text-[#a09080] font-garamond italic flex items-center gap-2 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Location: {currentLocation}</span>
              <span>·</span>
              <span className={isCurfew ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                {isCurfew ? 'Curfew Active' : 'Daytime Hours'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-cinzel text-[#b0a090]">
          <div className="px-3 py-1 bg-[#1c1613] rounded border border-[#3d2e20]">
            Secrets Uncovered: <span className="text-amber-300 font-bold">{memory.uncoveredClues.length}</span>
          </div>
        </div>
      </div>

      {/* Romantic Partner Companion Banner */}
      {character.romanticPartner && (
        <div className="bg-gradient-to-r from-[#291427] via-[#1c1223] to-[#14101d] border border-pink-700/60 rounded-lg p-3.5 sm:p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#391e34] border border-pink-500/50 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
              {character.romanticPartner.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-sm font-bold text-pink-200">
                  {character.romanticPartner.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-pink-950/80 border border-pink-700/50 text-pink-300 font-cinzel font-semibold">
                  {character.romanticPartner.gender} · {character.romanticPartner.house}
                </span>
              </div>
              <div className="text-xs font-garamond italic text-[#cfb2c2]">
                Dynamic: {character.romanticPartner.dynamic}
              </div>
              <div className="text-[11px] font-garamond text-amber-300/80 mt-0.5">
                ✦ Keepsake: {character.romanticPartner.keepsake}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSpellCast('charm');
                handleSubmitTurn(
                  `I steal away through the quiet corridors to meet my ${character.romanticPartner?.gender.toLowerCase()}, ${character.romanticPartner?.name}, in the secret candlelit alcove behind the tapestry of Barnabas the Barmy.`
                );
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-pink-800 to-rose-700 hover:from-pink-700 hover:to-rose-600 disabled:opacity-50 text-pink-100 font-cinzel text-xs font-bold rounded shadow transition-all flex items-center gap-1.5 hover:scale-105"
            >
              <Heart className="w-3.5 h-3.5 fill-pink-300 text-pink-100" />
              <span>Stolen Secret Encounter</span>
            </button>
            <button
              type="button"
              onClick={() => setShowRomanticOptions(!showRomanticOptions)}
              className="px-3 py-2 bg-[#21162b] hover:bg-[#2e1d3d] border border-pink-800/40 text-pink-200 font-cinzel text-xs rounded transition-colors"
            >
              {showRomanticOptions ? 'Close' : 'Romantic Actions ▾'}
            </button>
          </div>
        </div>
      )}

      {/* Romantic Actions Quick Drawer */}
      {showRomanticOptions && character.romanticPartner && (
        <div className="p-4 bg-[#1b1124] border border-pink-700/50 rounded-lg space-y-2.5 animate-fadeIn text-xs font-garamond">
          <div className="font-cinzel text-xs font-bold text-pink-300 flex items-center gap-1.5 border-b border-[#3b233a] pb-1.5">
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-300" />
            <span>Choose How to Approach {character.romanticPartner.name}:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              {
                label: 'Whisper Secrets in the Alcove',
                text: `I pull ${character.romanticPartner.name} into the shadowy alcove behind the tapestry, holding their hands against the winter chill and whispering how much they mean to me.`,
              },
              {
                label: 'Astronomy Tower Rendezvous',
                text: `I sneak up to the Astronomy Tower balcony with ${character.romanticPartner.name} to watch the stars above the Scottish highlands, wrapping a warm wool scarf around their shoulders.`,
              },
              {
                label: 'Present Their Cherished Keepsake',
                text: `I reach into my robes, draw out ${character.romanticPartner.name}’s keepsake (${character.romanticPartner.keepsake}), and softly recount the day they gave it to me.`,
              },
              {
                label: 'A Stolen Breathless Kiss',
                text: `I step close to ${character.romanticPartner.name} beneath the gothic arches, brushing a stray lock of hair from their forehead and leaning in for a tender, breathless kiss in the starlit shadows.`,
              },
              {
                label: 'Library Study & Warm Confessions',
                text: `I find ${character.romanticPartner.name} studying late in a secluded corner of the library, sliding my chair beside theirs and quietly holding their hand beneath the heavy oak table.`,
              },
              {
                label: 'Courtyard Laughter & Winter Sweets',
                text: `I walk through the snow-dusted courtyard with ${character.romanticPartner.name}, breaking a Honeydukes chocolate bar in half and laughing as our shoulders brush together in the cold.`,
              },
            ].map((act, aIdx) => (
              <button
                key={aIdx}
                type="button"
                onClick={() => {
                  setShowRomanticOptions(false);
                  handleSubmitTurn(act.text);
                }}
                disabled={isLoading}
                className="p-2.5 bg-[#25152f] hover:bg-[#341b42] border border-[#48284e] hover:border-pink-500 rounded text-left transition-all text-[#e5d0de] hover:text-pink-100 flex flex-col gap-0.5"
              >
                <div className="font-cinzel text-[11px] font-bold text-pink-300">
                  ✦ {act.label}
                </div>
                <div className="text-[11px] font-garamond italic text-[#bca3b5] line-clamp-2">
                  {act.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spontaneous Event Alert Banner */}
      {activeSpontaneousEvent && (
        <div className="bg-[#1b1422] border-2 border-amber-500/80 rounded-lg p-5 shadow-2xl animate-fadeIn space-y-3 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
              <span className="font-cinzel text-xs uppercase tracking-widest text-amber-400 font-bold">
                Spontaneous Castle Event
              </span>
            </div>
            <button
              onClick={() => setActiveSpontaneousEvent(null)}
              className="text-xs text-[#8e8070] hover:text-amber-200"
            >
              ✕
            </button>
          </div>

          <h3 className="font-cinzel text-lg font-bold text-amber-200">
            {activeSpontaneousEvent.title}
          </h3>
          <p className="font-garamond text-sm text-[#ded3c3] italic leading-relaxed">
            {activeSpontaneousEvent.description}
          </p>

          {activeSpontaneousEvent.choices && (
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-cinzel text-[#8e8070] uppercase">
                Choose How to React:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeSpontaneousEvent.choices.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSpontaneousChoice(c.text)}
                    className="p-2.5 rounded bg-[#251a14] border border-[#483424] hover:border-amber-400 text-left text-xs font-garamond text-amber-100 hover:text-amber-200 transition-colors"
                  >
                    <span>✦ {c.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Narrative Log Stream */}
      <div className="bg-[#131118] border border-[#3a2d21] rounded-lg p-5 sm:p-7 space-y-6 shadow-2xl min-h-[420px] max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-900/40">
        {narrativeHistory.map((entry) => (
          <div key={entry.id} className="space-y-3.5 pb-4 border-b border-[#251e18] last:border-none">
            {/* Player's Typed Action */}
            {entry.userAction && (
              <div className="flex items-start gap-2.5 bg-[#1b1522] p-3 rounded border border-amber-700/40 text-xs sm:text-sm text-amber-200 font-garamond italic">
                <Feather className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-cinzel not-italic text-amber-400 font-bold mr-1.5">
                    {character.name}:
                  </span>
                  “{entry.userAction}”
                </div>
              </div>
            )}

            {/* Narrative description paragraphs */}
            <div className="space-y-2 font-garamond text-sm sm:text-base leading-relaxed text-[#dfd4c4]">
              {entry.narrative.map((para, pIdx) => (
                <p key={pIdx}>{para}</p>
              ))}
            </div>

            {/* Character Dialogue Quote Cards */}
            {entry.characterSpeech && entry.characterSpeech.length > 0 && (
              <div className="space-y-2 pt-1">
                {entry.characterSpeech.map((cs, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3.5 bg-[#1e1724] border-l-4 border-amber-600/70 rounded-r text-xs sm:text-sm font-garamond text-[#f1e6d4] space-y-1"
                  >
                    <div className="font-cinzel text-xs font-bold text-amber-300 flex items-center justify-between">
                      <span>{cs.speaker}</span>
                      <span className="text-[10px] text-[#9d8d7b] italic font-garamond font-normal">
                        ({cs.expression})
                      </span>
                    </div>
                    <p className="italic text-[#eedfcb]">{cs.speech}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Consequence Badges */}
            {entry.consequences && (
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-cinzel">
                {entry.consequences.housePointsChange ? (
                  <span className="px-2.5 py-0.5 bg-emerald-950/70 border border-emerald-600/40 text-emerald-300 rounded">
                    House Points: {entry.consequences.housePointsChange > 0 ? `+${entry.consequences.housePointsChange}` : entry.consequences.housePointsChange}
                  </span>
                ) : null}
                {entry.consequences.discoveredClue && (
                  <span className="px-2.5 py-0.5 bg-amber-950/70 border border-amber-600/40 text-amber-300 rounded">
                    Clue: {entry.consequences.discoveredClue}
                  </span>
                )}
                {entry.consequences.newSecret && (
                  <span className="px-2.5 py-0.5 bg-purple-950/70 border border-purple-600/40 text-purple-300 rounded">
                    Secret: {entry.consequences.newSecret}
                  </span>
                )}
              </div>
            )}

            {/* Relationship impact notes */}
            {entry.relationshipNotes && entry.relationshipNotes.length > 0 && (
              <div className="text-[11px] text-[#9a8a78] font-garamond italic space-y-0.5 pl-2 border-l border-[#3a2d21]">
                {entry.relationshipNotes.map((note, nIdx) => (
                  <div key={nIdx}>✦ {note}</div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="text-center py-4 space-y-2 animate-pulse">
            <span className="text-2xl">✨</span>
            <p className="text-xs font-cinzel text-amber-400">
              The castle whispers and reacts to your intention...
            </p>
          </div>
        )}

        <div ref={logEndRef} />
      </div>

      {/* Suggested Inspiration Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-cinzel text-[#8e8070]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Inspiration & Possible Intentions:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestedActions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmitTurn(sug)}
              className="px-3 py-1 bg-[#1a1520] hover:bg-[#251a14] border border-[#3b2e22] hover:border-amber-600/50 rounded text-xs text-[#cfbfab] hover:text-amber-200 transition-colors text-left font-garamond"
            >
              ✦ {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Natural Language Prompt Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitTurn();
        }}
        className="relative bg-[#16121c] border-2 border-amber-600/50 rounded-lg p-2 flex items-center gap-2 shadow-2xl focus-within:border-amber-400 transition-colors"
      >
        <Feather className="w-5 h-5 text-amber-500 ml-2 flex-shrink-0" />
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your action, dialogue, or spell naturally (e.g. 'I ask Lupin about his scars', 'I cast Lumos and look down the secret passage')..."
          disabled={isLoading}
          className="flex-1 bg-transparent border-none text-xs sm:text-sm font-garamond text-amber-100 placeholder-[#7d6e5d] focus:outline-none px-2"
        />
        <button
          type="submit"
          disabled={!userInput.trim() || isLoading}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 disabled:opacity-50 text-amber-100 font-cinzel text-xs font-bold rounded shadow transition-all flex items-center gap-1.5"
        >
          <span>Act</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
