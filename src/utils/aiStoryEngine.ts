import {
  PlayerCharacter,
  Relationship,
  AdventureMemory,
  AITurnResponse,
  SpontaneousEvent,
  NuancedRelationshipDynamics,
} from '../types';

export const initialAdventureMemory: AdventureMemory = {
  personalityTraits: ['Observant', 'Defiant', 'Loyal', 'Tactical'],
  coreFears: ['Dementor cold', 'Helplessness when allies are in danger'],
  activeSecrets: [],
  brokenPromises: [],
  keptPromises: [],
  recentLocations: ['Hogwarts Express', 'Great Hall', 'Moving Staircases'],
  academicReputation: 'Promising third-year student with keen defensive instinct',
  disciplinaryStatus: { detentions: 0, housePoints: 125, currentWarnings: [] },
  inventoryHistory: ['Wand', 'Marauder’s Map', 'Honeydukes chocolate'],
  uncoveredClues: [],
  journalThemes: ['The chill of Azkaban guards', 'Secrets beneath the castle'],
  conversationLog: [],
};

export const spontaneousEventsCatalog: SpontaneousEvent[] = [
  {
    id: 'spont_romantic_encounter',
    type: 'character_approach',
    title: 'A Stolen Whisper by the Tapestry',
    description:
      'A warm hand catches your sleeve in the quiet alcove behind the tapestry of Barnabas the Barmy. Soft laughter breaks the heavy silence, and you turn to find your companion standing close, their eyes alight with relief.',
    location: 'Barnabas Tapestry Alcove',
    isUrgent: false,
    choices: [
      {
        text: 'Reach out, pull them gently into the candlelit shadow, and ask how they have been holding up.',
        action: 'pull_companion_close_whisper',
      },
      {
        text: 'Present their cherished keepsake and softly tell them how much their presence means to you.',
        action: 'show_companion_keepsake',
      },
      {
        text: 'Step close and share a breathless, tender embrace under the shelter of the stone archway.',
        action: 'tender_embrace_companion',
      },
    ],
  },
  {
    id: 'spont_hermione_time',
    type: 'character_approach',
    title: 'Hermione’s Impossible Timetable',
    description:
      'Hermione bursts around the library corner clutching four heavy tomes, eyes shadowed with fatigue. She dropped her Arithmancy notes—and you notice a tiny glint of a golden hourglass chain tucked beneath her collar.',
    characterInvolved: 'Hermione Granger',
    location: 'The Library Corridor',
    isUrgent: false,
    choices: [
      {
        text: 'Help her gather the scattered scrolls and quietly ask if she is carrying too heavy a burden.',
        action: 'approach_hermione_gentle',
      },
      {
        text: 'Point out that she was just in Muggle Studies across the castle five minutes ago, pressing for the truth.',
        action: 'question_hermione_timetable',
      },
      {
        text: 'Hand back her notes in silent respect, keeping her secret without prying.',
        action: 'respect_hermione_secret',
      },
    ],
  },
  {
    id: 'spont_lupin_tea',
    type: 'secret_invitation',
    title: 'An Evening Invitation from Professor Lupin',
    description:
      'A small folded scrap of parchment arrives via a school barn owl: “Rowan, if you have an hour before curfew, I would welcome your thoughts on Dark Creature wards over tea in my office. — R.J. Lupin”',
    characterInvolved: 'Remus Lupin',
    location: 'DADA Office',
    isUrgent: false,
    choices: [
      {
        text: 'Accept immediately and visit his office before the evening bells ring.',
        action: 'visit_lupin_office',
      },
      {
        text: 'Inspect the note with a Sneakoscope first, remaining cautious during these tense times.',
        action: 'inspect_lupin_note',
      },
    ],
  },
  {
    id: 'spont_dementor_chill',
    type: 'dementor_chill',
    title: 'The Frost on the Moving Staircase',
    description:
      'Midway up the grand staircase, the torch flames sputter to sickly blue embers. The temperature plunges. Freezing frost spiders across the stone bannisters. Hovering outside the arched window is the ragged gray cowl of a Dementor.',
    location: 'Grand Staircase',
    isUrgent: true,
    choices: [
      {
        text: 'Raise your wand, search your soul for incandescent joy, and project a silver shield!',
        action: 'cast_silver_shield',
      },
      {
        text: 'Rally the younger students behind you and retreat calmly toward the warmth of the Great Hall.',
        action: 'rally_students_retreat',
      },
      {
        text: 'Reach into your pocket for Lupin’s Honeydukes chocolate and hold your ground.',
        action: 'eat_chocolate_hold_ground',
      },
    ],
  },
  {
    id: 'spont_malfoy_ambush',
    type: 'heated_argument',
    title: 'A Taunt in the Viaduct Courtyard',
    description:
      'Draco Malfoy, Crabbe, and Goyle corner Neville Longbottom by the gargoyles, holding his Trevor the Toad just out of reach and laughing about Buckbeak’s looming execution.',
    characterInvolved: 'Draco Malfoy',
    location: 'Viaduct Courtyard',
    isUrgent: true,
    choices: [
      {
        text: 'Step directly between Malfoy and Neville, drawing your wand with calm, deadly focus.',
        action: 'confront_malfoy_wand',
      },
      {
        text: 'Cast a silent tripping jinx on Crabbe and snatch Trevor back in the confusion.',
        action: 'jinx_malfoy_cronies',
      },
      {
        text: 'Mock Malfoy’s bandaged arm from the Hippogriff lesson until the crowd laughs him away.',
        action: 'mock_malfoy_arm',
      },
    ],
  },
  {
    id: 'spont_crookshanks_rat',
    type: 'mysterious_clue',
    title: 'Crookshanks’ Frenzied Hunt',
    description:
      'In the common room, Hermione’s ginger cat Crookshanks leaps with unsheathed claws toward Ron’s armchair! Ron shrieks as Scabbers the rat bites his knuckle and scrambles wildly under the wainscoting. The rat looks at you with terrifyingly human, panicked eyes.',
    characterInvolved: 'Ron Weasley',
    location: 'Gryffindor Common Room',
    isUrgent: false,
    choices: [
      {
        text: 'Kneel and examine the floorboards where the rat vanished, noting the missing toe claw-mark.',
        action: 'inspect_scabbers_tracks',
      },
      {
        text: 'Calm Ron down and clean his bitten finger with a quick healing charm.',
        action: 'comfort_ron_bite',
      },
      {
        text: 'Gently stroke Crookshanks and murmur that you understand what he sees.',
        action: 'ally_with_crookshanks',
      },
    ],
  },
  {
    id: 'spont_snape_patrol',
    type: 'detention_threat',
    title: 'A Billowing Shadow in the Dungeons',
    description:
      'Footsteps echo on damp flagstones. Professor Snape glides around the pillar like an enormous bat. His obsidian eyes fix upon you. “Out of your dormitories, Vance? Explain yourself before I subtract fifty points.”',
    characterInvolved: 'Severus Snape',
    location: 'Dungeons Corridor',
    isUrgent: true,
    choices: [
      {
        text: 'Politely claim you were returning an overdue brewing treatise to the potions annex.',
        action: 'excuse_potions_treatise',
      },
      {
        text: 'Stand in respectful silence, offering a formal apology without concocting a clumsy lie.',
        action: 'dignified_apology_snape',
      },
      {
        text: 'Cast an illusion distraction around the corner and slip silently into the shadows.',
        action: 'stealth_slip_shadows',
      },
    ],
  },
];

