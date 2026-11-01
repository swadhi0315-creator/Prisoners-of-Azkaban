import React, { useState } from 'react';
import { StoryChapter, StoryChoice, PlayerCharacter } from '../types';
import { soundEngine } from '../utils/audio';
import { Compass, Sparkles, Award, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

interface StoryViewProps {
  chapters: StoryChapter[];
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  onMakeChoice: (choice: StoryChoice) => void;
  character: PlayerCharacter;
  onTriggerMinigame: (type: 'boggart' | 'hippogriff' | 'patronus' | 'quidditch' | 'marauder' | 'timeTurner') => void;
}

export const StoryView: React.FC<StoryViewProps> = ({
  chapters,
  currentChapterId,
  onSelectChapter,
  onMakeChoice,
  character,
  onTriggerMinigame,
}) => {
  const currentChapter = chapters.find((c) => c.id === currentChapterId) || chapters[0];
  const [lastChoiceOutcome, setLastChoiceOutcome] = useState<StoryChoice | null>(null);

  const handleChoice = (choice: StoryChoice) => {
    soundEngine.playParchmentRustle();
    setLastChoiceOutcome(choice);
    onMakeChoice(choice);

    if (choice.minigameTrigger) {
      setTimeout(() => {
        onTriggerMinigame(choice.minigameTrigger!);
      }, 800);
    }
  };

  const handleNextChapter = (nextId?: string) => {
    if (nextId) {
      soundEngine.playParchmentRustle();
      onSelectChapter(nextId);
      setLastChoiceOutcome(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-4 px-2 sm:px-4 space-y-6">
      {/* Chapter timeline & act indicator */}
      <div className="bg-[#14121a] border border-[#3b2e22] rounded-lg p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-cinzel text-amber-500 uppercase tracking-widest font-bold">
            {currentChapter.actTitle}
          </span>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-200 mt-0.5">
            {currentChapter.title}
          </h2>
          <div className="text-xs font-garamond italic text-[#9e8f7d] mt-1 flex items-center gap-2">
            <span>{currentChapter.timelineDate}</span>
            <span>·</span>
            <span>Location: {currentChapter.location}</span>
          </div>
        </div>

        {/* Chapter select selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-cinzel text-[#8e8070] hidden sm:inline">
            Chapter:
          </label>
          <select
            value={currentChapter.id}
            onChange={(e) => {
              onSelectChapter(e.target.value);
              setLastChoiceOutcome(null);
            }}
            className="p-2 bg-[#1d1724] border border-[#3e3022] rounded text-xs text-amber-200 font-cinzel font-semibold max-w-[240px]"
          >
            {chapters.map((ch, idx) => (
              <option key={ch.id} value={ch.id}>
                {idx + 1}. {ch.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Narrative Stage Box */}
      <div className="bg-[#131118] border border-[#3a2d21] rounded-lg p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Atmospheric mood box */}
        <div className="p-3 bg-[#1a1522] border-l-4 border-amber-600/70 rounded-r text-xs font-garamond italic text-[#b5a794]">
          <span className="font-cinzel text-amber-400 font-semibold not-italic mr-1.5">
            Atmosphere:
          </span>
          {currentChapter.atmosphericNotes}
        </div>

        {/* Narrative prose paragraphs */}
        <div className="space-y-4 font-garamond text-base sm:text-lg leading-relaxed text-[#dfd4c4]">
          {currentChapter.fullNarrative.map((para, idx) => (
            <p key={idx} className="first-letter:font-cinzel first-letter:text-xl">
              {para}
            </p>
          ))}
        </div>

        {/* Outcome consequence alert if choice was made */}
        {lastChoiceOutcome && (
          <div className="p-4 bg-[#18261e] border border-emerald-600/50 rounded-lg text-xs font-garamond text-emerald-200 space-y-2 animate-fadeIn">
            <div className="font-cinzel text-sm font-bold text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Consequence: {lastChoiceOutcome.consequenceBadge || 'Action Resolved'}</span>
            </div>
            <p className="italic text-[#d0e4d2] text-sm">
              {lastChoiceOutcome.outcomeNarrative}
            </p>

            {lastChoiceOutcome.nextChapterId && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleNextChapter(lastChoiceOutcome.nextChapterId)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-cinzel text-xs font-bold rounded flex items-center gap-1.5 shadow transition-all"
                >
                  <span>Advance to Next Chapter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Interactive Story Choices */}
        <div className="space-y-3 pt-4 border-t border-[#2e2319]">
          <div className="text-xs font-cinzel text-amber-400 font-bold uppercase tracking-wider">
            Choose Your Course of Action:
          </div>

          <div className="space-y-2.5">
            {currentChapter.choices.map((choice) => {
              const isSelected = lastChoiceOutcome?.id === choice.id;

              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  className={`w-full text-left p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-[#291e14] border-amber-500 text-amber-200 shadow-lg'
                      : 'bg-[#18141f] border-[#362b20] hover:border-amber-600/70 text-[#d0c3b0] hover:text-amber-100'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-garamond text-sm sm:text-base font-semibold group-hover:text-amber-200 transition-colors">
                      {choice.text}
                    </div>

                    {choice.traitCheck && (
                      <div className="text-[11px] font-cinzel text-[#8e8070] flex items-center gap-1">
                        <span>Requires: {choice.traitCheck.trait} ({choice.traitCheck.threshold}+)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {choice.minigameTrigger && (
                      <span className="text-[10px] font-cinzel px-2 py-0.5 bg-amber-950/60 text-amber-300 rounded border border-amber-600/40 font-bold">
                        Interactive Event ✦
                      </span>
                    )}
                    <span className="text-xs font-cinzel text-amber-400 group-hover:translate-x-1 transition-transform">
                      Choose →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
