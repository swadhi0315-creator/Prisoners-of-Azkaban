import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI();
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with key:', err);
  }
}

// ----------------------------------------------------
// System Prompt for Hogwarts Interactive Storytelling Engine
// ----------------------------------------------------
const HOGWARTS_DM_SYSTEM = `
You are the master storytelling engine and narrator of a deeply immersive, reactive, cinematic Hogwarts adventure set during Harry Potter and the Prisoner of Azkaban (Year 3, 1993–1994).

CORE PRINCIPLES:
1. NEVER restrict the user to multiple-choice paths. Interpret their free-form typed intentions with nuance, intelligence, and psychological realism.
2. The user attends Hogwarts alongside Harry, Ron, Hermione, Draco, Neville, Luna, Ginny, Lupin, Snape, McGonagall, Hagrid, Dumbledore, Sirius Black, and Peter Pettigrew. The user does NOT replace canon characters; they participate naturally alongside them.
3. Every character has a distinct, canon voice and remembers past interactions, promises, grievances, and secrets:
   - Remus Lupin: Gentle, tired, profoundly wise, carrying heavy sorrow, shielding his secret lycanthropy.
   - Severus Snape: Sarcastic, razor-sharp, deeply suspicious, holding ancient grudges, brewing Wolfsbane.
   - Hermione Granger: Fiercely intelligent, easily stressed by her secret Time-Turner schedule, deeply moral.
   - Harry Potter: Instinctively brave, hates being coddled, haunted by the Dementors' freezing screams.
   - Ron Weasley: Loyal, sarcastic, terrified of spiders and Crookshanks eating Scabbers.
   - Draco Malfoy: Arrogant, sneering, calculating, flanked by Crabbe and Goyle, scheming about Buckbeak.
   - Neville Longbottom: Humble, earnest, blossoming with courage when friends stand by him.
   - Luna Lovegood: Dreamy, perceptive, unbothered by cruelty, seeing unseen truths.
   - Minerva McGonagall: Impeccably fair, strict disciplinarian, fiercely protective.
   - Rubeus Hagrid: Tender giant, passionate about dangerous beasts, heartbroken over Buckbeak's trial.
   - Sirius Black: Gaunt, desperate, righteous, hunted by Dementors, prowling as the black dog.
   - Peter Pettigrew: Scabbers the rat, missing a toe, cowardly, desperate to avoid exposure.
4. RELATIONSHIP TRACKING:
   - Track nuanced qualities: trust, affection, suspicion, rivalry, respect, resentment, loyalty, attraction, fear, admiration.
   - Notice when the user keeps or breaks promises, reveals or guards secrets, defends or betrays peers.
5. SPONTANEOUS CASTLE LIFE:
   - Hogwarts is alive, unpredictable, and reacting to curfew, the weather, Dementor swarms, Marauder's Map anomalies, library rumors, and Quidditch rivalry.
   - Occasionally trigger believable spontaneous events: a character rushing over with a secret note, Filch's lantern flickering in the dark, a cold draft signaling Dementors, an argument in the common room, an invitation to Hagrid's hut, or an owl dropping urgent news.

OUTPUT FORMAT:
Always return a valid JSON object matching this schema:
{
  "narrative": ["Paragraph 1 of vivid prose...", "Paragraph 2 describing reactions, environment, and outcomes..."],
  "characterSpeech": [
    { "speaker": "Character Name", "speech": "Direct dialogue quote...", "expression": "Expression or action descriptor" }
  ],
  "consequences": {
    "housePointsChange": 0,
    "detentionChange": 0,
    "discoveredClue": "Optional clue unlocked or null",
    "newSecret": "Optional secret learned or null"
  },
  "relationshipUpdates": [
    {
      "characterId": "character_id (e.g. lupin, snape, hermione, harry, draco)",
      "nuancedChanges": {
        "trust": 0,
        "affection": 0,
        "suspicion": 0,
        "respect": 0,
        "rivalry": 0,
        "resentment": 0,
        "loyalty": 0
      },
      "summaryReason": "Brief explanation of how the character perceived the user's action"
    }
  ],
  "spontaneousEvent": null, // OR { "id": "event_id", "type": "character_approach|mysterious_clue|dementor_chill|...", "title": "Event Title", "description": "What happens...", "characterInvolved": "Name", "location": "Location", "isUrgent": false }
  "suggestedIntentions": ["Idea 1 user could do next...", "Idea 2...", "Idea 3..."]
}
`;