// Helper to ensure relationships have nuanced dynamic properties
export function ensureNuancedDynamics(
  rel: Relationship,
  characterHouse?: string
): NuancedRelationshipDynamics {
  if (rel.nuances) return rel.nuances;

  let trust = 50;
  let affection = 50;
  let suspicion = 15;
  let rivalry = 0;
  let respect = 60;
  let resentment = 0;
  let loyalty = 50;
  let attraction = 10;
  let fear = 10;
  let admiration = 50;
  let dominantDynamic = 'Cautious Respect';

  switch (rel.id) {
    case 'lupin':
      trust = 75;
      affection = 70;
      respect = 85;
      admiration = 85;
      dominantDynamic = 'Warm Mentor with Hidden Burdens';
      break;
    case 'snape':
      trust = -15;
      affection = -35;
      suspicion = 75;
      rivalry = 50;
      respect = 45;
      fear = 60;
      admiration = 30;
      dominantDynamic = 'Acidic Scrutiny & Severe Standards';
      break;
    case 'harry':
      trust = 65;
      affection = 60;
      respect = 70;
      loyalty = 75;
      admiration = 65;
      dominantDynamic = 'Fellow Seeker & Kindred Spirit';
      break;
    case 'hermione':
      trust = 75;
      affection = 70;
      respect = 90;
      loyalty = 80;
      admiration = 80;
      dominantDynamic = 'Intellectual Confidante & Fierce Ally';
      break;
    case 'ron':
      trust = 70;
      affection = 65;
      respect = 55;
      loyalty = 85;
      admiration = 50;
      dominantDynamic = 'Loyal Hearthside Comrade';
      break;
    case 'draco':
      trust = -55;
      affection = -70;
      suspicion = 80;
      rivalry = 90;
      respect = 30;
      resentment = 75;
      dominantDynamic = 'Bitter Aristocratic Rivalry';
      break;
    case 'neville':
      trust = 80;
      affection = 75;
      respect = 65;
      loyalty = 85;
      admiration = 75;
      dominantDynamic = 'Quiet Brotherhood & Mutual Support';
      break;
    case 'hagrid':
      trust = 90;
      affection = 90;
      respect = 80;
      loyalty = 95;
      admiration = 75;
      dominantDynamic = 'Tender Protective Giant';
      break;
    case 'mcgonagall':
      trust = 65;
      affection = 50;
      respect = 92;
      loyalty = 75;
      admiration = 85;
      dominantDynamic = 'Strict Maternal Vigilance';
      break;
    case 'dumbledore':
      trust = 85;
      affection = 65;
      respect = 98;
      admiration = 95;
      dominantDynamic = 'Enigmatic Guidance from on High';
      break;
    case 'fred_george':
      trust = 85;
      affection = 80;
      respect = 75;
      loyalty = 85;
      admiration = 80;
      dominantDynamic = 'Partners in Magical Mischief';
      break;
    case 'cedric':
      trust = 70;
      affection = 60;
      respect = 88;
      rivalry = 30;
      admiration = 75;
      dominantDynamic = 'Chivalrous Competitor & Honest Friend';
      break;
    case 'luna':
      trust = 75;
      affection = 70;
      respect = 75;
      admiration = 70;
      dominantDynamic = 'Dreamy Soul-Perception';
      break;
    case 'pansy':
      trust = -45;
      affection = -60;
      suspicion = 65;
      rivalry = 75;
      resentment = 65;
      dominantDynamic = 'Sneering Slytherin Antagonism';
      break;
  }

  return {
    trust,
    affection,
    suspicion,
    rivalry,
    respect,
    resentment,
    loyalty,
    attraction,
    fear,
    admiration,
    dominantDynamic,
    sharedSecrets: [],
    promisesMade: [],
    grievances: [],
  };
}

