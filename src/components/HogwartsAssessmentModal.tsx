import React, { useState } from 'react';
import {
  PlayerCharacter,
  House,
  BloodStatus,
  Relationship,
} from '../types';
import {
  psychologicalQuestions,
  availableSuitors,
  SuitorProfile,
} from '../data/assessmentData';
import {
  evaluateAssessment,
  UserBasicInput,
  AssessmentResult,
} from '../utils/assessmentEngine';
import { soundEngine } from '../utils/audio';
import {
  Sparkles,
  Compass,
  Scroll,
  Eye,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Shield,
  Feather,
  Wand2,
  Heart,
} from 'lucide-react';

interface HogwartsAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResults: (
    character: PlayerCharacter,
    relationshipUpdater: (existing: Relationship[]) => Relationship[]
  ) => void;
}

type Stage = 'intro' | 'basic_info' | 'romance_select' | 'questions' | 'deliberating' | 'revelation';

export const HogwartsAssessmentModal: React.FC<HogwartsAssessmentModalProps> = ({
  isOpen,
  onClose,
  onApplyResults,
}) => {
  const [stage, setStage] = useState<Stage>('intro');
  const [basicInfo, setBasicInfo] = useState<UserBasicInput>({
    name: 'Rowan',
    preferredBloodStatus: 'Half-Blood',
    petType: 'Barn Owl',
    petName: 'Archimedes',
    romanticPreference: 'Boyfriend',
    selectedPartnerId: 'hat_match',
    customPartnerName: '',
    customPartnerHouse: 'Gryffindor',
  });

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [showHiddenDossier, setShowHiddenDossier] = useState(false);

  if (!isOpen) return null;

  const currentQ = psychologicalQuestions[currentQuestionIdx];
  const progressPercent = Math.round(
    ((currentQuestionIdx + 1) / psychologicalQuestions.length) * 100
  );

  const handleSelectOption = (optionId: string) => {
    soundEngine.playParchmentRustle();
    const newAnswers = { ...answers, [currentQ.id]: optionId };
    setAnswers(newAnswers);

    if (currentQuestionIdx < psychologicalQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      // Completed all questions
      setStage('deliberating');
      soundEngine.playPatronusBurst();

      setTimeout(() => {
        const result = evaluateAssessment(basicInfo, newAnswers);
        setAssessmentResult(result);
        setStage('revelation');
      }, 2600);
    }
  };

  const handleConfirmAcceptance = () => {
    if (!assessmentResult) return;
    soundEngine.playSpellCast('charm');
    onApplyResults(
      assessmentResult.character,
      assessmentResult.updatedRelationships
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-[#0f0e15] text-[#ded5c7] border-2 border-amber-600/50 rounded-xl max-w-3xl w-full p-5 sm:p-8 shadow-[0_0_50px_rgba(217,119,6,0.25)] relative my-auto">
        {/* Subtle candlelit glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />

        {/* STAGE 1: INTRO */}
        {stage === 'intro' && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-[#1e1713] border-2 border-amber-500/50 flex items-center justify-center text-3xl mx-auto shadow-inner animate-pulse">
              🎩
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-cinzel text-amber-500 tracking-widest font-bold">
                The Chamber of the Sorting Hat
              </span>
              <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-amber-200">
                The Hogwarts Soul Assessment
              </h1>
              <p className="text-xs sm:text-sm font-garamond italic text-[#a99986] max-w-lg mx-auto">
                “There’s nothing hidden in your head the Sorting Hat can’t see...”
              </p>
            </div>

            <div className="bg-[#18141f] border border-[#3b2e22] rounded-lg p-5 text-left text-xs sm:text-sm font-garamond text-[#c8bcab] space-y-3 max-w-xl mx-auto">
              <p>
                Before your third year at Hogwarts begins, the ancient magic of the castle must measure your true disposition.
              </p>
              <p className="italic text-amber-200/90 border-l-2 border-amber-500/60 pl-3">
                This is not a trivia game. You will be asked twelve profound questions examining morality, fear, ambition, loyalty, authority, and sacrifice. The Hat will secretly deduce your House, your wand, your family lineage, your Patronus, and your destined allies.
              </p>
              <p className="text-[#8e8070] text-xs">
                Deepest conclusions remain hidden so your path unfolds naturally in the story.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  soundEngine.playParchmentRustle();
                  setStage('basic_info');
                }}
                className="px-7 py-3 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-cinzel text-sm font-bold tracking-wider rounded-lg shadow-xl transition-all hover:scale-105 flex items-center gap-2"
              >
                <span>Step Onto the Stool</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 text-xs text-[#8e8070] hover:text-[#d0c0ac] font-cinzel"
              >
                Enter Directly
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: BASIC INFO */}
        {stage === 'basic_info' && (
          <div className="space-y-6">
            <div className="border-b border-[#2d2218] pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-cinzel text-amber-500 uppercase tracking-wider font-semibold">
                  First Inscription
                </span>
                <h2 className="font-cinzel text-xl text-amber-200 font-bold">
                  The Great Parchment Roll
                </h2>
              </div>
              <span className="text-2xl">📜</span>
            </div>

            <div className="space-y-4 text-xs font-garamond">
              <div>
                <label className="block font-cinzel text-xs text-amber-400 font-semibold mb-1">
                  Given Name (or Preferred Call-Name):
                </label>
                <input
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, name: e.target.value })
                  }
                  placeholder="e.g. Rowan, Lyra, Corvus, Julian"
                  className="w-full p-2.5 bg-[#18141f] border border-[#3b2e22] rounded text-sm text-amber-100 focus:outline-none focus:border-amber-500 font-garamond"
                />
                <span className="text-[11px] text-[#8e8070] italic">
                  *Your magical family surname will be assigned by the Hat based on your psychological heritage.
                </span>
              </div>

              <div>
                <label className="block font-cinzel text-xs text-amber-400 font-semibold mb-1.5">
                  Blood Heritage Reflection:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['Half-Blood', 'Pure-Blood', 'Muggle-Born'] as BloodStatus[]).map(
                    (status) => (
                      <button
                        type="button"
                        key={status}
                        onClick={() =>
                          setBasicInfo({
                            ...basicInfo,
                            preferredBloodStatus: status,
                          })
                        }
                        className={`p-3 rounded border text-left transition-all ${
                          basicInfo.preferredBloodStatus === status
                            ? 'bg-[#291e14] border-amber-500 text-amber-200 shadow-md'
                            : 'bg-[#15121b] border-[#2f241c] text-[#8a7c6c] hover:border-amber-700/50'
                        }`}
                      >
                        <div className="font-cinzel font-bold text-xs">
                          {status}
                        </div>
                        <div className="text-[10px] text-[#786c5e] mt-0.5">
                          {status === 'Pure-Blood'
                            ? 'Sacred ancient lineages and ancestral rites'
                            : status === 'Half-Blood'
                            ? 'A bridge between two worlds, versatile and perceptive'
                            : 'Fresh raw intuitive magic, free of dogma'}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#16121d] p-3 rounded border border-[#2d2319]">
                <div>
                  <label className="block font-cinzel text-[11px] text-amber-400 font-semibold mb-1">
                    Animal Companion:
                  </label>
                  <select
                    value={basicInfo.petType}
                    onChange={(e) =>
                      setBasicInfo({
                        ...basicInfo,
                        petType: e.target.value as typeof basicInfo.petType,
                      })
                    }
                    className="w-full p-2 bg-[#201929] border border-[#3e3022] rounded text-xs text-amber-100 font-garamond"
                  >
                    <option value="Barn Owl">Barn Owl</option>
                    <option value="Tawny Owl">Tawny Owl</option>
                    <option value="Black Cat">Black Cat</option>
                    <option value="Ginger Cat">Ginger Cat</option>
                    <option value="Toad">Toad</option>
                    <option value="Ferret">Ferret</option>
                  </select>
                </div>
                <div>
                  <label className="block font-cinzel text-[11px] text-amber-400 font-semibold mb-1">
                    Familiar Name:
                  </label>
                  <input
                    type="text"
                    value={basicInfo.petName}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, petName: e.target.value })
                    }
                    className="w-full p-2 bg-[#201929] border border-[#3e3022] rounded text-xs text-amber-100 font-garamond"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStage('intro')}
                className="text-xs text-[#8e8070] hover:text-amber-200"
              >
                Back
              </button>
              <button
                onClick={() => {
                  soundEngine.playParchmentRustle();
                  setStage('romance_select');
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-cinzel text-xs font-bold rounded shadow transition-all flex items-center gap-1.5"
              >
                <span>Continue: Whisperings of the Heart</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2.5: ROMANCE & COMPANION INCLINATION */}
        {stage === 'romance_select' && (
          <div className="space-y-6">
            <div className="border-b border-[#2d2218] pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-cinzel text-pink-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-pink-500/40 text-pink-400" />
                  <span>The Chamber of Desires</span>
                </span>
                <h2 className="font-cinzel text-xl text-amber-200 font-bold">
                  Hogwarts Romantic Companion
                </h2>
              </div>
              <span className="text-2xl">💫</span>
            </div>

            <div className="bg-[#18121d] border border-[#3e2c33] rounded-lg p-3 sm:p-4 text-xs font-garamond text-[#c8bcab] space-y-1">
              <p>
                Life during your third year at Hogwarts is fraught with Dementor cold and whispered dangers.
                Having someone special beside you—sharing stolen glances across the Great Hall, warm whispers behind the library stacks, or secret rendezvous on the Astronomy Tower—anchors your spirit.
              </p>
            </div>

            {/* Gender / Preference Selector */}
            <div className="space-y-2">
              <label className="block font-cinzel text-xs text-amber-300 font-bold">
                Whom does your heart yearn for at Hogwarts?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Boyfriend', label: 'A Boyfriend', icon: '💙', desc: 'Cedric, Harry, Oliver, Draco, Neville, Julian...' },
                  { id: 'Girlfriend', label: 'A Girlfriend', icon: '💖', desc: 'Hermione, Ginny, Luna, Pansy, Cho, Daphne...' },
                  { id: 'Any', label: 'Surprise Me', icon: '✨', desc: 'Let the Hat reveal the most compatible soul' },
                ].map((pref) => (
                  <button
                    type="button"
                    key={pref.id}
                    onClick={() => {
                      soundEngine.playParchmentRustle();
                      setBasicInfo({
                        ...basicInfo,
                        romanticPreference: pref.id as any,
                        // Reset to hat_match if changing preference
                        selectedPartnerId: 'hat_match',
                      });
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      basicInfo.romanticPreference === pref.id
                        ? 'bg-[#2b1827] border-pink-500 text-pink-100 shadow-lg scale-[1.02]'
                        : 'bg-[#15121b] border-[#2f241c] text-[#8a7c6c] hover:border-pink-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-cinzel font-bold text-xs">
                      <span>{pref.icon}</span>
                      <span>{pref.label}</span>
                    </div>
                    <div className="text-[10px] text-[#85747e] mt-1 leading-tight font-garamond">
                      {pref.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Suitor Selection Mode */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-cinzel text-amber-400 font-bold border-b border-[#2d2218] pb-1">
                <span>Select Your Companion or Let the Assessment Decide:</span>
                <span className="text-[11px] text-[#9a8a7a] font-normal">
                  {basicInfo.selectedPartnerId === 'hat_match'
                    ? 'Hat will pair dynamically'
                    : basicInfo.selectedPartnerId === 'custom'
                    ? 'Custom companion'
                    : 'Specific partner locked'}
                </span>
              </div>

              {/* Quick option: Hat Decides */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playParchmentRustle();
                  setBasicInfo({ ...basicInfo, selectedPartnerId: 'hat_match' });
                }}
                className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  basicInfo.selectedPartnerId === 'hat_match'
                    ? 'bg-[#291e14] border-amber-500 text-amber-200 shadow-md'
                    : 'bg-[#16121c] border-[#2e2319] text-[#958575] hover:border-amber-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎩✨</span>
                  <div>
                    <div className="font-cinzel font-bold text-xs text-amber-300">
                      Let the Hat & Psychological Quiz Deduce My Soulmate
                    </div>
                    <div className="text-[11px] font-garamond italic text-[#a99986]">
                      Your answers to the 13 moral dilemmas and loyalty tests will secretly forge the ideal connection.
                    </div>
                  </div>
                </div>
                <span className="text-xs font-cinzel text-amber-400">Recommended</span>
              </button>

              {/* Suitors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-900/40">
                {availableSuitors
                  .filter((s) => {
                    if (basicInfo.romanticPreference === 'Boyfriend') return s.gender === 'Boyfriend';
                    if (basicInfo.romanticPreference === 'Girlfriend') return s.gender === 'Girlfriend';
                    return true;
                  })
                  .map((suitor) => {
                    const isSelected = basicInfo.selectedPartnerId === suitor.id;
                    return (
                      <button
                        type="button"
                        key={suitor.id}
                        onClick={() => {
                          soundEngine.playSpellCast('charm');
                          setBasicInfo({
                            ...basicInfo,
                            selectedPartnerId: suitor.id,
                            romanticPreference: suitor.gender,
                          });
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-[#2b172a] border-pink-500/90 text-pink-100 shadow-md scale-[1.01]'
                            : 'bg-[#15121b] border-[#2d2218] text-[#a09080] hover:border-pink-800/50 hover:bg-[#1a1420]'
                        }`}
                      >
                        <span className="text-2xl">{suitor.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-cinzel text-xs font-bold text-pink-200 flex items-center justify-between">
                            <span>{suitor.name}</span>
                            <span className="text-[10px] font-normal text-[#8a7a88]">
                              {suitor.house}
                            </span>
                          </div>
                          <div className="text-[10px] font-garamond text-amber-300/80 italic truncate">
                            {suitor.dynamic}
                          </div>
                          <div className="text-[10px] text-[#7d6e7a] line-clamp-1 mt-0.5">
                            {suitor.personality}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                {/* Custom Partner Option */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playParchmentRustle();
                    setBasicInfo({ ...basicInfo, selectedPartnerId: 'custom' });
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2.5 ${
                    basicInfo.selectedPartnerId === 'custom'
                      ? 'bg-[#2b172a] border-pink-500/90 text-pink-100 shadow-md scale-[1.01]'
                      : 'bg-[#15121b] border-[#2d2218] text-[#a09080] hover:border-pink-800/50 hover:bg-[#1a1420]'
                  }`}
                >
                  <span className="text-2xl">✍️</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-cinzel text-xs font-bold text-pink-200">
                      Custom Hogwarts Companion
                    </div>
                    <div className="text-[10px] font-garamond text-amber-300/80 italic">
                      Inscribe your own custom character
                    </div>
                  </div>
                </button>
              </div>

              {/* If Custom Partner Selected */}
              {basicInfo.selectedPartnerId === 'custom' && (
                <div className="p-3 bg-[#1e1324] border border-pink-600/40 rounded-lg space-y-2 animate-fadeIn text-xs font-garamond">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-cinzel text-[11px] text-pink-300 font-bold mb-1">
                        Companion’s Full Name:
                      </label>
                      <input
                        type="text"
                        value={basicInfo.customPartnerName || ''}
                        onChange={(e) =>
                          setBasicInfo({ ...basicInfo, customPartnerName: e.target.value })
                        }
                        placeholder="e.g. Julian Fawcett, Alexander Ross, Lyra Blackwood"
                        className="w-full p-2 bg-[#140c19] border border-[#4a2e48] rounded text-xs text-pink-100 focus:outline-none focus:border-pink-400 font-garamond"
                      />
                    </div>
                    <div>
                      <label className="block font-cinzel text-[11px] text-pink-300 font-bold mb-1">
                        Companion’s Hogwarts House:
                      </label>
                      <select
                        value={basicInfo.customPartnerHouse || 'Gryffindor'}
                        onChange={(e) =>
                          setBasicInfo({
                            ...basicInfo,
                            customPartnerHouse: e.target.value as House,
                          })
                        }
                        className="w-full p-2 bg-[#140c19] border border-[#4a2e48] rounded text-xs text-pink-100 font-garamond"
                      >
                        <option value="Gryffindor">Gryffindor (Brave & Chivalrous)</option>
                        <option value="Slytherin">Slytherin (Ambitious & Cunning)</option>
                        <option value="Ravenclaw">Ravenclaw (Wise & Curious)</option>
                        <option value="Hufflepuff">Hufflepuff (Loyal & Patient)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStage('basic_info')}
                className="text-xs text-[#8e8070] hover:text-amber-200 font-cinzel"
              >
                ← Back to Parchment Roll
              </button>
              <button
                onClick={() => {
                  soundEngine.playParchmentRustle();
                  setStage('questions');
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-cinzel text-xs font-bold rounded shadow transition-all flex items-center gap-1.5"
              >
                <span>Place the Hat Upon Your Head</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: QUESTIONS */}
        {stage === 'questions' && (
          <div className="space-y-6">
            {/* Header with progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-cinzel text-[#8e8070]">
                <span className="text-amber-500 uppercase tracking-wider font-semibold">
                  {currentQ.category}
                </span>
                <span>
                  Dilemma {currentQuestionIdx + 1} of {psychologicalQuestions.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#1b1622] h-1.5 rounded-full overflow-hidden border border-[#3b2d1f]">
                <div
                  className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Dilemma card */}
            <div className="bg-[#16131c] border border-[#382b1f] rounded-lg p-5 sm:p-6 space-y-3 shadow-inner">
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200">
                {currentQ.title}
              </h3>
              <p className="text-xs text-[#9d8d7b] font-garamond italic">
                {currentQ.preamble}
              </p>
              <p className="text-xs sm:text-sm font-garamond leading-relaxed text-[#dfd3c3] pt-1">
                {currentQ.dilemma}
              </p>
            </div>

            {/* Options list */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className="w-full text-left p-3.5 sm:p-4 rounded-lg bg-[#18141f] border border-[#32261b] hover:border-amber-500/80 hover:bg-[#221a14] transition-all group shadow-sm flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel text-xs sm:text-sm font-bold text-amber-300 group-hover:text-amber-200">
                      {opt.label}
                    </span>
                    <span className="text-[10px] font-cinzel text-[#7e6d5b] opacity-0 group-hover:opacity-100 transition-opacity text-amber-400">
                      Select ✦
                    </span>
                  </div>
                  <p className="text-xs font-garamond text-[#cfc0ae] leading-relaxed">
                    {opt.text}
                  </p>
                </button>
              ))}
            </div>

            {currentQuestionIdx > 0 && (
              <div className="flex justify-start">
                <button
                  onClick={() =>
                    setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))
                  }
                  className="text-xs text-[#8e8070] hover:text-amber-200 font-cinzel"
                >
                  ← Previous Dilemma
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 4: DELIBERATING */}
        {stage === 'deliberating' && (
          <div className="text-center py-12 space-y-5">
            <div className="text-6xl animate-bounce">🎩✨</div>
            <h2 className="font-cinzel text-2xl text-amber-200 font-bold tracking-wide">
              The Hat Deliberates...
            </h2>
            <p className="text-sm font-garamond italic text-[#a99986] max-w-md mx-auto">
              “Hmm... difficult. Very difficult. Plenty of courage, I see... not a bad mind either. There’s talent, oh my goodness, yes... but where to put you?”
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto animate-pulse" />
          </div>
        )}

        {/* STAGE 5: REVELATION CEREMONY */}
        {stage === 'revelation' && assessmentResult && (
          <div className="space-y-6">
            {/* Sorting hat verdict banner */}
            <div className="text-center space-y-2 border-b border-[#2d2218] pb-5">
              <span className="text-xs font-cinzel uppercase text-amber-500 tracking-widest font-semibold">
                The Sorting Hat Proclaims
              </span>
              <h2 className="font-cinzel text-3xl font-black text-amber-200">
                {assessmentResult.character.house.toUpperCase()}!
              </h2>
              <p className="text-xs sm:text-sm font-garamond italic text-[#cfc0ae] max-w-xl mx-auto leading-relaxed">
                {assessmentResult.hatSpeech}
              </p>
            </div>

            {/* Public Acceptance Dossier Card */}
            <div className="bg-[#16121c] border border-amber-600/40 rounded-lg p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2f241a] pb-2 text-xs font-cinzel">
                <span className="text-amber-400 font-bold">
                  Official Hogwarts Matriculation
                </span>
                <span className="text-[#a09080]">
                  Year III · Term 1993–1994
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-garamond">
                <div className="p-3 bg-[#1d1724] rounded border border-[#3b2d1f]">
                  <span className="font-cinzel text-[11px] text-amber-400 font-bold block mb-0.5">
                    Student Name & Bloodline:
                  </span>
                  <div className="font-bold text-sm text-amber-200">
                    {assessmentResult.character.name}
                  </div>
                  <div className="text-[#8e8070] italic">
                    {assessmentResult.character.bloodStatus} · Lineage:{' '}
                    {assessmentResult.character.lineage.familyName}
                  </div>
                </div>

                <div className="p-3 bg-[#1d1724] rounded border border-[#3b2d1f]">
                  <span className="font-cinzel text-[11px] text-amber-400 font-bold block mb-0.5">
                    Assigned Wand (Ollivanders):
                  </span>
                  <div className="font-bold text-sm text-amber-200">
                    {assessmentResult.character.wand.wood} &{' '}
                    {assessmentResult.character.wand.core}
                  </div>
                  <div className="text-[#8e8070] italic">
                    {assessmentResult.character.wand.length} ·{' '}
                    {assessmentResult.character.wand.flexibility}
                  </div>
                </div>

                <div className="p-3 bg-[#1d1724] rounded border border-[#3b2d1f]">
                  <span className="font-cinzel text-[11px] text-amber-400 font-bold block mb-0.5">
                    Moral Temperament:
                  </span>
                  <div className="font-bold text-amber-200">
                    {assessmentResult.character.psychologicalProfile?.moralAlignment}
                  </div>
                  <div className="text-[#8e8070] italic">
                    {assessmentResult.character.psychologicalProfile?.coreStrength}
                  </div>
                </div>

                <div className="p-3 bg-[#1d1724] rounded border border-[#3b2d1f]">
                  <span className="font-cinzel text-[11px] text-amber-400 font-bold block mb-0.5">
                    Quidditch & Hogsmeade Habit:
                  </span>
                  <div className="font-bold text-amber-200">
                    {assessmentResult.character.psychologicalProfile?.quidditchRole}
                  </div>
                  <div className="text-[#8e8070] italic">
                    {assessmentResult.character.psychologicalProfile?.hogsmeadeHabit}
                  </div>
                </div>
              </div>

              {/* Romantic Partner Feature Card */}
              {assessmentResult.character.romanticPartner && (
                <div className="mt-3 p-3.5 bg-gradient-to-r from-[#2a1727] to-[#1c1224] rounded-lg border border-pink-700/50 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-pink-400 fill-pink-500/40" />
                    <span className="font-cinzel text-xs text-pink-300 font-bold uppercase tracking-wider">
                      Destined Hogwarts Companion ({assessmentResult.character.romanticPartner.gender})
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#391e32] border border-pink-500/40 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                      {assessmentResult.character.romanticPartner.avatar}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="font-cinzel font-bold text-sm text-pink-200 flex items-center gap-2">
                        <span>{assessmentResult.character.romanticPartner.name}</span>
                        <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-pink-950/60 text-pink-300 border border-pink-700/40">
                          {assessmentResult.character.romanticPartner.house} · {assessmentResult.character.romanticPartner.status}
                        </span>
                      </div>
                      <div className="text-xs font-garamond italic text-[#d4b8c6]">
                        Dynamic: {assessmentResult.character.romanticPartner.dynamic}
                      </div>
                      <div className="text-[11px] font-garamond text-amber-300/90 pt-0.5">
                        <span className="font-bold font-cinzel text-amber-400">✦ Sacred Keepsake:</span>{' '}
                        {assessmentResult.character.romanticPartner.keepsake}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Secret Dossier Drawer / Toggle */}
            <div className="border border-[#382b1f] rounded-lg p-4 bg-[#141019] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-cinzel text-amber-400 font-bold">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span>Hidden Psychological Inferences</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHiddenDossier(!showHiddenDossier)}
                  className="text-xs text-amber-400 hover:text-amber-200 underline font-cinzel"
                >
                  {showHiddenDossier ? 'Conceal Dossier' : 'Inspect Hidden Profile'}
                </button>
              </div>

              {showHiddenDossier ? (
                <div className="text-xs font-garamond text-[#c8bcab] space-y-2.5 pt-2 border-t border-[#2e2319] animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-[#1b1522] p-2 rounded">
                      <span className="font-bold text-amber-300">
                        Patronus Seed:
                      </span>{' '}
                      {assessmentResult.character.patronus.form} (
                      {assessmentResult.character.patronus.memory})
                    </div>
                    <div className="bg-[#1b1522] p-2 rounded">
                      <span className="font-bold text-red-300">
                        Boggart & Deepest Fear:
                      </span>{' '}
                      {assessmentResult.character.boggart.fear}
                    </div>
                    <div className="bg-[#1b1522] p-2 rounded">
                      <span className="font-bold text-sky-300">
                        Destined Allies:
                      </span>{' '}
                      {assessmentResult.character.psychologicalProfile?.destinedAllies.join(
                        ', '
                      )}
                    </div>
                    <div className="bg-[#1b1522] p-2 rounded">
                      <span className="font-bold text-orange-300">
                        Destined Rivals:
                      </span>{' '}
                      {assessmentResult.character.psychologicalProfile?.destinedRivals.join(
                        ', '
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#1f1826] rounded border border-[#3b2e22] text-[#bdae9c]">
                    <span className="font-bold text-amber-400 font-cinzel">
                      Sirius Black & Peter Pettigrew Inferences:
                    </span>
                    <p className="mt-1 italic">
                      {assessmentResult.character.psychologicalProfile?.siriusConnection}
                    </p>
                    <p className="mt-1 italic">
                      {assessmentResult.character.psychologicalProfile?.pettigrewInstinct}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] font-garamond italic text-[#7f7162]">
                  Your deepest Patronus memory, Boggart trauma, romantic affinities, and stance on Sirius Black are quietly woven into the story. You will discover them through your choices as the term unfolds.
                </p>
              )}
            </div>

            {/* Confirm button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleConfirmAcceptance}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-cinzel font-black tracking-wider text-sm rounded-lg shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Begin Your Personalized Hogwarts Adventure</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
