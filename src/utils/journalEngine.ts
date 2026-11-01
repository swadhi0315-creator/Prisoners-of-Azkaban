import { JournalEntry, JournalReply, JournalConversation, PlayerCharacter } from '../types';

export type JournalVoice = 'marauder' | 'sage' | 'sarcastic' | 'romantic';

export const JOURNAL_VOICE_INFO: Record<
  JournalVoice,
  { label: string; title: string; icon: string; description: string; inkColor: string }
> = {
  marauder: {
    label: 'Cheeky Marauder',
    title: 'The Marauder’s Quill',
    icon: '🪄',
    description: 'Sassy, rebellious, laughs at rule-breaking, and mocks pretension with sharp wit.',
    inkColor: 'text-amber-800 border-amber-600/40 bg-amber-500/10',
  },
  sage: {
    label: 'Ancient Grimoire',
    title: 'The Castle Sage',
    icon: '📜',
    description: 'Erudite, slightly dramatic, offers profound magical lore and brilliant tactical advice.',
    inkColor: 'text-blue-900 border-blue-500/40 bg-blue-500/10',
  },
  sarcastic: {
    label: 'Sarcastic Familiar',
    title: 'The Dungeon Familiar',
    icon: '🖤',
    description: 'Deadpan roasts, tough-love reality checks, and hilarious commentary on school chaos.',
    inkColor: 'text-emerald-900 border-emerald-600/40 bg-emerald-500/10',
  },
  romantic: {
    label: 'Castle Whispers',
    title: 'The Corridor Matchmaker',
    icon: '💌',
    description: 'Obsessed with corridor gossip, starry rendezvous, and dramatic affairs of the heart.',
    inkColor: 'text-rose-900 border-rose-500/40 bg-rose-500/10',
  },
};

/**
 * Generate a rich, contextual local fallback response when offline or before server returns.
 */