// Fallback intelligent intent parser if backend API key is unavailable
export function generateLocalStoryTurn(
  userInput: string,
  character: PlayerCharacter,
  memory: AdventureMemory,
  currentLocation: string
): AITurnResponse {
  const inputLower = userInput.toLowerCase();
  const narrative: string[] = [];
  const characterSpeech: { speaker: string; speech: string; expression: string }[] = [];
  let points = 0;
  let detention = 0;
  let clue: string | undefined;
  let secret: string | undefined;
  const relationshipUpdates: AITurnResponse['relationshipUpdates'] = [];
  const suggestions: string[] = [];

  // Determine intent category
  const partnerName = character.romanticPartner?.name.toLowerCase();
  const isRomantic =
    (partnerName && inputLower.includes(partnerName)) ||
    inputLower.includes('companion') ||
    inputLower.includes('boyfriend') ||
    inputLower.includes('girlfriend') ||
    inputLower.includes('partner') ||
    inputLower.includes('kiss') ||
    inputLower.includes('embrace') ||
    inputLower.includes('hold hand') ||
    inputLower.includes('alcove') ||
    inputLower.includes('stolen whisper') ||
    inputLower.includes('keepsake') ||
    inputLower.includes('astronomy tower with');

  if (isRomantic && character.romanticPartner) {
    const partner = character.romanticPartner;
    narrative.push(
      `You slip quietly into a candlelit alcove hidden behind the tapestry of Barnabas the Barmy, away from the echoing footsteps of curfew patrols.`
    );
    narrative.push(
      `Waiting in the soft amber glow is ${partner.name}. The relentless Highland cold and the oppressive dread of the Dementors instantly fade as your eyes meet. They step forward with a tender, relieved smile, their hands reaching instinctively for yours.`
    );
    characterSpeech.push({
      speaker: partner.name,
      speech:
        `“Rowan... I felt you approaching before I even heard your boots. Everyone in the castle is talking about Sirius Black and Dementors, but being right here with you is the only thing that makes this term feel real.”`,
      expression: 'speaking with quiet, breathless devotion while gently interlacing fingers',
    });
    points += 15;
    relationshipUpdates.push({
      characterId: partner.id,
      nuancedChanges: { affection: 18, trust: 15, attraction: 15, loyalty: 12 },
      summaryReason: 'Shared an intimate, heartwarming encounter away from castle scrutiny',
    });
    suggestions.push(
      `Whisper a tender promise to ${partner.name} to watch each other’s backs throughout the third-year trials`,
      `Show ${partner.name} their cherished keepsake (${partner.keepsake})`,
      `Sneak together up to the Astronomy Tower balcony before the prefects patrol`
    );
  } else if (inputLower.includes('lupin') || inputLower.includes('boggart') || inputLower.includes('patronus')) {
    narrative.push(
      `You step toward Professor Lupin, who looks up from his desk with tired, gentle amber eyes. A half-eaten slab of Honeydukes chocolate rests beside an open leather journal.`
    );
    if (inputLower.includes('patronus')) {
      characterSpeech.push({
        speaker: 'Remus Lupin',
        speech:
          '“The Patronus is not merely light, Rowan. It is a shield of pure emotional truth. When the Dementors draw near, you must hold fast to that one memory which reminds you that joy exists.”',
        expression: 'offering a supportive, proud smile',
      });
      points += 10;
      relationshipUpdates.push({
        characterId: 'lupin',
        nuancedChanges: { trust: 6, respect: 8, admiration: 5 },
        summaryReason: 'Admired your sincere dedication to mastering high defensive magic',
      });
    } else {
      characterSpeech.push({
        speaker: 'Remus Lupin',
        speech:
          '“Fear is a curious thing. It tells us what we value most. The Boggart only has power when we allow it to isolate us.”',
        expression: 'speaking with quiet philosophical depth',
      });
      relationshipUpdates.push({
        characterId: 'lupin',
        nuancedChanges: { trust: 5, affection: 4 },
        summaryReason: 'Appreciated your thoughtful reflection',
      });
    }
    suggestions.push(
      'Ask Professor Lupin why the Dementors are permitted on school grounds',
      'Show Lupin the Marauder’s Map and watch his expression carefully',
      'Offer to help organize the DADA creature tanks after hours'
    );
  } else if (inputLower.includes('snape') || inputLower.includes('potion')) {
    narrative.push(
      `The stone arches of the dungeons seem to grow colder as Professor Snape glides into view, his black robes billowing in the draft. He pauses, inspecting you with unblinking scrutiny.`
    );
    characterSpeech.push({
      speaker: 'Severus Snape',
      speech:
        '“I trust you are not lingering in the corridors to indulge in reckless heroics, Vance. The Gryffindors have already proved quite proficient at foolishness this term.”',
      expression: 'raising a single cynical eyebrow',
    });
    if (inputLower.includes('shrivelfig') || inputLower.includes('brew') || inputLower.includes('respect')) {
      points += 5;
      relationshipUpdates.push({
        characterId: 'snape',
        nuancedChanges: { respect: 6, suspicion: -2 },
        summaryReason: 'Grudgingly recognized proper academic decorum',
      });
    } else {
      relationshipUpdates.push({
        characterId: 'snape',
        nuancedChanges: { suspicion: 5, resentment: 3 },
        summaryReason: 'Viewed your presence with customary dungeon vigilance',
      });
    }
    suggestions.push(
      'Inquire about the proper brewing technique for the Shrinking Solution',
      'Watch Snape’s desk for signs of the smoking Wolfsbane potion goblet',
      'Slip discreetly toward the library before points are docked'
    );
  } else if (inputLower.includes('hermione') || inputLower.includes('library') || inputLower.includes('book')) {
    narrative.push(
      `Hermione looks up from a fortress of parchment and open leather-bound tomes. She rubs her tired eyes and adjusts her ink-stained quill, visibly grateful for an intellectual conversation.`
    );
    characterSpeech.push({
      speaker: 'Hermione Granger',
      speech:
        '“Oh, Rowan! I’ve been cross-referencing fourteenth-century werewolf legislation with the Committee for the Disposal of Dangerous Creatures. The entire Ministry trial against Buckbeak is a farce!”',
      expression: 'speaking with passionate, breathless indignation',
    });
    points += 5;
    clue = 'Hippogriff legal defense relies on proving lack of provocation';
    relationshipUpdates.push({
      characterId: 'hermione',
      nuancedChanges: { trust: 8, affection: 5, respect: 7 },
      summaryReason: 'Felt deeply validated by your support in her legal research',
    });
    suggestions.push(
      'Help Hermione cross-reference ancient appeals in the Restricted Section',
      'Quietly ask how she is managing three classes at nine o’clock every morning',
      'Offer to brew a calming tea to help her rest before the exams'
    );
  } else if (inputLower.includes('harry') || inputLower.includes('ron') || inputLower.includes('quidditch')) {
    narrative.push(
      `Harry and Ron glance up as you approach the hearth fire. Harry looks relieved to escape the suffocating whispers about Sirius Black, tossing an enchanted Golden Snitch lightly from palm to palm.`
    );
    characterSpeech.push({
      speaker: 'Harry Potter',
      speech:
        '“Wood wants us running dusk drills in the rain tomorrow. Everyone thinks I’m going to faint from another Dementor, but I just want to fly.”',
      expression: 'speaking with quiet, fierce determination',
    });
    points += 5;
    relationshipUpdates.push({
      characterId: 'harry',
      nuancedChanges: { trust: 6, loyalty: 7, affection: 5 },
      summaryReason: 'Appreciated being treated like a normal teammate rather than a fragile celebrity',
    });
    relationshipUpdates.push({
      characterId: 'ron',
      nuancedChanges: { trust: 5, loyalty: 5 },
      summaryReason: 'Welcomed you to the fireside group',
    });
    suggestions.push(
      'Offer to run seeker drills with Harry over the weekend',
      'Ask Ron if Scabbers is feeling any better after the recent bite',
      'Discuss Fred and George’s secret tips on the One-Eyed Witch passage'
    );
  } else if (inputLower.includes('draco') || inputLower.includes('malfoy')) {
    narrative.push(
      `Draco Malfoy curls his lip in a sharp sneer, Crabbe and Goyle stepping forward behind him with heavy knuckles. He clutches his silk arm-sling with exaggerated fragility.`
    );
    characterSpeech.push({
      speaker: 'Draco Malfoy',
      speech:
        '“Well, look who decided to speak up. Tell me, Vance, are you going to attend the execution when they chop off that brute’s feathered head?”',
      expression: 'mocking with aristocratic cruelty',
    });
    relationshipUpdates.push({
      characterId: 'draco',
      nuancedChanges: { rivalry: 8, resentment: 6, suspicion: 5 },
      summaryReason: 'Deepened the fierce rivalry between your houses',
    });
    suggestions.push(
      'Draw your wand and challenge Malfoy to back up his words in the courtyard',
      'Retaliate with humiliating wit about his terrified squeaks in front of the beast',
      'Walk away with cold dignity, refusing to give him a spectacle'
    );
  } else if (inputLower.includes('sirius') || inputLower.includes('black') || inputLower.includes('pettigrew') || inputLower.includes('shack')) {
    narrative.push(
      `A strange tension falls over the room. Outside, rain pounds against the stone walls like frantic knuckles. The whispers of Sirius Black seem to echo from every dark shadow in the corridor.`
    );
    clue = 'Sirius Black was seen near the Shrieking Shack passage under Whomping Willow';
    secret = 'The Marauders—Moony, Wormtail, Padfoot, and Prongs—were unregistered animagi';
    points += 10;
    suggestions.push(
      'Consult the Marauder’s Map to see if any unknown footprints pace the grounds',
      'Investigate the roots of the Whomping Willow at nightfall',
      'Question Hermione about the truth behind the Potters’ Secret Keeper'
    );
  } else {
    // General exploration
    narrative.push(
      `You resolve to: "${userInput}". Your boots click against the ancient Scottish flagstones as you move through ${currentLocation}. The castle whispers with centuries of enchantments.`
    );
    narrative.push(
      `Candle flames flicker in brass sconces overhead. Through the high arched windows, mist blankets the Forbidden Forest, while the distant whistle of the Hogwarts Express echoes across the loch.`
    );
    points += 2;
    suggestions.push(
      'Inspect the moving staircase portraits for clues about Sirius Black',
      'Head to the library to study advanced defense against Dementors',
      'Check the Marauder’s Map to observe where professors are patrolling'
    );
  }

  return {
    narrative,
    characterSpeech,
    consequences: {
      housePointsChange: points,
      detentionChange: detention,
      discoveredClue: clue,
      newSecret: secret,
    },
    relationshipUpdates,
    suggestedIntentions: suggestions,
  };
}
