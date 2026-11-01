/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  initialPlayerCharacter,
  initialRelationships,
  initialLocations,
  initialSpells,
  initialInventory,
  initialOwlPost,
  initialDiscoveries,
  initialJournalEntries,
  initialMarauderFootprints,
  storyChapters,
} from './data/initialData';
import {
  PlayerCharacter,
  Relationship,
  InventoryItem,
  Spell,
  StoryChoice,
  JournalEntry,
  AdventureMemory,
} from './types';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { StoryView } from './components/StoryView';
import { AIOpenAdventureView } from './components/AIOpenAdventureView';
import { HogwartsAssessmentModal } from './components/HogwartsAssessmentModal';
import { MaraudersMapView } from './components/MaraudersMapView';
import { HogwartsMapView } from './components/HogwartsMapView';
import { RelationshipsView } from './components/RelationshipsView';
import { ClassesView } from './components/ClassesView';
import { InventoryView } from './components/InventoryView';
import { QuidditchMatch } from './components/QuidditchMatch';
import { OwlPostView } from './components/OwlPostView';
import { SecretsView } from './components/SecretsView';
import { CharacterProfilesView } from './components/CharacterProfilesView';
import { CommonRoomView } from './components/CommonRoomView';
import { JournalView } from './components/JournalView';
import { CharacterCreatorModal } from './components/CharacterCreatorModal';
import { BoggartLesson } from './components/BoggartLesson';
import { HippogriffLesson } from './components/HippogriffLesson';
import { PatronusLesson } from './components/PatronusLesson';
import { TimeTurnerRescue } from './components/TimeTurnerRescue';
import { soundEngine } from './utils/audio';
import { initialAdventureMemory } from './utils/aiStoryEngine';