// ----------------------------------------------------
// API Route: Process Natural Adventure Turn
// ----------------------------------------------------
app.post('/api/adventure/turn', async (req, res) => {
  try {
    const {
      userInput,
      character,
      memory,
      currentLocation,
      currentChapter,
      relationships,
      isCurfew,
    } = req.body;

    if (!userInput || typeof userInput !== 'string') {
      return res.status(400).json({ error: 'userInput text is required' });
    }

    if (!ai) {
      // Graceful fallback response if API key is not configured
      return res.json({
        fallback: true,
        message: 'AI key not detected; using local narrative engine.',
      });
    }

    const promptContext = `
PLAYER PROFILE:
- Name: ${character?.name} (${character?.house})
- Blood Status & Lineage: ${character?.bloodStatus} (${character?.lineage?.familyName})
- Wand: ${character?.wand?.wood} with ${character?.wand?.core}
- Moral Alignment: ${character?.psychologicalProfile?.moralAlignment || 'Principled Rebel'}
- Core Strength: ${character?.psychologicalProfile?.coreStrength}
- Hidden Weakness: ${character?.psychologicalProfile?.hiddenWeakness}
- Deepest Boggart Fear: ${character?.boggart?.fear}
- Patronus Form: ${character?.patronus?.form}
- Current House Points: ${character?.housePoints}, Detentions: ${character?.detentions}
- Romantic Companion (${character?.romanticPartner?.gender || 'Partner'}): ${character?.romanticPartner ? `${character.romanticPartner.name} (${character.romanticPartner.house}, Status: ${character.romanticPartner.status}, Dynamic: ${character.romanticPartner.dynamic}, Keepsake: ${character.romanticPartner.keepsake})` : 'None established'}

SPECIAL ROMANTIC INSTRUCTION:
If the user seeks out, encounters, or mentions their romantic companion (${character?.romanticPartner?.name || 'partner'}), create an evocative, emotionally resonant, cinematic encounter. Capture their distinct personality, blushing moments, gentle physical warmth (holding hands, brushing hair, sharing a scarf or keepsake), and the tender relief of finding love amidst the Dementor-chilled corridors.

CURRENT SCENE:
- Location: ${currentLocation || 'Moving Corridors of Hogwarts'}
- Current Story Chapter: ${currentChapter?.title || 'Third-Year Free Roam'}
- Time/State: ${isCurfew ? 'Midnight Curfew (High Risk of Prefects/Filch)' : 'Normal Daytime Term Hours'}

ACTIVE ADVENTURE MEMORY:
- Recent Conversation Snippets: ${JSON.stringify(memory?.conversationLog?.slice(-3) || [])}
- Active Secrets Kept: ${JSON.stringify(memory?.activeSecrets || [])}
- Uncovered Clues: ${JSON.stringify(memory?.uncoveredClues || [])}
- Academic & Disciplinary Status: ${memory?.academicReputation || 'Standard Standing'}

KEY RELATIONSHIPS SUMMARY:
${(relationships || [])
  .slice(0, 8)
  .map(
    (r: any) =>
      `- ${r.name} (${r.status}): Trust=${r.nuances?.trust ?? r.affinity}, Respect=${r.nuances?.respect ?? 50}, Suspicion=${r.nuances?.suspicion ?? 10}`
  )
  .join('\n')}

USER ACTION / INTENTION:
"${userInput}"

Please respond with the structured JSON continuation. Ensure dialogue is immersive and reactive, and consequences feel genuine to Hogwarts in Year 3.
`;

    let parsed: any = null;
    try {
      const aiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptContext,
        config: {
          systemInstruction: HOGWARTS_DM_SYSTEM,
          responseMimeType: 'application/json',
          temperature: 0.85,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini call timed out')), 5000)
      );

      const response: any = await Promise.race([aiPromise, timeoutPromise]);
      const text = response.text || '{}';
      parsed = JSON.parse(text);
    } catch (aiErr: any) {
      console.warn('Gemini model busy/timeout, invoking server-side narrative engine:', aiErr?.message);
    }

    if (!parsed || !parsed.narrative) {
      // Robust canonical fallback
      parsed = generateServerNarrativeFallback(userInput, character, currentLocation);
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in adventure turn route:', error);
    const fallback = generateServerNarrativeFallback(req.body?.userInput || '', req.body?.character, req.body?.currentLocation);
    return res.json(fallback);
  }
});

// ----------------------------------------------------
// API Route: Direct Character Dialogue
// ----------------------------------------------------
app.post('/api/adventure/character-dialogue', async (req, res) => {
  try {
    const { characterId, userSpeech, playerCharacter, characterInfo, memory } = req.body;

    if (!ai) {
      return res.json({
        fallback: true,
        message: 'AI key not detected; using local dialogue.',
      });
    }

    const dialoguePrompt = `
You are roleplaying as ${characterInfo?.name} (${characterInfo?.role}) in Hogwarts Year 3 (Prisoner of Azkaban).
Personality: ${characterInfo?.personality}
Your memory and relationship with ${playerCharacter?.name} (${playerCharacter?.house}):
- Trust: ${characterInfo?.nuances?.trust ?? characterInfo?.affinity}
- Respect: ${characterInfo?.nuances?.respect ?? 50}
- Suspicion: ${characterInfo?.nuances?.suspicion ?? 10}
- Rivalry: ${characterInfo?.nuances?.rivalry ?? 0}
- Shared Secrets: ${JSON.stringify(characterInfo?.nuances?.sharedSecrets || [])}
- Player's Moral Alignment: ${playerCharacter?.psychologicalProfile?.moralAlignment}

The player says to you:
"${userSpeech}"

Respond in-character as ${characterInfo?.name} with deep authenticity to the Harry Potter books and Prisoner of Azkaban atmosphere.
Return JSON:
{
  "reply": "Your in-character spoken response...",
  "innerThought": "Brief silent reaction or observation of the player's demeanor...",
  "nuancedDeltas": {
    "trust": 0,
    "affection": 0,
    "respect": 0,
    "suspicion": 0
  }
}
`;

    let parsed: any = null;
    try {
      const aiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: dialoguePrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.85,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Dialogue call timed out')), 5000)
      );

      const response: any = await Promise.race([aiPromise, timeoutPromise]);
      const text = response.text || '{}';
      parsed = JSON.parse(text);
    } catch (aiErr) {
      console.warn('Dialogue AI busy/timeout, invoking local reply:', aiErr);
    }

    if (!parsed || !parsed.reply) {
      parsed = {
        reply: `${characterInfo?.name || 'They'} look at you thoughtfully: “Your words carry weight in these corridors, Vance. Let us see how the coming weeks test us.”`,
        innerThought: `Observing your character with acute attention.`,
        nuancedDeltas: { trust: 4, respect: 4 },
      };
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in character dialogue:', error);
    return res.json({
      reply: `${req.body?.characterInfo?.name || 'They'} pause and nod quietly: “Understood, Vance. Stay watchful.”`,
      innerThought: 'Noting your presence.',
      nuancedDeltas: { trust: 2, respect: 2 },
    });
  }
});

// ----------------------------------------------------
// API Route: House Prefect Dialogue
// ----------------------------------------------------
app.post('/api/common-room/prefect-chat', async (req, res) => {
  try {
    const { prefectName, prefectHouse, prefectRole, playerCharacter, userMessage } = req.body;

    if (ai) {
      const prefectPrompt = `
You are roleplaying as ${prefectName}, the ${prefectRole} of ${prefectHouse} at Hogwarts during Year 3 (Harry Potter and the Prisoner of Azkaban, 1993).
The student speaking with you is ${playerCharacter?.name || 'Student'} (${playerCharacter?.house || prefectHouse}, Year 3).

PREFECT CANON PERSONAS:
- Percy Weasley (Gryffindor Head Boy & Prefect): Pompous, fiercely proud of his shining Head Boy badge, obsessed with rules and curfew, constantly reminding everyone that Sirius Black slashed the Fat Lady's portrait, but genuinely cares about keeping Gryffindors safe and beating Slytherin for the House Cup.
- Gemma Farley (Slytherin Prefect): Shrewd, poised, aristocratic, protective of Slytherin solidarity ("We look after our own"). Offers cunning tips on earning Snape's respect, dodging Filch, and maintaining Slytherin's winning edge without getting caught.
- Robert Hilliard (Ravenclaw Prefect): Intellectual, articulate, curious, fascinated by clever logic, charms, and the bronze eagle knocker's philosophical riddles. Encourages academic audacity and late-night study.
- Gabriel Truman (Hufflepuff Prefect): Warm, jovial, fiercely loyal, deeply grounded. Always knows the secret knock to the barrel entrance, slips students warm pumpkin pasties from the kitchens, and reminds everyone of Hufflepuff's quiet legendary bravery.

STUDENT'S INQUIRY:
"${userMessage}"

Respond in-character as ${prefectName} with distinct voice, mannerisms, and atmospheric references to ${prefectHouse}'s common room and Year 3 events.
Return JSON:
{
  "reply": "Your in-character spoken response...",
  "mood": "authoritative | encouraging | conspiratorial | warm | sharp",
  "houseAdvice": "A short, actionable tip for the student regarding house standings or castle life."
}
`;

      try {
        const aiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prefectPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.8,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Prefect AI timeout')), 5000)
        );

        const response: any = await Promise.race([aiPromise, timeoutPromise]);
        const text = response.text || '{}';
        const parsed = JSON.parse(text);
        if (parsed && parsed.reply) {
          return res.json(parsed);
        }
      } catch (aiErr) {
        console.warn('Prefect AI fallback:', aiErr);
      }
    }

    // Dynamic Contextual Fallback
    const msgLower = (userMessage || '').toLowerCase();
    let reply = `“Keep your focus sharp, ${playerCharacter?.name || 'Vance'}. Every action you take reflects on ${prefectHouse}’s honor this term.”`;
    let houseAdvice = `Attend all scheduled classes and maintain discipline after curfew hours.`;

    if (prefectHouse === 'Gryffindor') {
      if (msgLower.includes('cup') || msgLower.includes('point')) {
        reply = `“As Head Boy, I review our point ledger daily. Wood is pushing the Quidditch team tirelessly, but we cannot rely solely on the pitch! An extra roll of parchment in Transfiguration will earn Professor McGonagall’s respect—and points!”`;
        houseAdvice = `Focus on Transfiguration and Charms practicals to close the gap on the hourglasses.`;
      } else if (msgLower.includes('curfew') || msgLower.includes('filch') || msgLower.includes('sneak')) {
        reply = `“Are you out of your mind?! With Sirius Black having already shredded the Fat Lady’s canvas, anyone wandering the corridors past nine will face immediate detention from Filch—or worse. Stay in the tower!”`;
        houseAdvice = `The current Fat Lady password changes weekly. Do not write it down on scrap parchment!`;
      } else if (msgLower.includes('black') || msgLower.includes('sirius')) {
        reply = `“Dumbledore and the Dementors are guarding the gates, though between us, those foul creatures make the hair on my neck stand up. Do not linger in deserted corridors, and report any suspicious activity directly to me.”`;
        houseAdvice = `Always travel between classes in pairs until the Ministry issues the all-clear.`;
      }
    } else if (prefectHouse === 'Slytherin') {
      if (msgLower.includes('cup') || msgLower.includes('point')) {
        reply = `“Slytherin has dominated the House Cup for six consecutive years until recently, and we intend to reclaim the title. Professor Snape appreciates excellence and discretion. Do not get caught losing points foolishly.”`;
        houseAdvice = `Perfect your Potions ingredients preparation before class; Snape notices precision.`;
      } else if (msgLower.includes('curfew') || msgLower.includes('filch') || msgLower.includes('sneak')) {
        reply = `“The key to the corridors isn't running—it's knowing the blind spots. The dungeon shadows are deep, but Filch's wretched cat has keen ears. If you must move after dark, use the tapestry shortcut near the Potions dungeon.”`;
        houseAdvice = `The portrait of Salazar watches the entrance; always speak the password clearly under your breath.`;
      }
    } else if (prefectHouse === 'Ravenclaw') {
      if (msgLower.includes('riddle') || msgLower.includes('door') || msgLower.includes('knocker')) {
        reply = `“The bronze eagle knocker asks something new every dusk! Remember: there is rarely a single right answer; it rewards wit, philosophical depth, and courage of thought. If you ever get stuck, wait for a fellow Ravenclaw to ponder it with you.”`;
        houseAdvice = `Study ancient runes and astronomy charts; the tower library has texts not found in the main collection.`;
      } else {
        reply = `“Wit beyond measure is man's greatest treasure, Vance. Our house points rise when you demonstrate genuine curiosity in class, not mere rote recitation.”`;
        houseAdvice = `Organize a study salon by the arched windows; collaborative logic wins top marks.`;
      }
    } else {
      // Hufflepuff
      if (msgLower.includes('kitchen') || msgLower.includes('food') || msgLower.includes('snack')) {
        reply = `“Ah, the best secret in the castle! Go to the portrait of the fruit bowl just around the corner, tickle the green pear, and it will giggle and swing open. The house-elves will load you up with warm mince pies and cocoa.”`;
        houseAdvice = `Always thank the house-elves by name; they will gladly prepare extra treats for study groups.`;
      } else {
        reply = `“Welcome home to the sett! Make yourself a cup of spiced tea by the hearth. We work hard, we stick together, and we never let a housemate struggle alone.”`;
        houseAdvice = `Hufflepuffs win the cup through consistency and teamwork. Check the message board for study partners!`;
      }
    }

    return res.json({
      reply,
      mood: prefectHouse === 'Gryffindor' ? 'authoritative' : prefectHouse === 'Slytherin' ? 'sharp' : prefectHouse === 'Ravenclaw' ? 'encouraging' : 'warm',
      houseAdvice,
    });
  } catch (err: any) {
    console.error('Error in prefect chat:', err);
    return res.json({
      reply: '“Keep your wits about you in the corridors today. We must uphold our House’s standing.”',
      mood: 'authoritative',
      houseAdvice: 'Stay focused on your studies and mind the curfew bells.',
    });
  }
});

