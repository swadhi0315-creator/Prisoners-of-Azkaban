import React, { useState } from 'react';
import { JournalEntry, JournalReply, PlayerCharacter } from '../types';
import { soundEngine } from '../utils/audio';
import {
  Feather,
  X,
  Plus,
  BookOpen,
  Sparkles,
  Heart,
  MessageSquare,
  Send,
  RefreshCw,
  Lightbulb,
  Laugh,
  Flame,
  Check,
} from 'lucide-react';
import {
  JournalVoice,
  JOURNAL_VOICE_INFO,
  requestJournalReply,
  requestJournalConverse,
  generateLocalJournalReply,
} from '../utils/journalEngine';

interface JournalViewProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  onUpdateEntry?: (entryId: string, updated: Partial<JournalEntry>) => void;
  character?: PlayerCharacter;
}

export const JournalView: React.FC<JournalViewProps> = ({
  isOpen,
  onClose,
  entries,
  onAddEntry,
  onUpdateEntry,
  character,
}) => {
  const [activeTab, setActiveTab] = useState<'entries' | 'psychology' | 'converse'>('entries');
  const [isWriting, setIsWriting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState<JournalEntry['mood']>('Enchanted');
  const [selectedVoice, setSelectedVoice] = useState<JournalVoice>('marauder');
  const [isFormulatingReply, setIsFormulatingReply] = useState(false);

  // Conversing state
  const [activeChatEntryId, setActiveChatEntryId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isChatReplying, setIsChatReplying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || isFormulatingReply) return;

    soundEngine.playParchmentRustle();
    setIsFormulatingReply(true);

    const title = newTitle.trim();
    const content = newContent.trim();
    const mood = newMood;
    const voice = selectedVoice;

    // First generate instant local or await API reply
    const initialReply = generateLocalJournalReply(
      { title, content, mood, relatedEvent: 'Personal Reflections' },
      character,
      voice
    );

    const entryToSave: Omit<JournalEntry, 'id'> = {
      date: 'Autumn Term 1993',
      title,
      content,
      mood,
      relatedEvent: 'Personal Reflections',
      journalVoice: voice,
      reply: initialReply,
      conversations: [],
    };

    onAddEntry(entryToSave);

    setNewTitle('');
    setNewContent('');
    setIsWriting(false);

    // Now query the server-side Gemini endpoint in background for high-fidelity response if available
    try {
      const serverReply = await requestJournalReply(
        { title, content, mood, relatedEvent: 'Personal Reflections' },
        character,
        voice
      );
      // If server returned a richer response and we have an update callback
      if (serverReply && onUpdateEntry && entries.length > 0) {
        // Find newly created entry id on next tick
        setTimeout(() => {
          const newest = entries[0];
          if (newest && newest.title === title) {
            onUpdateEntry(newest.id, { reply: serverReply });
          }
        }, 300);
      }
    } catch {
      // Fallback already saved
    } finally {
      setIsFormulatingReply(false);
    }
  };

  const handleSendChatBanter = async (entry: JournalEntry) => {
    if (!chatInput.trim() || isChatReplying) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setIsChatReplying(true);
    soundEngine.playParchmentRustle();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const existingConversations = entry.conversations || [];
    const updatedWithUser = [
      ...existingConversations,
      {
        id: `c_${Date.now()}`,
        sender: 'player' as const,
        text: userMsg,
        timestamp,
      },
    ];

    if (onUpdateEntry) {
      onUpdateEntry(entry.id, { conversations: updatedWithUser });
    }

    try {
      const journalRetort = await requestJournalConverse(
        updatedWithUser,
        userMsg,
        entry,
        character,
        entry.journalVoice || selectedVoice
      );

      const finalConversations = [
        ...updatedWithUser,
        {
          id: `c_resp_${Date.now()}`,
          sender: 'journal' as const,
          text: journalRetort,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];

      if (onUpdateEntry) {
        onUpdateEntry(entry.id, { conversations: finalConversations });
      }
    } catch {
      // fallback handled inside engine
    } finally {
      setIsChatReplying(false);
    }
  };

  const handleReEnchantReply = async (entry: JournalEntry) => {
    soundEngine.playSpellCast('charm');
    const newReply = await requestJournalReply(
      { title: entry.title, content: entry.content, mood: entry.mood, relatedEvent: entry.relatedEvent },
      character,
      entry.journalVoice || selectedVoice
    );
    if (onUpdateEntry) {
      onUpdateEntry(entry.id, { reply: newReply });
    }
  };

  const profile = character?.psychologicalProfile;
  const partner = character?.romanticPartner;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Sidebar Panel */}
      <div className="w-full max-w-xl bg-[#ede2cb] text-[#2c1d11] h-full shadow-2xl border-l-4 border-[#7a5c36] flex flex-col relative overflow-hidden">
        {/* Parchment background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#bba282_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#8e6c43]/40 flex items-center justify-between bg-[#e5d5b7] relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#3a2211] text-amber-200 flex items-center justify-center shadow">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-black tracking-wide text-[#2e1706] flex items-center gap-2">
                <span>The Enchanted Talking Journal</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/10 border border-[#8e6c43]/50 text-amber-900 font-sans uppercase font-bold">
                  Sentient
                </span>
              </h2>
              <p className="text-[11px] font-garamond italic text-[#634529]">
                Parchment that talks back, mocks your drama, & offers solid advice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#5c3e21] hover:text-[#8a1c14] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex border-b border-[#9c784f]/40 bg-[#dfceb0] text-xs font-cinzel">
          <button
            onClick={() => setActiveTab('entries')}
            className={`flex-1 py-2.5 text-center transition-colors font-bold flex items-center justify-center gap-1.5 ${
              activeTab === 'entries'
                ? 'bg-[#ede2cb] text-[#331c0a] border-b-2 border-[#5a3818]'
                : 'text-[#6d5137] hover:text-[#2d1808]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Chronicles ({entries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('psychology')}
            className={`flex-1 py-2.5 text-center transition-colors font-bold flex items-center justify-center gap-1.5 ${
              activeTab === 'psychology'
                ? 'bg-[#ede2cb] text-[#331c0a] border-b-2 border-[#5a3818]'
                : 'text-[#6d5137] hover:text-[#2d1808]'
            }`}
          >
            <span>🎩 Soul Dossier</span>
          </button>
        </div>

        {/* Voice Persona Selector Banner */}
        <div className="px-4 py-2 bg-[#e6d8bc] border-b border-[#9c784f]/30 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-cinzel">
          <span className="text-[#644527] font-semibold flex items-center gap-1 whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-amber-700" />
            <span>Quill Voice:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {(Object.keys(JOURNAL_VOICE_INFO) as JournalVoice[]).map((vKey) => {
              const info = JOURNAL_VOICE_INFO[vKey];
              const isSelected = selectedVoice === vKey;
              return (
                <button
                  key={vKey}
                  type="button"
                  onClick={() => {
                    setSelectedVoice(vKey);
                    soundEngine.playParchmentRustle();
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#3a2211] text-amber-100 shadow-sm scale-105'
                      : 'bg-[#f4ebd8] text-[#543315] hover:bg-[#ebdcc3] border border-[#9c784f]/40'
                  }`}
                  title={info.description}
                >
                  <span>{info.icon}</span>
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-[#96744f]/40 relative">
          {activeTab === 'psychology' && profile ? (
            <div className="space-y-4">
              <div className="border-b border-[#9c784f]/40 pb-2">
                <span className="text-[10px] uppercase font-cinzel text-[#7f5d3a] tracking-wider font-semibold">
                  Sorting Hat Inferences
                </span>
                <h3 className="font-cinzel text-base font-bold text-[#321a07]">
                  {character?.name} · {profile.moralAlignment}
                </h3>
                <div className="text-xs font-garamond italic text-[#5f3e20]">
                  Lineage: {character?.bloodStatus} ({character?.lineage.familyName})
                </div>
              </div>

              {partner && (
                <div className="p-3 bg-[#f7e8ec] rounded border border-pink-400/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 fill-pink-500 text-pink-600" />
                    <span className="font-cinzel text-xs font-bold text-pink-900">
                      Romantic Companion: {partner.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-200 text-pink-800 font-cinzel font-semibold ml-auto">
                      {partner.gender} · {partner.house}
                    </span>
                  </div>
                  <p className="text-xs font-garamond text-pink-950 italic">
                    Dynamic: {partner.dynamic}
                  </p>
                  <p className="text-[11px] font-garamond text-pink-900 mt-1">
                    ✦ Cherished Keepsake: {partner.keepsake}
                  </p>
                  <p className="text-[11px] font-garamond text-pink-800 italic mt-0.5">
                    Shared Memory: “{partner.sharedMemory}”
                  </p>
                </div>
              )}

              <div className="space-y-3 text-xs font-garamond text-[#321c0b]">
                <div className="p-3 bg-[#f5ede0] rounded border border-[#9c784f]/40">
                  <span className="font-cinzel text-[11px] text-[#5c3718] font-bold block mb-0.5">
                    Core Strength & Hidden Weakness:
                  </span>
                  <p className="font-bold text-[#201308]">{profile.coreStrength}</p>
                  <p className="text-[#6d4d31] italic mt-1">Weakness: {profile.hiddenWeakness}</p>
                </div>

                <div className="p-3 bg-[#f5ede0] rounded border border-[#9c784f]/40">
                  <span className="font-cinzel text-[11px] text-[#5c3718] font-bold block mb-0.5">
                    Patronus & Boggart Roots:
                  </span>
                  <p>
                    <span className="font-bold">Patronus Seed:</span> {character?.patronus.form} — “{character?.patronus.memory}”
                  </p>
                  <p className="mt-1">
                    <span className="font-bold">Boggart Fear:</span> {character?.boggart.fear}
                  </p>
                </div>

                <div className="p-3 bg-[#f5ede0] rounded border border-[#9c784f]/40">
                  <span className="font-cinzel text-[11px] text-[#5c3718] font-bold block mb-0.5">
                    Destined Dynamics & Allegiances:
                  </span>
                  <p>
                    <span className="font-bold text-[#1f4a21]">Allies:</span> {profile.destinedAllies.join(', ')}
                  </p>
                  <p className="mt-0.5">
                    <span className="font-bold text-[#741c1c]">Rivals:</span> {profile.destinedRivals.join(', ')}
                  </p>
                  <p className="mt-1 text-[#66492d] italic">
                    Faction Tendency: {profile.factionLean}
                  </p>
                </div>

                <div className="p-3 bg-[#f5ede0] rounded border border-[#9c784f]/40">
                  <span className="font-cinzel text-[11px] text-[#5c3718] font-bold block mb-0.5">
                    The Sirius Black & Pettigrew Connection:
                  </span>
                  <p className="italic text-[#462d16]">{profile.siriusConnection}</p>
                  <p className="italic text-[#462d16] mt-1">{profile.pettigrewInstinct}</p>
                </div>

                {profile.assessmentNotes.length > 0 && (
                  <div className="border-t border-[#9c784f]/30 pt-2 text-[11px] text-[#78593c] italic space-y-1">
                    {profile.assessmentNotes.map((note, idx) => (
                      <p key={idx}>✦ {note}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : !isWriting ? (
            <div className="space-y-4">
              {/* Top Action Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-cinzel text-[#5f3e20] uppercase tracking-wider font-semibold block">
                    Sentient Parchment Pages
                  </span>
                  <span className="text-[11px] font-garamond italic text-[#7f5d3a]">
                    Write anything; the journal will talk back with wit & counsel.
                  </span>
                </div>
                <button
                  onClick={() => setIsWriting(true)}
                  className="px-3.5 py-1.5 bg-[#3a2211] hover:bg-[#251408] text-amber-100 font-cinzel text-xs font-bold rounded flex items-center gap-1.5 shadow transition-all hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dip Quill in Ink</span>
                </button>
              </div>

              {/* Quick Prompt Ideas Chips */}
              <div className="p-3 bg-[#f4ebd8] rounded border border-[#9c784f]/40 text-xs font-garamond space-y-2">
                <span className="font-cinzel text-[11px] text-[#543315] font-bold flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-700" />
                  <span>Need to vent or ask the Journal advice?</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Snape humiliated me in Potions today...',
                    partner ? `I want to sneak out to meet ${partner.name}...` : 'How do I talk to my secret crush?',
                    'I swear I heard rat claws inside the stone walls...',
                    'I think the Dementors are getting closer to the castle...',
                    'Peeves dropped pumpkin juice on my clean uniform!',
                  ].map((promptText, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        setNewTitle(promptText.split('...')[0] || 'Corridor Chronicle');
                        setNewContent(`Dear Journal,\n${promptText} What should I honestly do?`);
                        setIsWriting(true);
                        soundEngine.playParchmentRustle();
                      }}
                      className="text-[11px] px-2 py-0.5 bg-[#ede1c7] hover:bg-[#decfae] text-[#4d2f13] border border-[#a28059]/40 rounded italic text-left transition-colors"
                    >
                      “{promptText}”
                    </button>
                  ))}
                </div>
              </div>

              {/* Entries list with Talking Back answers */}
              <div className="space-y-5">
                {entries.map((entry) => {
                  const reply = entry.reply;
                  const isChatting = activeChatEntryId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className="p-4 sm:p-5 bg-[#f5ede0] rounded-lg border-2 border-[#8f6e47]/50 shadow-md space-y-3 relative group"
                    >
                      {/* Entry Header */}
                      <div className="flex items-center justify-between text-xs font-cinzel text-[#6a4725] border-b border-[#9c784f]/30 pb-1.5">
                        <span className="font-bold flex items-center gap-1.5">
                          <Feather className="w-3 h-3 text-[#784f27]" />
                          <span>{entry.date}</span>
                        </span>
                        <span className="italic font-garamond px-2 py-0.5 rounded bg-[#ebdcc2] border border-[#a68661]/40 text-[#4c2d11]">
                          Mood: {entry.mood}
                        </span>
                      </div>

                      {/* Entry Title & Student Content */}
                      <div>
                        <h4 className="font-cinzel text-sm sm:text-base font-bold text-[#321a07] mb-1">
                          {entry.title}
                        </h4>
                        <p className="font-garamond text-xs sm:text-sm text-[#2e1c0c] leading-relaxed italic whitespace-pre-line pl-2 border-l-2 border-[#9c784f]/30">
                          {entry.content}
                        </p>
                      </div>

                      {/* THE TALKING JOURNAL REPLY CARD */}
                      {reply ? (
                        <div className="mt-3 p-3.5 bg-gradient-to-br from-[#ebe0c8] via-[#e8dcb9] to-[#ede2c8] rounded-md border border-[#7e5c35] shadow-inner space-y-2.5 relative overflow-hidden animate-fadeIn">
                          {/* Corner ambient feather badge */}
                          <div className="flex items-center justify-between border-b border-[#9a764d]/40 pb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base">🪄</span>
                              <span className="font-cinzel text-xs font-black text-[#3d2008] tracking-wide">
                                {reply.speakerName || 'The Enchanted Journal Speaks Back'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-cinzel px-2 py-0.5 rounded bg-[#dac89f] border border-[#9f7d54]/40 text-[#4e2d11] italic font-semibold">
                                Tone: {reply.tone}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleReEnchantReply(entry)}
                                title="Re-enchant response"
                                className="p-1 text-[#6b4c2b] hover:text-[#2d1808] hover:rotate-180 transition-transform"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* 1. Mock Response / Witty Roasting */}
                          <div className="space-y-1">
                            <span className="font-cinzel text-[10px] uppercase font-bold text-[#6d461f] tracking-wider flex items-center gap-1">
                              <Laugh className="w-3 h-3 text-amber-800" />
                              <span>The Journal's Mock Retort:</span>
                            </span>
                            <p className="font-garamond text-xs sm:text-sm text-[#2c1707] font-semibold italic pl-2.5 border-l-2 border-amber-700/60 leading-snug">
                              {reply.mockResponse}
                            </p>
                          </div>

                          {/* 2. Solid Practical Advice */}
                          {reply.solidAdvice && (
                            <div className="p-2.5 bg-[#f4ecd8] rounded border border-[#9a7852]/40 space-y-0.5">
                              <span className="font-cinzel text-[10px] uppercase font-bold text-[#2a4d2c] tracking-wider flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-800" />
                                <span>Solid Hogwarts Counsel & Advice:</span>
                              </span>
                              <p className="font-garamond text-xs text-[#20140b] leading-relaxed pl-1">
                                {reply.solidAdvice}
                              </p>
                            </div>
                          )}

                          {/* 3. Highs and Lows of the Day */}
                          {reply.highLowReaction && (
                            <div className="text-[11px] font-garamond italic text-[#4a2e16] bg-[#fdf8ee]/70 p-2 rounded border border-[#ba9e7a]/40">
                              <span className="font-cinzel text-[10px] font-bold text-[#623c1b] block not-italic mb-0.5">
                                Highs & Lows of Your Day:
                              </span>
                              {reply.highLowReaction}
                            </div>
                          )}

                          {/* 4. Magical Margin Quirk */}
                          {reply.marginQuirk && (
                            <div className="text-[10px] font-cinzel text-[#7f5a34] italic pt-1 border-t border-[#9f7d54]/20 flex items-center justify-between">
                              <span>{reply.marginQuirk}</span>
                              <span className="text-[9px] text-[#937554]">{reply.timestamp}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-[#e8dbc0] rounded border border-[#9e7d53]/40 flex items-center justify-between">
                          <span className="text-xs font-garamond italic text-[#54361a]">
                            The parchment is still absorbing the ink of this entry...
                          </span>
                          <button
                            type="button"
                            onClick={() => handleReEnchantReply(entry)}
                            className="px-2.5 py-1 bg-[#3a2211] text-amber-100 font-cinzel text-[11px] font-bold rounded shadow flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Awaken Talking Ink</span>
                          </button>
                        </div>
                      )}

                      {/* CONVERSATION THREAD: User talks back to the journal! */}
                      {entry.conversations && entry.conversations.length > 0 && (
                        <div className="pt-2 border-t border-[#9c784f]/30 space-y-2">
                          <div className="font-cinzel text-[10px] uppercase font-bold text-[#5e3c1b] flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>Parchment Banter Dialogue ({entry.conversations.length}):</span>
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {entry.conversations.map((msg) => (
                              <div
                                key={msg.id}
                                className={`p-2 rounded text-xs font-garamond ${
                                  msg.sender === 'player'
                                    ? 'bg-[#ded1b6] ml-4 text-[#2b1707] border border-[#a3835e]/40'
                                    : 'bg-[#f8f0de] mr-4 text-[#3a2211] border-l-2 border-amber-800 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[9px] font-cinzel text-[#6f4f2e] mb-0.5">
                                  <span>{msg.sender === 'player' ? 'You (Rowan)' : 'The Journal'}</span>
                                  <span>{msg.timestamp}</span>
                                </div>
                                <p className="italic leading-snug">{msg.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action buttons: Talk Back or Expand Chat */}
                      <div className="pt-1 flex items-center justify-between">
                        <div className="text-[10px] font-cinzel text-[#7f5d3a]">
                          Event: {entry.relatedEvent}
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveChatEntryId(isChatting ? null : entry.id)}
                          className="px-3 py-1 bg-[#472c16] hover:bg-[#321c0b] text-amber-100 font-cinzel text-[11px] font-bold rounded flex items-center gap-1.5 transition-all shadow"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{isChatting ? 'Close Banter' : 'Talk Back in Ink 🪶'}</span>
                        </button>
                      </div>

                      {/* Inline Talk Back Form */}
                      {isChatting && (
                        <div className="mt-2 p-2.5 bg-[#ebdcc2] rounded border border-[#99764f]/50 space-y-2 animate-fadeIn">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSendChatBanter(entry);
                                }
                              }}
                              placeholder="Retort back or ask follow-up advice..."
                              className="flex-1 p-2 bg-[#f8f2e4] border border-[#9e7d56] rounded text-xs font-garamond text-[#2c1a0c] focus:outline-none focus:ring-1 focus:ring-[#6b4724]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSendChatBanter(entry)}
                              disabled={!chatInput.trim() || isChatReplying}
                              className="px-3 py-2 bg-[#331c0a] hover:bg-[#1f0f04] disabled:opacity-50 text-amber-100 font-cinzel text-xs font-bold rounded flex items-center gap-1 shadow"
                            >
                              <Send className="w-3 h-3" />
                              <span>{isChatReplying ? '...' : 'Send'}</span>
                            </button>
                          </div>
                          <p className="text-[10px] font-garamond italic text-[#6a4928]">
                            ✦ Type your witty reply; the enchanted parchment will answer right back.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Write new entry form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#9c784f]/30 pb-2">
                <span className="font-cinzel text-xs font-bold text-[#381f0b] flex items-center gap-1.5">
                  <Feather className="w-4 h-4 text-[#6b4421]" />
                  <span>Dip Quill in Ink</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsWriting(false)}
                  className="text-xs text-[#6a4725] hover:text-[#8a1c14]"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-cinzel text-[#543315] mb-1">
                  Entry Title:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Whispers in the Clock Tower or Midnight Tea with Lupin"
                  className="w-full p-2.5 bg-[#f5ede0] border border-[#96744f] rounded text-xs font-garamond text-[#2a1b0e] focus:outline-none focus:ring-1 focus:ring-[#7a5c36]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-cinzel text-[#543315] mb-1">
                    Mood / Disposition:
                  </label>
                  <select
                    value={newMood}
                    onChange={(e) => setNewMood(e.target.value as JournalEntry['mood'])}
                    className="w-full p-2 bg-[#f5ede0] border border-[#96744f] rounded text-xs font-garamond text-[#2a1b0e]"
                  >
                    <option value="Hopeful">Hopeful</option>
                    <option value="Terrified">Terrified</option>
                    <option value="Defiant">Defiant</option>
                    <option value="Enchanted">Enchanted</option>
                    <option value="Brooding">Brooding</option>
                    <option value="Exhilarated">Exhilarated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-cinzel text-[#543315] mb-1">
                    Talking Quill Voice:
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value as JournalVoice)}
                    className="w-full p-2 bg-[#f5ede0] border border-[#96744f] rounded text-xs font-garamond text-[#2a1b0e]"
                  >
                    <option value="marauder">🪄 Cheeky Marauder (Sassy & Bold)</option>
                    <option value="sage">📜 Ancient Grimoire (Wise & Deep Lore)</option>
                    <option value="sarcastic">🖤 Sarcastic Familiar (Hilarious Roasts)</option>
                    <option value="romantic">💌 Castle Whispers (Romance & Drama)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-cinzel text-[#543315] mb-1">
                  Parchment Notes & Dilemmas:
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Record what happened today in the castle, your struggles in classes, encounters with friends or rivals, or secrets you dare not speak aloud..."
                  rows={6}
                  className="w-full p-3 bg-[#f5ede0] border border-[#96744f] rounded text-xs font-garamond text-[#2a1b0e] focus:outline-none focus:ring-1 focus:ring-[#7a5c36]"
                />
              </div>

              <div className="p-2.5 bg-[#ebdcc2] rounded border border-[#a17e56]/40 text-[11px] font-garamond italic text-[#573919] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>
                  As soon as you pen this entry, the sentient parchment will immediately absorb the ink and write back with mock answers, laughter, and solid advice!
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[11px] font-garamond italic text-[#725232]">
                  {isFormulatingReply ? 'Magic ink swirling on the page...' : 'Quill dipped in raven ink'}
                </span>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newContent.trim() || isFormulatingReply}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#442814] to-[#2e1808] hover:from-[#351e0e] hover:to-[#221004] disabled:opacity-50 text-amber-100 font-cinzel text-xs font-bold rounded shadow-lg transition-all flex items-center gap-2 hover:scale-105"
                >
                  <Feather className="w-4 h-4" />
                  <span>{isFormulatingReply ? 'Absorbing Ink...' : 'Pen to Parchment 🪶'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