export default function App() {
  const [character, setCharacter] = useState<PlayerCharacter>(initialPlayerCharacter);
  const [activeTab, setActiveTab] = useState<NavTab>('open_adventure');
  const [currentChapterId, setCurrentChapterId] = useState<string>('ch_train');
  const [currentLocation, setCurrentLocation] = useState<string>('Moving Corridors & Grand Staircase');
  const [activeMinigame, setActiveMinigame] = useState<
    'boggart' | 'hippogriff' | 'patronus' | 'quidditch' | 'timeTurner' | null
  >(null);

  const [isCurfew, setIsCurfew] = useState<boolean>(false);
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState<boolean>(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState<boolean>(true); // Opens on first visit

  const [relationships, setRelationships] = useState<Relationship[]>(initialRelationships);
  const [memory, setMemory] = useState<AdventureMemory>(initialAdventureMemory);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [spells, setSpells] = useState<Spell[]>(initialSpells);
  const [owlPost, setOwlPost] = useState(initialOwlPost);
  const [discoveries, setDiscoveries] = useState(initialDiscoveries);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournalEntries);
  const [footprints, setFootprints] = useState(initialMarauderFootprints);

  const unreadOwlPostCount = owlPost.filter((m) => !m.read).length;

  // Reward / Deduct House Points
  const handleAwardPoints = (points: number, reason: string) => {
    setCharacter((prev) => ({
      ...prev,
      housePoints: Math.max(0, prev.housePoints + points),
    }));

    if (Math.abs(points) >= 15) {
      setJournalEntries((prev) => [
        {
          id: `j_${Date.now()}`,
          date: 'Term 1993',
          title: `House Points: ${points > 0 ? `+${points}` : points}`,
          content: `${reason}. The hourglass sand shifted in the Great Hall.`,
          mood: points > 0 ? 'Hopeful' : 'Brooding',
          relatedEvent: reason,
        },
        ...prev,
      ]);
    }
  };

  const handleAddDetention = (amount: number) => {
    setCharacter((prev) => ({
      ...prev,
      detentions: prev.detentions + amount,
    }));
  };

  const handleAddDiscovery = (clue: string) => {
    setDiscoveries((prev) => [
      ...prev,
      {
        id: `disc_${Date.now()}`,
        title: clue,
        category: 'Castle Mysteries',
        description: `Uncovered during term investigation: ${clue}`,
        clue,
        foundAt: currentLocation,
        unlocked: true,
      },
    ]);
  };

  // Assessment results application
  const handleApplyAssessment = (
    newChar: PlayerCharacter,
    relationshipUpdater: (existing: Relationship[]) => Relationship[]
  ) => {
    setCharacter(newChar);
    setRelationships((prev) => relationshipUpdater(prev));
    soundEngine.playPatronusBurst();

    setJournalEntries((prev) => [
      {
        id: `j_sorting_${Date.now()}`,
        date: '1 September 1993',
        title: `Sorted into ${newChar.house}`,
        content: `The Sorting Hat took its time on my head before roaring ${newChar.house.toUpperCase()}. It spoke of ${newChar.psychologicalProfile?.moralAlignment || 'a quiet destiny'}. My wand is ${newChar.wand.wood} with a ${newChar.wand.core} core. My journey begins.`,
        mood: 'Enchanted',
        relatedEvent: 'The Sorting Ceremony',
      },
      ...prev,
    ]);
  };

  // Choice made inside the story view
  const handleChoiceMade = (choice: StoryChoice) => {
    if (choice.housePointsAward) {
      handleAwardPoints(choice.housePointsAward.points, choice.consequenceBadge || 'Story Choice');
    }

    if (choice.affinityChange) {
      handleUpdateAffinity(
        choice.affinityChange.characterId,
        choice.affinityChange.amount,
        `Reacted in the story: ${choice.consequenceBadge || 'Intervention'}`
      );
    }

    if (choice.secondaryAffinityChange) {
      handleUpdateAffinity(
        choice.secondaryAffinityChange.characterId,
        choice.secondaryAffinityChange.amount,
        `Allied in the story: ${choice.consequenceBadge || 'Cooperation'}`
      );
    }

    if (choice.unlockDiscoveryId) {
      setDiscoveries((prev) =>
        prev.map((d) => (d.id === choice.unlockDiscoveryId ? { ...d, unlocked: true } : d))
      );
    }
  };

  // Minigame completion callback
  const handleMinigameComplete = (housePoints: number, resultText: string) => {
    handleAwardPoints(housePoints, resultText);
    setActiveMinigame(null);
    soundEngine.playPatronusBurst();

    setJournalEntries((prev) => [
      {
        id: `j_${Date.now()}`,
        date: 'Term 1993',
        title: 'Triumph in Practical Magic',
        content: resultText,
        mood: 'Exhilarated',
        relatedEvent: 'Practical Exam',
      },
      ...prev,
    ]);
  };

  // Affinity update with characters
  const handleUpdateAffinity = (charId: string, amount: number, dialogue: string) => {
    setRelationships((prev) =>
      prev.map((rel) => {
        if (rel.id === charId) {
          const newAffinity = Math.max(-100, Math.min(100, rel.affinity + amount));
          let newStatus = rel.status;
          if (newAffinity >= 60) newStatus = 'Best Friend';
          else if (newAffinity >= 35) newStatus = 'Friend';
          else if (newAffinity <= -40) newStatus = 'Rival';
          else if (newAffinity < 0) newStatus = 'Wary';

          return {
            ...rel,
            affinity: newAffinity,
            status: newStatus,
            dialogueHistory: [dialogue, ...rel.dialogueHistory.slice(0, 4)],
          };
        }
        return rel;
      })
    );
  };

  const handleUpdateNuancedRelationships = (
    updates: { characterId: string; nuancedChanges: any; summaryReason: string }[]
  ) => {
    setRelationships((prev) =>
      prev.map((rel) => {
        const update = updates.find((u) => u.characterId === rel.id);
        if (!update) return rel;

        const currentNuance = rel.nuances || {
          trust: rel.affinity,
          affection: rel.affinity,
          suspicion: 15,
          rivalry: 0,
          respect: 60,
          resentment: 0,
          loyalty: 60,
          attraction: 10,
          fear: 10,
          admiration: 50,
          dominantDynamic: 'Shifting Regard',
          sharedSecrets: [],
          promisesMade: [],
          grievances: [],
        };

        const nc = update.nuancedChanges;
        const newTrust = Math.max(-100, Math.min(100, currentNuance.trust + (nc.trust || 0)));
        const newRespect = Math.max(0, Math.min(100, currentNuance.respect + (nc.respect || 0)));
        const newSuspicion = Math.max(0, Math.min(100, currentNuance.suspicion + (nc.suspicion || 0)));
        const newRivalry = Math.max(0, Math.min(100, currentNuance.rivalry + (nc.rivalry || 0)));
        const newAffection = Math.max(-100, Math.min(100, currentNuance.affection + (nc.affection || 0)));

        return {
          ...rel,
          affinity: Math.round((newTrust + newAffection) / 2),
          nuances: {
            ...currentNuance,
            trust: newTrust,
            respect: newRespect,
            suspicion: newSuspicion,
            rivalry: newRivalry,
            affection: newAffection,
          },
        };
      })
    );
  };

  // Location interaction
  const handleLocationInteract = (locationId: string, interactionId: string) => {
    setCurrentLocation(locationId.replace(/_/g, ' ').toUpperCase());
    handleAwardPoints(5, `Explored Hogwarts: ${locationId}`);
  };

  // Inventory usage
  const handleUseItem = (itemId: string) => {
    if (itemId === 'honeydukes_chocolate') {
      setCharacter((prev) => ({
        ...prev,
        stats: { ...prev.stats, Bravery: Math.min(100, prev.stats.Bravery + 5) },
      }));
    }
  };

  // Owl post actions
  const handleMarkOwlRead = (messageId: string) => {
    setOwlPost((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
    );
  };

  const handleSendOwlReply = (recipient: string, text: string) => {
    handleAwardPoints(5, `Dispatched Owl correspondence to ${recipient}`);
  };

  // Midnight curfew sneak
  const handleCurfewSneak = () => {
    handleAwardPoints(10, 'Evaded Filch and Mrs. Norris during midnight patrol');
  };

  // Add custom entry to journal
  const handleAddJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `j_${Date.now()}`,
    };
    setJournalEntries((prev) => [newEntry, ...prev]);
  };

  const handleUpdateJournalEntry = (entryId: string, updated: Partial<JournalEntry>) => {
    setJournalEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, ...updated } : e))
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e0d6c3] flex flex-col font-garamond selection:bg-amber-900/60 selection:text-amber-100">
      {/* Top Header */}
      <Header
        character={character}
        isCurfew={isCurfew}
        onToggleCurfew={() => setIsCurfew(!isCurfew)}
        onOpenCharacterModal={() => setIsCharacterModalOpen(true)}
        onOpenAssessment={() => setIsAssessmentOpen(true)}
        onOpenJournal={() => setIsJournalOpen(true)}
        isJournalOpen={isJournalOpen}
        housePoints={character.housePoints}
      />

      {/* Primary Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          soundEngine.playParchmentRustle();
          setActiveTab(tab);
          setActiveMinigame(null);
        }}
        unreadOwlPostCount={unreadOwlPostCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 px-2 sm:px-4">
        {/* Dedicated Active Minigame Overlay or Inline */}
        {activeMinigame === 'boggart' && (
          <BoggartLesson
            onComplete={handleMinigameComplete}
            onClose={() => setActiveMinigame(null)}
          />
        )}

        {activeMinigame === 'hippogriff' && (
          <HippogriffLesson
            onComplete={handleMinigameComplete}
            onClose={() => setActiveMinigame(null)}
          />
        )}

        {activeMinigame === 'patronus' && (
          <PatronusLesson
            playerPatronus={character.patronus}
            onComplete={handleMinigameComplete}
            onClose={() => setActiveMinigame(null)}
          />
        )}

        {activeMinigame === 'quidditch' && (
          <QuidditchMatch
            onComplete={handleMinigameComplete}
            onClose={() => setActiveMinigame(null)}
          />
        )}

        {activeMinigame === 'timeTurner' && (
          <TimeTurnerRescue
            onComplete={handleMinigameComplete}
            onClose={() => setActiveMinigame(null)}
          />
        )}

        {/* Normal Views when no full-stage minigame is active */}
        {!activeMinigame && (
          <>
            {activeTab === 'open_adventure' && (
              <AIOpenAdventureView
                character={character}
                relationships={relationships}
                memory={memory}
                currentLocation={currentLocation}
                isCurfew={isCurfew}
                onUpdateMemory={setMemory}
                onUpdateRelationships={handleUpdateNuancedRelationships}
                onAwardPoints={handleAwardPoints}
                onAddDetention={handleAddDetention}
                onAddDiscovery={handleAddDiscovery}
              />
            )}

            {activeTab === 'story' && (
              <StoryView
                chapters={storyChapters}
                currentChapterId={currentChapterId}
                onSelectChapter={(id) => setCurrentChapterId(id)}
                onMakeChoice={handleChoiceMade}
                character={character}
                onTriggerMinigame={(type) => {
                  if (type === 'marauder') {
                    setActiveTab('marauder');
                  } else {
                    setActiveMinigame(type);
                  }
                }}
              />
            )}

            {activeTab === 'common_room' && (
              <CommonRoomView
                character={character}
                onAwardPoints={handleAwardPoints}
                onAddDiscovery={handleAddDiscovery}
                onAddJournalEntry={(entry) => setJournalEntries((prev) => [entry, ...prev])}
              />
            )}

            {activeTab === 'marauder' && (
              <MaraudersMapView
                footprints={footprints}
                onInspectPerson={(name) => {
                  soundEngine.playParchmentRustle();
                  setActiveTab('dossiers');
                }}
              />
            )}

            {activeTab === 'hogwarts_map' && (
              <HogwartsMapView
                locations={initialLocations}
                onInteract={handleLocationInteract}
                isCurfew={isCurfew}
              />
            )}

            {activeTab === 'relationships' && (
              <RelationshipsView
                relationships={relationships}
                character={character}
                onUpdateAffinity={handleUpdateAffinity}
              />
            )}

            {activeTab === 'classes' && (
              <ClassesView
                onLaunchBoggart={() => setActiveMinigame('boggart')}
                onLaunchHippogriff={() => setActiveMinigame('hippogriff')}
                onLaunchPatronus={() => setActiveMinigame('patronus')}
                onAwardPoints={handleAwardPoints}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                items={inventory}
                spells={spells}
                character={character}
                onUseItem={handleUseItem}
              />
            )}

            {activeTab === 'quidditch' && (
              <QuidditchMatch
                onComplete={handleMinigameComplete}
              />
            )}

            {activeTab === 'owl_post' && (
              <OwlPostView
                messages={owlPost}
                onMarkRead={handleMarkOwlRead}
                onSendReply={handleSendOwlReply}
              />
            )}

            {activeTab === 'discoveries' && (
              <SecretsView
                discoveries={discoveries}
                onCurfewSneak={handleCurfewSneak}
                isCurfew={isCurfew}
              />
            )}

            {activeTab === 'dossiers' && (
              <CharacterProfilesView />
            )}
          </>
        )}
      </main>

      {/* Psychological Compatibility Assessment Modal */}
      <HogwartsAssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        onApplyResults={handleApplyAssessment}
      />

      {/* Student Journal Sidebar Drawer */}
      <JournalView
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={journalEntries}
        onAddEntry={handleAddJournalEntry}
        onUpdateEntry={handleUpdateJournalEntry}
        character={character}
      />

      {/* Character Customizer Modal */}
      <CharacterCreatorModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        character={character}
        onSave={(updated) => setCharacter(updated)}
      />

      {/* Footer Ambient Info */}
      <footer className="border-t border-[#251e18] py-4 text-center text-xs text-[#7d6f5f] font-cinzel">
        <p>Hogwarts School of Witchcraft and Wizardry · 1993–1994 Academic Term</p>
        <p className="text-[10px] text-[#5c4f42] mt-0.5">
          “Draco Dormiens Nunquam Titillandus”
        </p>
      </footer>
    </div>
  );
}