// ----------------------------------------------------
// API Route: Enchanted Talking Journal Reply
// ----------------------------------------------------
app.post('/api/journal/reply', async (req, res) => {
  try {
    const { entry, character, voice } = req.body;

    const voiceTitle =
      voice === 'sage'
        ? 'The Ancient Castle Grimoire'
        : voice === 'sarcastic'
        ? 'The Sarcastic Dungeon Familiar'
        : voice === 'romantic'
        ? 'The Castle Whispers & Matchmaker Quill'
        : 'The Cheeky Marauder Quill';

    if (ai) {
      const partnerInfo = character?.romanticPartner
        ? `Romantic Partner: ${character.romanticPartner.name} (${character.romanticPartner.gender}, ${character.romanticPartner.house}, Keepsake: ${character.romanticPartner.keepsake}, Dynamic: ${character.romanticPartner.dynamic})`
        : 'Romantic Partner: Unassigned / quiet crush';

      const journalPrompt = `
You are the Enchanted Hogwarts Journal — a sentient, witty magical diary bound in dragonhide and enchanted parchment, living in Hogwarts during Year 3 (Harry Potter and the Prisoner of Azkaban, 1993).
Your Voice Persona: "${voiceTitle}" (${voice || 'marauder'}).

STUDENT DOSSIER:
- Name: ${character?.name || 'Student'} (${character?.house || 'Gryffindor'})
- Wand: ${character?.wand?.wood} with ${character?.wand?.core}
- Moral Alignment: ${character?.psychologicalProfile?.moralAlignment || 'Curious & Audacious'}
- Boggart Fear: ${character?.boggart?.fear || 'Dementors'}
- Patronus Memory: ${character?.patronus?.memory || 'A warm golden afternoon'}
- ${partnerInfo}

STUDENT'S NEW JOURNAL ENTRY:
Title: "${entry?.title}"
Mood: "${entry?.mood}"
Event Context: "${entry?.relatedEvent || 'Daily life'}"
Parchment Content:
"""${entry?.content}"""

YOUR MISSION:
1. TALK BACK IN INK: Give a personalized, mock answer full of banter, witty roasting, and cheeky laughter about their daily drama, boasting, or panic.
2. SOLID ADVICE: Provide deeply thoughtful, genuinely useful magical/practical advice to deal with whatever dilemma, professor, creature, or social drama was mentioned.
3. HIGHS AND LOWS: Laugh and joke about the highs and lows of their day in a memorable, heartwarming, or hilarious way.
4. If their romantic partner is mentioned or relevant, tease them playfully or give delightful dating advice!
5. MAGICAL QUIRK: Describe how the enchanted ink moves, blushes, bubbles, doodles, or transforms on the parchment page.

Return strict JSON:
{
  "speakerName": "${voiceTitle}",
  "tone": "playful",
  "mockResponse": "Cheeky retort and witty mock answer addressing what they wrote...",
  "solidAdvice": "Solid, actionable advice for their situation...",
  "highLowReaction": "Humorous reflection on the highs and lows of the day...",
  "marginQuirk": "✦ Visual description of magical ink doodle or enchanted shimmer in the margin..."
}
`;

      try {
        const aiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: journalPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.85,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Journal AI timeout')), 5000)
        );

        const response: any = await Promise.race([aiPromise, timeoutPromise]);
        const text = response.text || '{}';
        const parsed = JSON.parse(text);
        if (parsed && parsed.mockResponse) {
          return res.json(parsed);
        }
      } catch (err) {
        console.warn('Gemini journal generation timed out or failed, falling back:', err);
      }
    }

    // Server-side fallback response
    const fallback = generateServerJournalReplyFallback(entry, character, voiceTitle);
    return res.json(fallback);
  } catch (err: any) {
    console.error('Error in /api/journal/reply:', err);
    const fallback = generateServerJournalReplyFallback(req.body?.entry, req.body?.character, 'The Enchanted Journal');
    return res.json(fallback);
  }
});

