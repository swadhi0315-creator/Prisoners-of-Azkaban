export type House = 'Gryffindor' | 'Slytherin' | 'Ravenclaw' | 'Hufflepuff';

export type CharacterTrait = 'Bravery' | 'Cunning' | 'Lore' | 'Loyalty' | 'Stealth';

export type BloodStatus = 'Pure-Blood' | 'Half-Blood' | 'Muggle-Born';

export interface PsychologicalProfile {
  moralAlignment: string; // e.g., 'Principled Rebel', 'Stoic Guardian', 'Pragmatic Strategist', 'Compassionate Loyalist'
  greatestFear: string;
  hiddenWeakness: string;
  coreStrength: string;
  favoriteSubject: string;
  dislikedSubject: string;
  quidditchRole: string;
  hogsmeadeHabit: string;
  ruleTendency: 'Principled Defier' | 'Pragmatic Loopholer' | 'Strict Disciplinarian' | 'Quiet Outlaw';
  factionLean: 'Order of the Phoenix Ally' | 'Neutral Independent' | 'Shadow / Ancient Magic Traditionalist';
  destinedAllies: string[];
  destinedRivals: string[];
  destinedRomanceHint: string;
  siriusConnection: string;
  pettigrewInstinct: string;
  assessmentNotes: string[];
}

export interface RomanticPartner {
  id: string;
  name: string;
  gender: 'Boyfriend' | 'Girlfriend';
  house: House;
  role: string;
  avatar: string;
  dynamic: string;
  status: 'Boyfriend' | 'Girlfriend' | 'Mutual Secret Crush' | 'Devoted Partner';
  sharedMemory: string;
  keepsake: string;
  introEncounter: string;
}

export interface PlayerCharacter {
  name: string;
  house: House;
  bloodStatus: BloodStatus;
  lineage: {
    familyName: string;
    reputation: string;
    ancestralGift: string;
  };
  wand: {
    wood: string;
    core: string;
    length: string;
    flexibility: string;
  };
  pet: {
    type: 'Barn Owl' | 'Tawny Owl' | 'Black Cat' | 'Ginger Cat' | 'Toad' | 'Ferret';
    name: string;
  };
  electives: string[];
  stats: {
    Bravery: number;
    Cunning: number;
    Lore: number;
    Loyalty: number;
    Stealth: number;
  };
  patronus: {
    form: string;
    memory: string;
    mastered: boolean;
  };
  boggart: {
    fear: string;
    ridiculousForm: string;
  };
  romanticPartner?: RomanticPartner;
  psychologicalProfile?: PsychologicalProfile;
  housePoints: number;
  detentions: number;
  year: number;
}

export interface NuancedRelationshipDynamics {
  trust: number; // -100 to 100
  affection: number; // -100 to 100
  suspicion: number; // 0 to 100
  rivalry: number; // 0 to 100
  respect: number; // 0 to 100
  resentment: number; // 0 to 100
  loyalty: number; // 0 to 100
  attraction: number; // 0 to 100
  fear: number; // 0 to 100
  admiration: number; // 0 to 100
  dominantDynamic: string;
  sharedSecrets: string[];
  promisesMade: string[];
  grievances: string[];
}

export interface Relationship {
  id: string;
  name: string;
  role: string;
  house?: House;
  affinity: number; // -100 to 100
  status: 'Friend' | 'Best Friend' | 'Rival' | 'Nemesis' | 'Crush' | 'Mentor' | 'Wary' | 'Neutral';
  avatar: string;
  personality: string;
  description: string;
  memorableMoment: string;
  dialogueHistory: string[];
  quotes: string[];
  nuances?: NuancedRelationshipDynamics;
}

export interface AdventureMemory {
  personalityTraits: string[];
  coreFears: string[];
  activeSecrets: string[];
  brokenPromises: string[];
  keptPromises: string[];
  recentLocations: string[];
  academicReputation: string;
  disciplinaryStatus: { detentions: number; housePoints: number; currentWarnings: string[] };
  inventoryHistory: string[];
  uncoveredClues: string[];
  journalThemes: string[];
  conversationLog: { speaker: string; text: string; location: string; timestamp: string }[];
}