export function generateLocalJournalReply(
  entry: { title: string; content: string; mood: string; relatedEvent?: string },
  character?: PlayerCharacter,
  voice: JournalVoice = 'marauder'
): JournalReply {
  const content = (entry.content + ' ' + entry.title).toLowerCase();
  const charName = character?.name || 'student';
  const house = character?.house || 'Gryffindor';
  const partner = character?.romanticPartner;

  let mockResponse = '';
  let solidAdvice = '';
  let highLowReaction = '';
  let marginQuirk = '';
  let tone: JournalReply['tone'] = 'playful';

  // Topic detection
  if (content.includes('dementor') || content.includes('frost') || content.includes('train')) {
    mockResponse =
      `“Oh, delighted you survived the rotting gray joy-suckers on the train! Did you consider simply offering them a lemon drop, or were your teeth clattering too loudly against your own tongue? And fainting before the third carriage reached the viaduct—truly an unforgettable entrance for ${charName} of ${house}!”`;
    solidAdvice =
      `“Solid Advice: Lupin had it right—keep a bar of Honeydukes dark chocolate wrapped inside your breast pocket at all times. When a Dementor draws close, do NOT fixate on your deepest regrets; picture the dumbest joke Fred and George ever told, or the warm buttery taste of hot cocoa by the common room hearth.”`;
    highLowReaction =
      `“The Low: Ice on the carriage windows and feeling like you'd never smile again. The High: Lupin's silvery rescue and free confectionary while Malfoy probably whimpered behind Crabbe's robes.”`;
    marginQuirk =
      `✦ The ink turns frost-blue, then melts into warm amber script. A tiny ink-sketch of a steaming chocolate bar winks in the left margin.`;
    tone = 'sympathetic';
  } else if (content.includes('snape') || content.includes('potions') || content.includes('cauldron')) {
    mockResponse =
      `“Ah, another triumphant afternoon in the damp dungeons smelling of pickled toad spleens! Did Professor Snape bestow upon you his trademark glare of ancient disappointment, or did your cauldron simply belch noxious sulfur across the front row desks?”`;
    solidAdvice =
      `“Solid Advice: If Snape looms behind you, never meet his black eyes directly—he reads hesitation like an open spellbook. Keep your silver stirring rod angled counter-clockwise at a steady half-pace, and remember: monkshood and wolfsbane are identical. Recite that before he sweeps by with his bat-cloak billow.”`;
    highLowReaction =
      `“The Low: Inhaling crushed beetle eyes under threat of detention. The High: Your eyebrows remain completely un-singed, which puts you well ahead of Seamus Finnigan.”`;
    marginQuirk =
      `✦ A tiny animated smudge of ink bubbles like an over-boiled cauldron, then pops into little laughing question marks.`;
    tone = 'mocking';
  } else if (content.includes('boggart') || content.includes('lupin') || content.includes('riddikulus')) {
    mockResponse =
      `“The great wardrobe rattle! Nothing cements a wizarding education quite like laughing directly in the hideous face of mortal terror. I do hope you didn't squeak before your wand flourished, ${charName}—though seeing Neville drape Snape in vulture feathers surely bought you enough courage to conquer dragons!”`;
    solidAdvice =
      `“Solid Advice: Boggarts thrive solely on your initial gasp. The trick isn't being fearless—it's weaponizing absurdity. Next time fear grips you, turn your worst nightmare into something wearing mismatched socks or sliding on a banana peel.”`;
    highLowReaction =
      `“The High: Neville Longbottom becoming the undisputed hero of third year. The Low: Wondering what would happen if Snape ever found out what Neville envisioned in that staffroom.”`;
    marginQuirk =
      `✦ An animated vulture feather doodles itself across the bottom of the parchment and takes a bow.`;
    tone = 'playful';
  } else if (
    partner &&
    (content.includes(partner.name.toLowerCase()) ||
      content.includes('kiss') ||
      content.includes('crush') ||
      content.includes('rendezvous') ||
      content.includes('romantic') ||
      content.includes('alcove') ||
      content.includes('astronomy tower') ||
      content.includes('tapestry'))
  ) {
    mockResponse =
      `“Oho! Look who is sneaking behind tapestries and lingering by the Astronomy Tower! Did you honestly think Barnabas the Barmy’s dancing trolls wouldn't whisper about you and ${partner.name}? I can practically smell the Honeydukes sugar and blushing fluster soaked into your quill strokes!”`;
    solidAdvice =
      `“Solid Advice: If you are going to sneak moments with ${partner.name}, check the portraits first—Fat Lady is a gossip, but Sir Cadogan will actively challenge your companion to a duel for your honor at 1:00 AM. Keep ${partner.keepsake} tucked safely so Filch doesn't confiscate it as contraband.”`;
    highLowReaction =
      `“The High: Stolen glances and whispered confessions in the castle shadows. The Low: Having to pretend you were just 'examining architectural stone reliefs' when Percy Weasley patrols the corridor.”`;
    marginQuirk =
      `✦ The ink blushes a soft rose-gold. Two interlocking quill flourishes swirl into a tiny dancing heart before settling.`;
    tone = 'conspiratorial';
  } else if (content.includes('malfoy') || content.includes('buckbeak') || content.includes('hagrid')) {
    mockResponse =
      `“Malfoy whining about a Hippogriff scratch as if he were severed at the torso? Truly, the drama in the Slytherin common room must be operatic. I bet he practiced that arm-sling angle in front of three different mirrors before limping into the Great Hall!”`;
    solidAdvice =
      `“Solid Advice: Support Hagrid with calm evidence, not screaming matches. The Committee for the Disposal of Dangerous Creatures is packed with Lucius Malfoy's cronies, but Ministry bylaws require verified witness statements. Help Hermione catalog creature precedent from 1722.”`;
    highLowReaction =
      `“The High: Buckbeak showing Malfoy what genuine majesty looks like. The Low: The Ministry bureaucracy circling Hagrid's hut like vultures.”`;
    marginQuirk =
      `✦ A tiny ink claw leaves three sharp scratches that miraculously heal back into tidy golden lettering.`;
    tone = 'sagacious';
  } else if (content.includes('points') || content.includes('detention') || content.includes('filch')) {
    mockResponse =
      `“Points won or lost—the great hourglass game! Did you think the castle wouldn't notice you prowling after hours? Filch’s lantern has a brass squeak, Vance; if you couldn't hear that from two corridors away, your muffliato needs urgent remedial practice!”`;
    solidAdvice =
      `“Solid Advice: If cornered by Mrs. Norris, do not run—she tracks speed. Drop a harmless peppermint toad or slide sideways through the trick step on the second-floor stair. And remember: detentions build character, but winning back fifty points from Flitwick builds house pride.”`;
    highLowReaction =
      `“The High: The thrill of skirting the rules right under the caretakers' noses. The Low: Scrubbing bedpans in the hospital wing without magic if you ever misstep.”`;
    marginQuirk =
      `✦ A silhouette of a cat's paw creeps across the parchment margin, leaving miniature fading footprints.`;
    tone = 'mocking';
  } else {
    // General reflective entry
    mockResponse =
      `“Another dramatic chronicle from the grand mind of ${charName}! Do you ever read your own entries back to yourself and marvel at how much chaos you fit into a single Tuesday? Most students are worried about their Herbology essays, while you treat third year like an epic mystery novel!”`;
    solidAdvice =
      `“Solid Advice: Take a breath in the courtyard, Vance. Hogwarts is ancient and full of shifting stairs, but you don't have to carry the whole castle's burdens on your back before evening feast. Trust your ${character?.wand?.wood || 'trusty'} wand, check in on your companions, and never take advice from Peeves.”`;
    highLowReaction =
      `“The High: You survived another whirlwind day in the castle with your wits and pride intact. The Low: Tomorrow's timetable probably still has Double History of Magic with Professor Binns.”`;
    marginQuirk =
      `✦ The enchanted script glimmers with soft amber light, leaving a small smiling crescent doodle in the bottom corner.`;
    tone = 'playful';
  }

  // Adjust speaker based on voice
  const speakerName = JOURNAL_VOICE_INFO[voice].title;

  return {
    speakerName,
    tone,
    mockResponse,
    solidAdvice,
    highLowReaction,
    marginQuirk,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Request an enchanted talking reply from the server (with fallback)
 */
export async function requestJournalReply(
  entry: { title: string; content: string; mood: string; relatedEvent?: string },
  character?: PlayerCharacter,
  voice: JournalVoice = 'marauder'
): Promise<JournalReply> {
  try {
    const res = await fetch('/api/journal/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entry,
        character,
        voice,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.mockResponse && data.solidAdvice) {
        return {
          speakerName: data.speakerName || JOURNAL_VOICE_INFO[voice].title,
          tone: data.tone || 'playful',
          mockResponse: data.mockResponse,
          solidAdvice: data.solidAdvice,
          highLowReaction: data.highLowReaction,
          marginQuirk: data.marginQuirk,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
    }
  } catch (err) {
    console.warn('Network call to /api/journal/reply failed; using local magical journal generator:', err);
  }

  return generateLocalJournalReply(entry, character, voice);
}

/**
 * Handle user talking back / chatting directly with their journal
 */
export async function requestJournalConverse(
  history: JournalConversation[],
  userMessage: string,
  entry: JournalEntry,
  character?: PlayerCharacter,
  voice: JournalVoice = 'marauder'
): Promise<string> {
  try {
    const res = await fetch('/api/journal/converse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history,
        userMessage,
        entry,
        character,
        voice,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return data.reply;
      }
    }
  } catch (err) {
    console.warn('Failed to call /api/journal/converse:', err);
  }

  // Local banter generator
  const msgLower = userMessage.toLowerCase();
  const name = character?.name || 'Vance';

  if (msgLower.includes('shut up') || msgLower.includes('quiet') || msgLower.includes('stop')) {
    return `“Hah! As if enchanted dragon-parchment could be silenced by mere indignation! Write all you want, ${name}, my ink will always find something witty to say.”`;
  }
  if (msgLower.includes('help') || msgLower.includes('advice') || msgLower.includes('what should i do')) {
    return `“My advice? Stop overthinking it in front of the common room fire. You have a ${character?.wand?.wood || 'faithful'} wand and more stubbornness than a Hungarian Horntail. Go talk to them or face the problem head-on before breakfast!”`;
  }
  if (msgLower.includes('love') || msgLower.includes('boyfriend') || msgLower.includes('girlfriend') || msgLower.includes('date')) {
    const partner = character?.romanticPartner?.name || 'your secret crush';
    return `“Ah, the flutter of teenage hearts! If you don't tell ${partner} how you feel soon, I might just sprout wings and deliver this page directly into their breakfast bowl!”`;
  }
  if (msgLower.includes('thank') || msgLower.includes('good point') || msgLower.includes('true')) {
    return `“Naturally it’s a good point—I have been absorbing castle wisdom since before the Whomping Willow was a sapling. Now go forth and conquer your day, ${name}.”`;
  }

  return `“Fascinating retort, ${name}! The ink practically sizzles with your defiance. But remember: whatever you face in tomorrow's classes or dark corridors, this parchment keeps your secrets... and your laughs.”`;
}