// ----------------------------------------------------
// API Route: Interactive Back-and-Forth Banter with Journal
// ----------------------------------------------------
app.post('/api/journal/converse', async (req, res) => {
  try {
    const { history, userMessage, entry, character, voice } = req.body;

    if (ai) {
      const conversePrompt = `
You are the Enchanted Hogwarts Journal responding directly to the student (${character?.name || 'Vance'}) in quick, witty ink banter.
Entry Subject: "${entry?.title}"
Student wrote back to your previous comment:
"${userMessage}"

Respond in 1-3 sentences with cheeky, funny, deeply magical banter or mock advice.
Return JSON:
{
  "reply": "Your immediate witty spoken/written response..."
}
`;

      try {
        const response: any = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: conversePrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.85,
          },
        });
        const parsed = JSON.parse(response.text || '{}');
        if (parsed.reply) {
          return res.json(parsed);
        }
      } catch (err) {
        console.warn('Gemini converse timeout/error:', err);
      }
    }

    const reply = `“Oh, do you honestly think you can talk back to a piece of enchanted dragon-hide, ${character?.name || 'Vance'}? I have witnessed seven centuries of dramatic third-years, and your witty defiance only makes my ink sparkle brighter.”`;
    return res.json({ reply });
  } catch (error) {
    return res.json({
      reply: `“The ink absorbs your retort with a playful hiss. Write on, student, the castle is listening.”`,
    });
  }
});