export interface SpontaneousEvent {
  id: string;
  type:
    | 'character_approach'
    | 'mysterious_clue'
    | 'detention_threat'
    | 'heated_argument'
    | 'secret_invitation'
    | 'quidditch_moment'
    | 'library_whisper'
    | 'dementor_chill'
    | 'hogsmeade_rumor'
    | 'marauder_anomaly'
    | 'forbidden_forest_sighting';
  title: string;
  description: string;
  characterInvolved?: string;
  location: string;
  isUrgent?: boolean;
  choices?: { text: string; action: string }[];
}

export interface AITurnResponse {
  narrative: string[];
  characterSpeech?: { speaker: string; speech: string; expression: string }[];
  consequences: {
    housePointsChange?: number;
    detentionChange?: number;
    newItem?: InventoryItem;
    discoveredClue?: string;
    newSecret?: string;
  };
  relationshipUpdates: {
    characterId: string;
    nuancedChanges: Partial<NuancedRelationshipDynamics>;
    summaryReason: string;
  }[];
  spontaneousEvent?: SpontaneousEvent | null;
  suggestedIntentions: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Artifact' | 'Sweet' | 'Book' | 'Potion' | 'Curiosity' | 'Equipment';
  description: string;
  icon: string;
  obtainedAt: string;
  actionName?: string;
  consumable?: boolean;
}

export interface Spell {
  id: string;
  incantation: string;
  name: string;
  effect: string;
  difficulty: 'Beginner' | 'Year 3 Standard' | 'Advanced NEWT Level';
  wandMovement: string;
  unlocked: boolean;
  flavor: string;
}

export interface StoryChoice {
  id: string;
  text: string;
  traitCheck?: {
    trait: CharacterTrait;
    threshold: number;
  };
  housePointsAward?: {
    house: House;
    points: number;
  };
  affinityChange?: {
    characterId: string;
    amount: number;
  };
  secondaryAffinityChange?: {
    characterId: string;
    amount: number;
  };
  outcomeNarrative: string;
  consequenceBadge?: string;
  unlockDiscoveryId?: string;
  nextChapterId?: string;
  minigameTrigger?: 'boggart' | 'hippogriff' | 'patronus' | 'quidditch' | 'marauder' | 'timeTurner';
}

export interface StoryChapter {
  id: string;
  act: number;
  actTitle: string;
  title: string;
  timelineDate: string;
  location: string;
  summary: string;
  fullNarrative: string[];
  atmosphericNotes: string;
  cinematicVisual: string;
  choices: StoryChoice[];
  requiredCompletedChapterId?: string;
}

export interface HogwartsLocation {
  id: string;
  name: string;
  area: 'Castle Interior' | 'Grounds' | 'Secret Passages' | 'High Towers' | 'Outskirts';
  description: string;
  atmosphere: string;
  dangers: string;
  imageBg: string;
  occupants: string[];
  unlockedByDefault: boolean;
  curfewRisk: 'Safe' | 'Moderate' | 'Severe';
  interactions: {
    id: string;
    label: string;
    description: string;
    traitReward?: CharacterTrait;
    housePointChange?: number;
    discoveredSecret?: string;
  }[];
}

export interface OwlPostMessage {
  id: string;
  sender: string;
  senderRole: string;
  date: string;
  subject: string;
  body: string;
  read: boolean;
  isUrgent?: boolean;
  waxSealColor: string;
  enclosedItem?: InventoryItem;
}

export interface Discovery {
  id: string;
  title: string;
  category: 'Secret Passages' | 'Forbidden Lore' | 'Castle Mysteries' | 'Sirius Black Clues';
  description: string;
  clue: string;
  foundAt: string;
  unlocked: boolean;
}

export interface JournalReply {
  speakerName: string;
  tone: 'mocking' | 'playful' | 'sagacious' | 'sympathetic' | 'conspiratorial';
  mockResponse: string;
  solidAdvice: string;
  highLowReaction?: string;
  marginQuirk?: string;
  timestamp: string;
}

export interface JournalConversation {
  id: string;
  sender: 'player' | 'journal';
  text: string;
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 'Hopeful' | 'Terrified' | 'Defiant' | 'Enchanted' | 'Brooding' | 'Exhilarated';
  relatedEvent: string;
  journalVoice?: 'marauder' | 'sage' | 'sarcastic' | 'romantic';
  reply?: JournalReply;
  conversations?: JournalConversation[];
}

export interface MarauderFootprint {
  id: string;
  name: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  room: string;
  direction: number; // angle in degrees
  status: 'Walking' | 'Pacing' | 'Stationary' | 'Sneaking';
  isPettigrew?: boolean;
}
