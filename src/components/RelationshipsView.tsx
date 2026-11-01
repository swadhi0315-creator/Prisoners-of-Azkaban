import React, { useState } from 'react';
import { Relationship, PlayerCharacter } from '../types';
import { soundEngine } from '../utils/audio';
import { ensureNuancedDynamics } from '../utils/aiStoryEngine';
import {
  Users,
  Heart,
  Shield,
  MessageSquare,
  Sparkles,
  Send,
  Eye,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

interface RelationshipsViewProps {
  relationships: Relationship[];
  character?: PlayerCharacter;
  onUpdateAffinity: (characterId: string, amount: number, dialogue: string) => void;
  onUpdateNuances?: (
    characterId: string,
    deltas: { trust?: number; affection?: number; respect?: number; suspicion?: number }
  ) => void;
}

const presetDialogues: Record<string, { prompt: string; reply: string; affinityDelta: number }[]> = {
  lupin: [
    {
      prompt: 'Ask about the mysterious fatigue he experiences around each full moon.',
      reply:
        'Lupin smiles thinly with weary warmth: “Just an old affliction, Rowan. But kindness in my students does far more good than any potion.”',
      affinityDelta: 10,
    },
    {
      prompt: 'Request additional tips for steadying your wand during Dementor chills.',
      reply:
        '“Focus not on the cold, but on the memory that burns like a torch behind your eyes.”',
      affinityDelta: 15,
    },
  ],
  snape: [
    {
      prompt: 'Politely inquire about the precise temperature for simmering Shrivelfig roots.',
      reply:
        'Snape’s obsidian eyes narrow slightly: “At least one person in this class appears capable of reading beyond chapter two. Three points to your house, Vance.”',
      affinityDelta: 8,
    },
    {
      prompt: 'Ask why he glares at Professor Lupin during breakfast every morning.',
      reply:
        '“Mind your own affairs, Vance, before you find yourself scrubbing potion cauldrons until dawn.”',
      affinityDelta: -10,
    },
  ],
  harry: [
    {
      prompt: 'Offer to run extra laps on the pitch to help him shake off Dementor nightmares.',
      reply:
        'Harry nods gratefully: “Thanks, Rowan. Everyone treats me like I’m made of glass since the train. It means a lot to just fly normal.”',
      affinityDelta: 15,
    },
    {
      prompt: 'Discuss the rumor that Sirius Black is coming to Hogwarts specifically for him.',
      reply:
        'Harry’s jaw tightens: “I know what they’re saying. If Black comes, I won’t just hide under the covers.”',
      affinityDelta: 10,
    },
  ],
  hermione: [
    {
      prompt: 'Ask how it is physically possible for her to be in Muggle Studies and Ancient Runes at 9 AM.',
      reply:
        'Hermione flushes crimson and clutches her satchel: “I... I have special permission from Professor McGonagall! That’s all you need to know!”',
      affinityDelta: 5,
    },
    {
      prompt: 'Help carry half a dozen heavy library tomes on Dark Creature warding.',
      reply:
        'Hermione breathes a huge sigh of relief: “Oh, thank you! I’ve been researching Hippogriff legal appeals all night!”',
      affinityDelta: 20,
    },
  ],
  draco: [
    {
      prompt: 'Mock his dramatic arm bandage from the Hippogriff lesson.',
      reply:
        'Malfoy sneers, clutching his silk sling: “You won’t be laughing when that overgrown chicken gets the axe, Vance.”',
      affinityDelta: -15,
    },
    {
      prompt: 'Inquire coldly about the Malfoy family’s influence on the Committee of Dangerous Creatures.',
      reply:
        '“My father knows the Minister personally. Justice will be served in our favor.”',
      affinityDelta: -5,
    },
  ],
  hagrid: [
    {
      prompt: 'Visit his cabin with a bag of raw beef strips for Buckbeak.',
      reply:
        'Hagrid wipes a tear on his huge moleskin sleeve: “Yeh’re a true friend, Rowan. Not many students care about poor Beaky.”',
      affinityDelta: 20,
    },
  ],
  neville: [
    {
      prompt: 'Praise his brilliant courage with the Boggart and Snape’s green dress.',
      reply:
        'Neville turns bright red with joy: “My Gran was actually proud! She wrote that I finally showed some backbone!”',
      affinityDelta: 20,
    },
  ],
  fred_george: [
    {
      prompt: 'Trade a joke and ask about their newest trick inventions.',
      reply:
        '“We’re working on Fake Wands that turn into rubber chickens, mate! Care to be our test pilot?”',
      affinityDelta: 15,
    },
  ],
};

export const RelationshipsView: React.FC<RelationshipsViewProps> = ({
  relationships,
  character,
  onUpdateAffinity,
  onUpdateNuances,
}) => {
  const [selectedChar, setSelectedChar] = useState<Relationship>(relationships[0]);
  const [customDialogue, setCustomDialogue] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [recentReply, setRecentReply] = useState<{
    speech: string;
    thought?: string;
  } | null>(null);

  const handleSelect = (char: Relationship) => {
    soundEngine.playParchmentRustle();
    setSelectedChar(char);
    setRecentReply(null);
  };

  const handlePresetTalk = (prompt: string, reply: string, delta: number) => {
    soundEngine.playSpellCast('charm');
    onUpdateAffinity(selectedChar.id, delta, reply);
    setRecentReply({ speech: reply });
  };

  const handleCustomTalk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDialogue.trim() || isTalking) return;

    soundEngine.playParchmentRustle();
    setIsTalking(true);
    const speech = customDialogue.trim();
    setCustomDialogue('');

    try {
      let replyText = '';
      let thoughtText = '';

      // Try backend character dialogue
      try {
        const res = await fetch('/api/adventure/character-dialogue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId: selectedChar.id,
            userSpeech: speech,
            playerCharacter: character,
            characterInfo: selectedChar,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.reply) {
            replyText = data.reply;
            thoughtText = data.innerThought || '';
          }
        }
      } catch (err) {
        console.warn('Backend dialogue unavailable:', err);
      }

      // Fallback in-character generator
      if (!replyText) {
        if (selectedChar.id === 'lupin') {
          replyText = `Lupin pauses, setting down his tea. “You perceive more than most students your age, Rowan. Keep that mind sharp—the coming days will test all of us.”`;
          thoughtText = `Noticing a remarkable maturity in your demeanor.`;
        } else if (selectedChar.id === 'snape') {
          replyText = `Snape’s voice drops to a lethal murmur. “Fools speak when silence is golden, Vance. But I will allow you to believe you have made a point—for now.”`;
          thoughtText = `Observing you coldly, recalculating your potential threat.`;
        } else if (selectedChar.id === 'hermione') {
          replyText = `Hermione sighs, tucking a stray curl behind her ear. “I know everyone thinks I’m mad taking all these electives, but there is simply so much we need to understand before it’s too late.”`;
          thoughtText = `Relieved to find someone who doesn't simply mock her workload.`;
        } else if (selectedChar.id === 'harry') {
          replyText = `Harry glances around the common room. “I feel like everyone in the castle is either pitying me or waiting for me to crack. It’s good to just talk to someone who treats me like a normal friend.”`;
          thoughtText = `Trusting your presence amidst the circus of his fame.`;
        } else if (selectedChar.id === 'draco') {
          replyText = `Draco sneers, folding his arms. “You really think you’re something special, don’t you, Vance? We’ll see how brave you look when father arrives at the Ministry hearing.”`;
          thoughtText = `Irritated that he cannot intimidate you as easily as Neville.`;
        } else {
          replyText = `${selectedChar.name} listens carefully to your words: “I hear you, Rowan. These are strange times at Hogwarts, but having someone dependable makes the difference.”`;
        }
      }

      setRecentReply({ speech: replyText, thought: thoughtText });
      onUpdateAffinity(selectedChar.id, 8, replyText);

      if (onUpdateNuances) {
        onUpdateNuances(selectedChar.id, { trust: 4, respect: 4 });
      }
    } catch (err) {
      console.error('Error talking to character:', err);
    } finally {
      setIsTalking(false);
    }
  };

  const nuances = ensureNuancedDynamics(selectedChar, character?.house);

  return (
    <div className="max-w-6xl mx-auto my-4 px-2 sm:px-4 space-y-6">
      {/* Header */}
      <div className="bg-[#14121a] border border-[#3b2e22] rounded-lg p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-cinzel text-xl text-amber-200 font-bold tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Nuanced Relationships & Social Reputations</span>
          </h2>
          <p className="text-xs text-[#a09080] font-garamond italic">
            Tracked across Trust, Affection, Suspicion, Rivalry, Respect, and Resentment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Character List */}
        <div className="md:col-span-5 space-y-2 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-900/40">
          {relationships.map((char) => {
            const isSelected = selectedChar.id === char.id;
            const charNuances = ensureNuancedDynamics(char);

            return (
              <button
                key={char.id}
                onClick={() => handleSelect(char)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#291e14] border-amber-500/80 text-amber-200 shadow-md scale-[1.01]'
                    : 'bg-[#15131a] border-[#2e241b] text-[#c0b3a0] hover:border-amber-700/50 hover:bg-[#1d171d]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-full bg-[#201912] flex items-center justify-center text-xl border border-[#3d2e20]">
                    {char.avatar}
                  </div>
                  <div className="truncate">
                    <div className="font-cinzel text-xs font-bold truncate flex items-center gap-1.5 text-amber-200">
                      <span>{char.name}</span>
                      {(char.status === ('Boyfriend' as any) ||
                        char.status === ('Girlfriend' as any) ||
                        char.id === character?.romanticPartner?.id ||
                        char.name.toLowerCase() === character?.romanticPartner?.name.toLowerCase()) && (
                        <span className="text-[10px] text-pink-400">♥</span>
                      )}
                    </div>
                    <div className="text-[11px] font-garamond italic text-[#8a7b6b] truncate">
                      {charNuances.dominantDynamic}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={`text-[10px] font-cinzel px-2 py-0.5 rounded border ${
                      char.status === ('Boyfriend' as any) ||
                      char.status === ('Girlfriend' as any) ||
                      char.id === character?.romanticPartner?.id ||
                      char.name.toLowerCase() === character?.romanticPartner?.name.toLowerCase()
                        ? 'bg-pink-950/80 text-pink-300 border-pink-700/60 font-bold'
                        : char.affinity > 40
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40'
                        : char.affinity < 0
                        ? 'bg-red-950/60 text-red-300 border-red-700/40'
                        : 'bg-[#1f1915] text-[#b0a090] border-[#3d2e20]'
                    }`}
                  >
                    {char.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Character Profile */}
        <div className="md:col-span-7 bg-[#14121a] border border-[#3b2e22] rounded-lg p-6 space-y-5 shadow-2xl">
          {/* Top header */}
          <div className="border-b border-[#2d231b] pb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#251e18] flex items-center justify-center text-3xl border-2 border-amber-600/40 shadow-inner">
                {selectedChar.avatar}
              </div>
              <div>
                <h3 className="font-cinzel text-2xl font-bold text-amber-200">
                  {selectedChar.name}
                </h3>
                <div className="text-xs text-[#a09080] font-garamond italic">
                  {selectedChar.role} {selectedChar.house && `· ${selectedChar.house}`}
                </div>
                <div className="text-xs font-cinzel text-amber-400/90 font-semibold mt-0.5">
                  Dynamic: {nuances.dominantDynamic}
                </div>
              </div>
            </div>
          </div>

          {/* Romantic Partner Banner if Selected */}
          {character?.romanticPartner &&
            (selectedChar.id === character.romanticPartner.id ||
              selectedChar.name.toLowerCase() === character.romanticPartner.name.toLowerCase()) && (
              <div className="p-3.5 bg-gradient-to-r from-[#2d152a] to-[#1b1124] rounded-lg border border-pink-700/60 shadow-md space-y-1">
                <div className="flex items-center gap-2 text-xs font-cinzel text-pink-300 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-300" />
                  <span>Your Destined {character.romanticPartner.gender} at Hogwarts</span>
                </div>
                <div className="text-xs font-garamond italic text-[#d5bcc7]">
                  {character.romanticPartner.sharedMemory}
                </div>
                <div className="text-[11px] font-garamond text-amber-300/90 pt-0.5">
                  ✦ Sacred Keepsake: {character.romanticPartner.keepsake}
                </div>
              </div>
            )}

          {/* Nuanced Meters Grid */}
          <div className="space-y-2 bg-[#17141f] p-4 rounded-lg border border-[#2f241c]">
            <div className="text-xs font-cinzel text-amber-400 font-bold uppercase tracking-wider mb-2">
              Nuanced Psychological Dynamics
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-garamond">
              <div>
                <div className="flex justify-between text-[#b5a796] text-[11px] font-cinzel">
                  <span>Trust</span>
                  <span className="text-amber-300">{nuances.trust}</span>
                </div>
                <div className="w-full bg-[#201925] h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${Math.max(5, (nuances.trust + 100) / 2)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#b5a796] text-[11px] font-cinzel">
                  <span>Respect</span>
                  <span className="text-amber-300">{nuances.respect}</span>
                </div>
                <div className="w-full bg-[#201925] h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-sky-500 h-full"
                    style={{ width: `${Math.max(5, nuances.respect)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#b5a796] text-[11px] font-cinzel">
                  <span>Suspicion</span>
                  <span className="text-amber-300">{nuances.suspicion}</span>
                </div>
                <div className="w-full bg-[#201925] h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-purple-500 h-full"
                    style={{ width: `${Math.max(5, nuances.suspicion)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#b5a796] text-[11px] font-cinzel">
                  <span>Rivalry</span>
                  <span className="text-amber-300">{nuances.rivalry}</span>
                </div>
                <div className="w-full bg-[#201925] h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-red-500 h-full"
                    style={{ width: `${Math.max(5, nuances.rivalry)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#b5a796] text-[11px] font-cinzel">
                  <span>Loyalty</span>
                  <span className="text-amber-300">{nuances.loyalty}</span>
                </div>
                <div className="w-full bg-[#201925] h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: `${Math.max(5, nuances.loyalty)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#b5a796] text-[11px] font-cinzel">
                  <span>Affection</span>
                  <span className="text-amber-300">{nuances.affection}</span>
                </div>
                <div className="w-full bg-[#201925] h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${Math.max(5, (nuances.affection + 100) / 2)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description & Personality */}
          <div className="space-y-1 text-xs font-garamond text-[#c8bcab]">
            <p className="italic">{selectedChar.description}</p>
          </div>

          {/* Interactive Free-form Speech Form */}
          <div className="space-y-2 pt-2 border-t border-[#2d231b]">
            <div className="text-xs font-cinzel text-amber-400 font-semibold flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Say Anything to {selectedChar.name}:</span>
            </div>

            <form onSubmit={handleCustomTalk} className="flex gap-2">
              <input
                type="text"
                value={customDialogue}
                onChange={(e) => setCustomDialogue(e.target.value)}
                placeholder={`Speak naturally to ${selectedChar.name}...`}
                disabled={isTalking}
                className="flex-1 p-2.5 bg-[#1b1622] border border-[#3b2e22] focus:border-amber-500 rounded text-xs text-amber-100 placeholder-[#7d6f60] font-garamond"
              />
              <button
                type="submit"
                disabled={!customDialogue.trim() || isTalking}
                className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 disabled:opacity-50 text-amber-100 font-cinzel text-xs font-bold rounded shadow transition-all flex items-center gap-1.5"
              >
                <span>Speak</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>

          {/* Preset Prompts or Partner Prompts */}
          {character?.romanticPartner &&
          (selectedChar.id === character.romanticPartner.id ||
            selectedChar.name.toLowerCase() === character.romanticPartner.name.toLowerCase()) ? (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-cinzel text-pink-400 font-bold flex items-center gap-1">
                <span>♥ Romantic Intimate Prompts:</span>
              </div>
              <div className="space-y-1.5">
                {[
                  {
                    prompt: `Take their hand and whisper softly how much their warmth means amidst the Dementor cold.`,
                    reply: `${character.romanticPartner.name} gently laces their fingers with yours, eyes glowing with soft tenderness: “I was shivering until you walked over, Rowan. With you, none of the cold can touch us.”`,
                    delta: 15,
                  },
                  {
                    prompt: `Ask if they want to sneak up to the Astronomy Tower balcony tonight after curfew.`,
                    reply: `A conspiratorial, breathless smile touches ${character.romanticPartner.name}’s lips: “You know I’d follow you anywhere, Rowan. I’ll bring the warm butterbeer.”`,
                    delta: 20,
                  },
                  {
                    prompt: `Show them their keepsake (${character.romanticPartner.keepsake}) and share a quiet smile.`,
                    reply: `${character.romanticPartner.name} touches the keepsake, their cheeks flushing a delicate rose: “You kept it close to your heart... That means everything to me, Rowan.”`,
                    delta: 15,
                  },
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetTalk(opt.prompt, opt.reply, opt.delta)}
                    className="w-full text-left p-2.5 bg-[#25152a] border border-pink-800/50 hover:border-pink-500 rounded text-xs text-pink-100 hover:text-white transition-colors flex items-center justify-between gap-3"
                  >
                    <span>{opt.prompt}</span>
                    <span className="text-[10px] font-cinzel text-pink-300">
                      Whisper ♥
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : presetDialogues[selectedChar.id] ? (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-cinzel text-[#8e8070]">
                Or select a classic prompt:
              </div>
              <div className="space-y-1.5">
                {presetDialogues[selectedChar.id].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetTalk(opt.prompt, opt.reply, opt.affinityDelta)}
                    className="w-full text-left p-2.5 bg-[#1c1824] border border-[#352a1e] hover:border-amber-600/60 rounded text-xs text-[#cfc0ae] hover:text-amber-200 transition-colors flex items-center justify-between gap-3"
                  >
                    <span>{opt.prompt}</span>
                    <span className="text-[10px] font-cinzel text-amber-400">
                      Ask ✦
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Recent In-Character Reply Bubble */}
          {recentReply && (
            <div className="p-3.5 bg-[#201b2b] border border-amber-600/40 rounded-lg text-xs font-garamond text-amber-100 italic space-y-1 animate-fadeIn">
              <div className="font-cinzel text-[11px] text-amber-400 font-bold not-italic">
                {selectedChar.name} responds:
              </div>
              <p>{recentReply.speech}</p>
              {recentReply.thought && (
                <p className="text-[11px] text-[#9a8976] not-italic font-garamond border-t border-[#3b2e22] pt-1 mt-1">
                  Inner reaction: {recentReply.thought}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