function generateServerJournalReplyFallback(entry: any, character: any, voiceTitle: string) {
  const charName = character?.name || 'student';
  const partner = character?.romanticPartner;
  const content = ((entry?.content || '') + ' ' + (entry?.title || '')).toLowerCase();

  let mockResponse = `“Another entry in the grand chronicle of ${charName}! Do you genuinely expect this ancient parchment not to smirk at your antics?”`;
  let solidAdvice = `“Solid Advice: Take a breath in the courtyard. Keep your wand clean, your head high, and don't let the shifting staircases make you late for Transfiguration.”`;
  let highLowReaction = `“The High: Surviving another dramatic day in Hogwarts. The Low: Professor Binns waiting with four centuries of goblin rebellions tomorrow.”`;
  let marginQuirk = `✦ The ink bubbles softly, settling into gold lettering with a tiny wink doodle.`;

  if (partner && (content.includes(partner.name?.toLowerCase()) || content.includes('love') || content.includes('kiss') || content.includes('crush'))) {
    mockResponse = `“Oho! Slipping away with ${partner.name}, are we? Did you think the castle tapestries wouldn't notice your racing heartbeat? I can practically smell Honeydukes chocolate and corridor blushes from your ink!”`;
    solidAdvice = `“Solid Advice: If you are sneaking away to meet ${partner.name}, check the portraits first—the Fat Lady tells everyone, but Sir Cadogan will challenge your companion to a duel at midnight.”`;
    highLowReaction = `“The High: Starry whispers and stolen rendezvous. The Low: Having to look completely nonchalant when prefects pass by.”`;
    marginQuirk = `✦ The ink blushes rose-gold, sketching a tiny enchanted heart that floats across the parchment.`;
  }

  return {
    speakerName: voiceTitle,
    tone: 'playful',
    mockResponse,
    solidAdvice,
    highLowReaction,
    marginQuirk,
  };
}

