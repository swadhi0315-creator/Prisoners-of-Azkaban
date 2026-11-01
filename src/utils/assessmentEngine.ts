import {
  PlayerCharacter,
  House,
  BloodStatus,
  PsychologicalProfile,
  CharacterTrait,
  Relationship,
  RomanticPartner,
} from '../types';
import {
  psychologicalQuestions,
  AssessmentOption,
  availableSuitors,
  SuitorProfile,
} from '../data/assessmentData';

export interface UserBasicInput {
  name: string;
  preferredBloodStatus: BloodStatus;
  petType: 'Barn Owl' | 'Tawny Owl' | 'Black Cat' | 'Ginger Cat' | 'Toad' | 'Ferret';
  petName: string;
  romanticPreference: 'Boyfriend' | 'Girlfriend' | 'Any';
  selectedPartnerId?: string; // id in availableSuitors, 'hat_match', or 'custom'
  customPartnerName?: string;
  customPartnerHouse?: House;
}

export interface AssessmentResult {
  character: PlayerCharacter;
  updatedRelationships: (existing: Relationship[]) => Relationship[];
  hatSpeech: string;
  dominantHouseScore: Record<House, number>;
}

export function evaluateAssessment(
  basicInfo: UserBasicInput,
  answers: Record<string, string> // questionId -> optionId
): AssessmentResult {
  // 1. Tally scores
  const houseTotals: Record<House, number> = {
    Gryffindor: 0,
    Slytherin: 0,
    Ravenclaw: 0,
    Hufflepuff: 0,
  };

  const traitTotals: Record<CharacterTrait, number> = {
    Bravery: 50,
    Cunning: 50,
    Lore: 50,
    Loyalty: 50,
    Stealth: 50,
  };

  let idealismTotal = 0;
  let autonomyTotal = 0;
  let warmthTotal = 0;
  let orderLeanTotal = 0;
  let siriusLeanTotal = 0;

  const wandWoodsVoted: Record<string, number> = {};
  const wandCoresVoted: Record<string, number> = {};
  const patronusHints: string[] = [];
  const boggartHints: string[] = [];
  const characterDeltas: Record<string, number> = {};

  psychologicalQuestions.forEach((q) => {
    const chosenOptionId = answers[q.id];
    const opt = q.options.find((o) => o.id === chosenOptionId) || q.options[0];

    // House weights
    houseTotals.Gryffindor += opt.houseWeights.Gryffindor;
    houseTotals.Slytherin += opt.houseWeights.Slytherin;
    houseTotals.Ravenclaw += opt.houseWeights.Ravenclaw;
    houseTotals.Hufflepuff += opt.houseWeights.Hufflepuff;

    // Traits
    Object.entries(opt.traitModifiers).forEach(([trait, mod]) => {
      if (typeof mod === 'number') {
        traitTotals[trait as CharacterTrait] = Math.max(
          20,
          Math.min(98, traitTotals[trait as CharacterTrait] + mod)
        );
      }
    });

    // Alignment scores
    idealismTotal += opt.alignmentScore.idealism;
    autonomyTotal += opt.alignmentScore.autonomy;
    warmthTotal += opt.alignmentScore.warmth;
    orderLeanTotal += opt.orderLean;
    siriusLeanTotal += opt.siriusLean;

    // Wand preferences
    if (opt.wandPreference) {
      wandWoodsVoted[opt.wandPreference.wood] = (wandWoodsVoted[opt.wandPreference.wood] || 0) + 1;
      wandCoresVoted[opt.wandPreference.core] = (wandCoresVoted[opt.wandPreference.core] || 0) + 1;
    }

    if (opt.patronusHint) patronusHints.push(opt.patronusHint);
    if (opt.boggartHint) boggartHints.push(opt.boggartHint);

    // Character deltas
    Object.entries(opt.characterAffinityDelta).forEach(([charId, delta]) => {
      const numDelta = typeof delta === 'number' ? delta : 0;
      characterDeltas[charId] = (characterDeltas[charId] || 0) + numDelta;
    });
  });

  // 2. Determine Sorting House
  const sortedHouses = (Object.keys(houseTotals) as House[]).sort(
    (a, b) => houseTotals[b] - houseTotals[a]
  );
  const primaryHouse = sortedHouses[0];
  const secondaryHouse = sortedHouses[1];

  // 3. Compute Moral Alignment Title
  let moralAlignment = 'Principled Rebel';
  if (autonomyTotal > 10 && idealismTotal > 10) {
    moralAlignment = 'Principled Rebel';
  } else if (autonomyTotal <= -5 && idealismTotal > 8) {
    moralAlignment = 'Stoic Guardian of the Law';
  } else if (autonomyTotal > 8 && idealismTotal <= -2) {
    moralAlignment = 'Pragmatic Sovereign';
  } else if (warmthTotal > 12 && idealismTotal > 10) {
    moralAlignment = 'Compassionate Loyalist';
  } else if (autonomyTotal > 12) {
    moralAlignment = 'Untethered Outlaw';
  } else {
    moralAlignment = 'Tactical Independent';
  }

  // 4. Compute Wand
  const topWood = Object.entries(wandWoodsVoted).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Holly';
  const topCore = Object.entries(wandCoresVoted).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Phoenix Feather';
  const wandLength = primaryHouse === 'Gryffindor' ? '11¾ inches' : primaryHouse === 'Slytherin' ? '12¼ inches' : primaryHouse === 'Ravenclaw' ? '11 inches' : '10½ inches';
  const wandFlexibility = autonomyTotal > 8 ? 'Unyielding & Rigid' : warmthTotal > 8 ? 'Supple & Yielding' : 'Reasonably Springy';

  // 5. Lineage & Family Connection
  let familyName = 'Vance';
  let lineageReputation = 'An independent Scottish lineage known for fierce wards and quiet strength.';
  let ancestralGift = 'Instinctive warding and shield endurance under pressure.';

  if (basicInfo.preferredBloodStatus === 'Pure-Blood') {
    if (primaryHouse === 'Slytherin') {
      familyName = 'Blackwood';
      lineageReputation = 'An ancient pure-blood house carrying dark family heirlooms and heavy expectations.';
      ancestralGift = 'Natural affinity for serpent tongue whispers and occlumency.';
    } else if (primaryHouse === 'Gryffindor') {
      familyName = 'Prewett';
      lineageReputation = 'A proud, fiery line of defenders known for standing first in battle.';
      ancestralGift = 'Fearless dueling reflex and resistance to intimidation.';
    } else if (primaryHouse === 'Ravenclaw') {
      familyName = 'Fawley';
      lineageReputation = 'Sacred Twenty-Eight scholars whose private libraries rival the Ministry archives.';
      ancestralGift = 'Exceptional intuitive spell creation and runic deciphering.';
    } else {
      familyName = 'Shafiq';
      lineageReputation = 'Ancient, quiet noble stock who refused to bow to pure-blood fanaticism.';
      ancestralGift = 'Earth-magic sensitivity and profound defensive ward endurance.';
    }
  } else if (basicInfo.preferredBloodStatus === 'Muggle-Born') {
    familyName = 'Sterling';
    lineageReputation = 'First generation of magical brilliance, unburdened by ancient blood prejudices.';
    ancestralGift = 'Unusual adaptability and fresh intuitive perspectives on magical theory.';
  } else {
    // Half-Blood
    familyName = 'Vance';
    lineageReputation = 'A line bridging two worlds, possessing rare empathy and versatile cunning.';
    ancestralGift = 'Mastery of rapid non-verbal transfiguration and sharp survival instinct.';
  }

  // Full user name
  let finalName = basicInfo.name.trim();
  if (!finalName) {
    finalName = `Rowan ${familyName}`;
  } else if (!finalName.includes(' ') && familyName) {
    finalName = `${finalName} ${familyName}`;
  }

  // 6. Patronus Form & Seed Memory
  let patronusForm = 'Silver Falcon';
  let patronusMemory = 'The moment of fierce shared laughter when you knew you were never truly alone.';

  if (patronusHints.some((h) => h.includes('Stag'))) {
    patronusForm = 'Silver Stag';
    patronusMemory = 'Stepping between someone defenseless and a terrifying danger, feeling all hesitation burn away into pure light.';
  } else if (patronusHints.some((h) => h.includes('Dragon') || h.includes('Wolf'))) {
    patronusForm = 'Shadow Wolf';
    patronusMemory = 'The moment when, against every voice that said you would fall, your own indomitable will carried you to triumph.';
  } else if (patronusHints.some((h) => h.includes('Badger') || h.includes('Otter'))) {
    patronusForm = 'Silver Otter';
    patronusMemory = 'Sitting late by the roaring hearth with true companions, laughing until tears streamed down your cheeks.';
  } else if (primaryHouse === 'Ravenclaw') {
    patronusForm = 'Great Grey Owl';
    patronusMemory = 'The profound awe of watching thousands of floating candles ascend into the Great Hall ceiling, realizing the universe was limitless.';
  }

  // 7. Boggart & Greatest Fear
  let boggartFear = 'A Dementor rising from icy black water to claim someone you love';
  let boggartRidiculous = 'A dancing scarecrow wrapped in colorful Hufflepuff winter scarves and bells';

  if (boggartHints.some((h) => h.includes('tombstone'))) {
    boggartFear = 'A cracked weathered headstone with your own name completely erased into obscurity';
    boggartRidiculous = 'A bright pink birthday cake with singing frosted candles popping like party crackers';
  } else if (boggartHints.some((h) => h.includes('mirror'))) {
    boggartFear = 'A corrupted, sinister mirror version of yourself casting an Unforgivable Curse';
    boggartRidiculous = 'Your mirror reflection sporting huge floppy rabbit ears and polka-dot spectacles';
  } else if (boggartHints.some((h) => h.includes('abandonment') || h.includes('laughing'))) {
    boggartFear = 'Your closest companion looking at you with cold, disgusted revulsion and turning away';
    boggartRidiculous = 'The illusion sneezing violently into a giant clown handkerchief and blowing bubbles';
  }

  // 8. Strengths & Weaknesses
  const coreStrength =
    traitTotals.Bravery > 70
      ? 'Unflinching moral courage under direct physical and psychological peril'
      : traitTotals.Lore > 70
      ? 'Razor observational deduction and encyclopedic magical theory'
      : traitTotals.Loyalty > 70
      ? 'Unshakeable steadfast devotion that inspires unbreakable trust in allies'
      : 'Pragmatic adaptability and calculating foresight when odds are stacked against you';

  const hiddenWeakness =
    autonomyTotal > 8
      ? 'A guarded pride that fiercely resists asking for help, risking dangerous isolation'
      : warmthTotal > 8
      ? 'Vulnerability to being wounded deeply by the perceived coldness or betrayal of friends'
      : idealismTotal > 8
      ? 'A stubborn moral rigidity that struggles to accept necessary compromises'
      : 'A cynical instinct to suspect hidden motives in even the kindest gestures';

  // 9. Subject Preferences & Electives
  const favoriteSubject =
    primaryHouse === 'Gryffindor'
      ? 'Defense Against the Dark Arts'
      : primaryHouse === 'Slytherin'
      ? 'Potions'
      : primaryHouse === 'Ravenclaw'
      ? 'Ancient Runes'
      : 'Care of Magical Creatures';

  const dislikedSubject =
    primaryHouse === 'Slytherin'
      ? 'Muggle Studies'
      : primaryHouse === 'Ravenclaw'
      ? 'Divination'
      : primaryHouse === 'Gryffindor'
      ? 'History of Magic'
      : 'Potions';

  const electives =
    primaryHouse === 'Ravenclaw'
      ? ['Ancient Runes', 'Arithmancy', 'Care of Magical Creatures']
      : primaryHouse === 'Slytherin'
      ? ['Care of Magical Creatures', 'Ancient Runes', 'Arithmancy']
      : primaryHouse === 'Hufflepuff'
      ? ['Care of Magical Creatures', 'Divination', 'Muggle Studies']
      : ['Care of Magical Creatures', 'Divination', 'Ancient Runes'];

  // 10. Quidditch & Hogsmeade
  const quidditchRole =
    traitTotals.Bravery > 65
      ? 'Seeker & High-Altitude Diver'
      : traitTotals.Cunning > 65
      ? 'Chaser & Tactical Playmaker'
      : traitTotals.Loyalty > 65
      ? 'Keeper & Goalpost Sentinel'
      : 'Fierce Spectator & Pitch Strategist';

  const hogsmeadeHabit =
    autonomyTotal > 6
      ? 'Prowling secret passage tunnels toward Zonko’s and the outskirts of the Shrieking Shack'
      : warmthTotal > 6
      ? 'Warm hearthside pints of Butterbeer at The Three Broomsticks surrounded by laughter'
      : 'Browsing obscure parchment rolls at Tomes and Scrolls and sampling Honeydukes chocolate';

  const ruleTendency =
    autonomyTotal > 8
      ? 'Principled Defier'
      : autonomyTotal > 3
      ? 'Pragmatic Loopholer'
      : autonomyTotal < -4
      ? 'Strict Disciplinarian'
      : 'Quiet Outlaw';

  const factionLean =
    orderLeanTotal >= 6
      ? 'Order of the Phoenix Ally'
      : orderLeanTotal <= -3
      ? 'Shadow / Ancient Magic Traditionalist'
      : 'Neutral Independent';

  // 11. Destined Allies & Rivals
  const destinedAllies: string[] = [];
  const destinedRivals: string[] = [];

  if (primaryHouse === 'Gryffindor') {
    destinedAllies.push('Harry Potter', 'Hermione Granger', 'Remus Lupin', 'Neville Longbottom');
    destinedRivals.push('Draco Malfoy', 'Pansy Parkinson');
  } else if (primaryHouse === 'Slytherin') {
    destinedAllies.push('Severus Snape', 'Draco Malfoy', 'Pansy Parkinson');
    destinedRivals.push('Harry Potter', 'Ron Weasley');
  } else if (primaryHouse === 'Ravenclaw') {
    destinedAllies.push('Hermione Granger', 'Luna Lovegood', 'Filius Flitwick', 'Remus Lupin');
    destinedRivals.push('Draco Malfoy');
  } else {
    destinedAllies.push('Cedric Diggory', 'Neville Longbottom', 'Rubeus Hagrid', 'Pomona Sprout');
    destinedRivals.push('Draco Malfoy');
  }

  // 12. Hat Deliberation Speech
  const hatSpeech = `“Ah... what do we have here? Step forward, into the candlefire. An intriguing mind. Deep currents... very deep indeed. I see ${
    traitTotals.Bravery > 65 ? 'a fierce defiance in the blood' : 'a calculating eye that weighs every consequence'
  }. There is ${
    warmthTotal > 5 ? 'a great capacity for fierce, unyielding loyalty' : 'a sovereign hunger to rise above all mediocrity'
  }. You would do extraordinarily well in ${secondaryHouse}, oh yes... there is talent there. But no... where your destiny truly burns is in... ${primaryHouse.toUpperCase()}!”`;

  const psychologicalProfile: PsychologicalProfile = {
    moralAlignment,
    greatestFear: boggartFear,
    hiddenWeakness,
    coreStrength,
    favoriteSubject,
    dislikedSubject,
    quidditchRole,
    hogsmeadeHabit,
    ruleTendency,
    factionLean,
    destinedAllies,
    destinedRivals,
    destinedRomanceHint:
      warmthTotal > 6
        ? 'Drawn to fiercely loyal souls who offer unwavering honesty in dark times'
        : 'Attracted to complex, brilliant minds who understand the burden of carrying heavy secrets',
    siriusConnection:
      siriusLeanTotal > 4
        ? 'Instinctively senses that the hunted fugitive carries a tragic, unspoken truth'
        : 'Regards the escaped prisoner as a dangerous storm that demands supreme defensive vigilance',
    pettigrewInstinct:
      traitTotals.Lore > 65 || traitTotals.Cunning > 65
        ? 'Feels immediate, skin-crawling suspicion regarding the Weasley pet rat’s uncanny twelve-year lifespan'
        : 'Distracted by immediate castle perils, unaware of the treacherous shadow nesting in the dormitory',
    assessmentNotes: [
      `The Sorting Hat weighed ${primaryHouse} against ${secondaryHouse} before reaching its decisive verdict.`,
      `Wand matched with ${topWood} and ${topCore}—a combination that demands total conviction from its wielder.`,
      `Moral orientation classified as “${moralAlignment}” based on responses to authority and sacrifice.`,
    ],
  };

  // 12. Romantic Partner Determination
  let assignedPartner: RomanticPartner | undefined = undefined;

  const targetGender =
    basicInfo.romanticPreference === 'Girlfriend'
      ? 'Girlfriend'
      : basicInfo.romanticPreference === 'Boyfriend'
      ? 'Boyfriend'
      : (primaryHouse === 'Slytherin' || primaryHouse === 'Ravenclaw' ? 'Girlfriend' : 'Boyfriend');

  if (basicInfo.selectedPartnerId === 'custom' && basicInfo.customPartnerName?.trim()) {
    const cName = basicInfo.customPartnerName.trim();
    const cHouse = basicInfo.customPartnerHouse || (primaryHouse === 'Slytherin' ? 'Ravenclaw' : 'Gryffindor');
    assignedPartner = {
      id: `custom_${cName.toLowerCase().replace(/\s+/g, '_')}`,
      name: cName,
      gender: targetGender,
      house: cHouse,
      role: `${cHouse} Companion & Soulmate (3rd Year)`,
      avatar: targetGender === 'Girlfriend' ? '💖' : '💙',
      dynamic: 'Deep Trust, Shared Secrets & Fierce Devotion',
      status: targetGender === 'Girlfriend' ? 'Girlfriend' : 'Boyfriend',
      keepsake: 'A carved silver talisman imbued with an enduring warming charm and your initials',
      sharedMemory: `Sitting together on the stone viaduct at twilight, whispering hopes and secrets while the Highland mist rolled over the Black Lake.`,
      introEncounter: `${cName} meets you near the courtyard arches, eyes softening with quiet joy as they reach out to clasp your hand.`,
    };
  } else if (
    basicInfo.selectedPartnerId &&
    basicInfo.selectedPartnerId !== 'hat_match' &&
    basicInfo.selectedPartnerId !== 'custom'
  ) {
    const suitor = availableSuitors.find((s) => s.id === basicInfo.selectedPartnerId);
    if (suitor) {
      assignedPartner = {
        id: suitor.id,
        name: suitor.name,
        gender: suitor.gender,
        house: suitor.house,
        role: suitor.role,
        avatar: suitor.avatar,
        dynamic: suitor.dynamic,
        status: suitor.gender === 'Girlfriend' ? 'Girlfriend' : 'Boyfriend',
        keepsake: suitor.keepsake,
        sharedMemory: suitor.sharedMemory,
        introEncounter: suitor.introEncounter,
      };
    }
  }

  // If still not assigned (e.g. hat_match or default)
  if (!assignedPartner) {
    const candidateSuitors = availableSuitors.filter((s) => {
      if (basicInfo.romanticPreference === 'Boyfriend') return s.gender === 'Boyfriend';
      if (basicInfo.romanticPreference === 'Girlfriend') return s.gender === 'Girlfriend';
      return true;
    });

    // Score suitors based on alignment and House synergy
    const scoredSuitors = candidateSuitors.map((suitor) => {
      let score = 0;
      if (suitor.idealAlignment.includes(moralAlignment)) score += 15;
      if (suitor.house === primaryHouse) score += 6;
      if (suitor.house === secondaryHouse) score += 4;
      // Bonus if player boosted character in questions
      if (characterDeltas[suitor.id]) score += characterDeltas[suitor.id] * 2;
      return { suitor, score };
    });

    scoredSuitors.sort((a, b) => b.score - a.score);
    const chosen = scoredSuitors[0]?.suitor || candidateSuitors[0] || availableSuitors[0];

    assignedPartner = {
      id: chosen.id,
      name: chosen.name,
      gender: chosen.gender,
      house: chosen.house,
      role: chosen.role,
      avatar: chosen.avatar,
      dynamic: chosen.dynamic,
      status: chosen.gender === 'Girlfriend' ? 'Girlfriend' : 'Boyfriend',
      keepsake: chosen.keepsake,
      sharedMemory: chosen.sharedMemory,
      introEncounter: chosen.introEncounter,
    };
  }

  const character: PlayerCharacter = {
    name: finalName,
    house: primaryHouse,
    bloodStatus: basicInfo.preferredBloodStatus,
    lineage: {
      familyName,
      reputation: lineageReputation,
      ancestralGift,
    },
    wand: {
      wood: topWood,
      core: topCore,
      length: wandLength,
      flexibility: wandFlexibility,
    },
    pet: {
      type: basicInfo.petType,
      name: basicInfo.petName || 'Archimedes',
    },
    electives,
    stats: traitTotals,
    patronus: {
      form: patronusForm,
      memory: patronusMemory,
      mastered: false,
    },
    boggart: {
      fear: boggartFear,
      ridiculousForm: boggartRidiculous,
    },
    romanticPartner: assignedPartner,
    psychologicalProfile,
    housePoints: 100,
    detentions: autonomyTotal > 8 ? 1 : 0,
    year: 3,
  };

  // Relationship updater
  const updatedRelationships = (existing: Relationship[]): Relationship[] => {
    let list = existing.map((rel) => {
      const delta = characterDeltas[rel.id] || 0;
      let newAffinity = Math.max(-100, Math.min(100, rel.affinity + delta));

      let newStatus = rel.status;
      if (destinedRivals.includes(rel.name)) newStatus = 'Rival';
      else if (destinedAllies.includes(rel.name) && newAffinity > 40) newStatus = 'Friend';

      // Check if this relationship is the romantic partner!
      if (assignedPartner && (rel.id === assignedPartner.id || rel.name.toLowerCase() === assignedPartner.name.toLowerCase())) {
        newStatus = (assignedPartner.gender === 'Girlfriend' ? 'Girlfriend' : 'Boyfriend') as any;
        newAffinity = 92;
        return {
          ...rel,
          affinity: newAffinity,
          status: newStatus,
          memorableMoment: assignedPartner.sharedMemory,
          nuances: {
            trust: 90,
            affection: 95,
            suspicion: 5,
            rivalry: 5,
            respect: 88,
            resentment: 0,
            loyalty: 95,
            attraction: 92,
            fear: 0,
            admiration: 88,
            dominantDynamic: assignedPartner.dynamic,
            sharedSecrets: [assignedPartner.sharedMemory],
            promisesMade: ['To protect each other through whatever darkness comes to Hogwarts this term'],
            grievances: [],
          },
        };
      }

      return {
        ...rel,
        affinity: newAffinity,
        status: newStatus,
      };
    });

    // If assignedPartner is not in existing canon relationships, prepend them!
    if (assignedPartner && !list.some((r) => r.id === assignedPartner?.id || r.name.toLowerCase() === assignedPartner?.name.toLowerCase())) {
      const newPartnerRel: Relationship = {
        id: assignedPartner.id,
        name: assignedPartner.name,
        role: assignedPartner.role,
        house: assignedPartner.house,
        affinity: 92,
        status: (assignedPartner.gender === 'Girlfriend' ? 'Girlfriend' : 'Boyfriend') as any,
        avatar: assignedPartner.avatar,
        personality: 'Deeply devoted, affectionate, and fiercely protective of your bond.',
        description: `Your ${assignedPartner.gender.toLowerCase()} at Hogwarts. Together, you share quiet glances across the Great Hall and secret rendezvous away from curfew patrols.`,
        memorableMoment: assignedPartner.sharedMemory,
        dialogueHistory: [],
        quotes: [
          `“Whatever happens with the Dementors or the Ministry, Rowan... you and I are in this together.”`,
        ],
        nuances: {
          trust: 92,
          affection: 95,
          suspicion: 5,
          rivalry: 5,
          respect: 88,
          resentment: 0,
          loyalty: 95,
          attraction: 92,
          fear: 0,
          admiration: 88,
          dominantDynamic: assignedPartner.dynamic,
          sharedSecrets: [assignedPartner.sharedMemory],
          promisesMade: ['To stand together through the storm'],
          grievances: [],
        },
      };
      list = [newPartnerRel, ...list];
    }

    return list;
  };

  return {
    character,
    updatedRelationships,
    hatSpeech,
    dominantHouseScore: houseTotals,
  };
}