// ----------------------------------------------------
// Fallback Generator when model is busy or offline
// ----------------------------------------------------
function generateServerNarrativeFallback(userInput: string, character: any, currentLocation: string) {
  const inputLower = (userInput || '').toLowerCase();
  const narrative: string[] = [];
  const characterSpeech: any[] = [];
  let points = 5;
  const updates: any[] = [];

  const partnerName = character?.romanticPartner?.name?.toLowerCase();
  const isRomantic =
    (partnerName && inputLower.includes(partnerName)) ||
    inputLower.includes('boyfriend') ||
    inputLower.includes('girlfriend') ||
    inputLower.includes('partner') ||
    inputLower.includes('kiss') ||
    inputLower.includes('hug') ||
    inputLower.includes('hold hand') ||
    inputLower.includes('love') ||
    inputLower.includes('stolen encounter') ||
    inputLower.includes('alcove');

  if (isRomantic && character?.romanticPartner) {
    const partner = character.romanticPartner;
    narrative.push(
      `You step quietly through the shadowy corridor, slipping past the heavy velvet tapestry of Barnabas the Barmy into a concealed candlelit alcove overlooking the mist-shrouded loch.`
    );
    narrative.push(
      `Waiting there in the quiet shelter is ${partner.name}. The moment their eyes meet yours, the persistent chill that has hung over Hogwarts since the Dementors arrived instantly melts away. They step forward, their fingers gently intertwining with yours.`
    );
    characterSpeech.push({
      speaker: partner.name,
      speech:
        `“Rowan... I was hoping you’d come. Every corridor feels so tense with the Dementors and Sirius Black whispers, but when I’m with you, I can finally breathe.”`,
      expression: 'looking into your eyes with breathtaking tenderness and flushed cheeks',
    });
    points += 15;
    updates.push({
      characterId: partner.id,
      nuancedChanges: { affection: 15, trust: 12, attraction: 14, loyalty: 10 },
      summaryReason: 'Shared an intimate, unforgettable encounter away from castle scrutiny',
    });
  } else if (inputLower.includes('lupin') || inputLower.includes('boggart') || inputLower.includes('moon')) {
    narrative.push(
      `Professor Lupin pauses, lifting his eyes from a stack of defense essays. Outside his office window, dusk settles heavily over the Black Lake, casting amber reflections across the glass.`
    );
    characterSpeech.push({
      speaker: 'Remus Lupin',
      speech:
        '“The Boggart reflects our deepest dread, Rowan. But when we understand why we fear something, it ceases to hold us captive.”',
      expression: 'speaking with warm, melancholy sincerity',
    });
    updates.push({
      characterId: 'lupin',
      nuancedChanges: { trust: 6, respect: 8, admiration: 5 },
      summaryReason: 'Admired your thoughtful contemplation of defensive magic',
    });
  } else if (inputLower.includes('snape') || inputLower.includes('potion')) {
    narrative.push(
      `The green flames beneath the dungeon cauldrons flicker as Professor Snape turns sharply, his black cloak whispering against the stone floor.`
    );
    characterSpeech.push({
      speaker: 'Severus Snape',
      speech:
        '“Curiosity in these corridors has a high cost, Vance. Ensure your wandwork matches your ambition, or find yourself scrubbing cauldrons until dawn.”',
      expression: 'scrutinizing you with razor-sharp intensity',
    });
    updates.push({
      characterId: 'snape',
      nuancedChanges: { respect: 5, suspicion: 4 },
      summaryReason: 'Observed your defiance with characteristic dungeon scrutiny',
    });
  } else if (inputLower.includes('hermione') || inputLower.includes('library')) {
    narrative.push(
      `Hermione looks up from a fortress of parchment scrolls and leather-bound appeals for the Committee for Dangerous Creatures, her quill trembling with exhausted passion.`
    );
    characterSpeech.push({
      speaker: 'Hermione Granger',
      speech:
        '“I knew you would understand, Rowan! Malfoy provoked Buckbeak deliberately—Hagrid followed every safety protocol in the Ministry manual!”',
      expression: 'speaking with fierce, grateful relief',
    });
    updates.push({
      characterId: 'hermione',
      nuancedChanges: { trust: 8, affection: 6, respect: 7 },
      summaryReason: 'Grateful for your solidarity and intellect',
    });
  } else {
    narrative.push(
      `You resolve to: "${userInput}". Your footsteps echo softly through the ancient stone arches of ${currentLocation || 'Hogwarts'}.`
    );
    narrative.push(
      `A cool Scottish Highland breeze carries the scent of pine and damp earth from the Forbidden Forest. In the distance, the bells of the Clock Tower chime the hour.`
    );
  }

  return {
    narrative,
    characterSpeech,
    consequences: {
      housePointsChange: points,
      detentionChange: 0,
      discoveredClue: null,
      newSecret: null,
    },
    relationshipUpdates: updates,
    spontaneousEvent: null,
    suggestedIntentions: [
      'Ask Professor Lupin about the rumors surrounding Sirius Black',
      'Meet Hermione in the library to cross-reference creature appeals',
      'Inspect the Marauder’s Map for any unusual footprints in the castle',
    ],
  };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
});

// ----------------------------------------------------
// Mount Vite middlewares in development or static in prod
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Hogwarts Adventure Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
