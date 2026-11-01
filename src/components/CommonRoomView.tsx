import React, { useState } from 'react';
import {
  Flame,
  Shield,
  Trophy,
  MessageSquare,
  Pin,
  Sparkles,
  BookOpen,
  Eye,
  Scroll,
  Plus,
  Send,
  Check,
  Award,
  AlertCircle,
  Coffee,
  Feather,
  HelpCircle,
  X,
  Search,
} from 'lucide-react';
import { House, PlayerCharacter } from '../types';
import { soundEngine } from '../utils/audio';

interface CommonRoomViewProps {
  character: PlayerCharacter;
  onAwardPoints: (points: number, reason: string) => void;
  onAddDiscovery?: (discovery: any) => void;
  onAddJournalEntry?: (entry: any) => void;
}

interface HouseNotice {
  id: string;
  title: string;
  author: string;
  yearGroup: string;
  category: 'Academics' | 'Quidditch & Duels' | 'Rumors & Curfew' | 'Lost & Found';
  timestamp: string;
  content: string;
  urgent?: boolean;
  repliesCount?: number;
  signedCount?: number;
  hasSigned?: boolean;
  isPlayerPost?: boolean;
}

interface PrefectMessage {
  id: string;
  sender: 'prefect' | 'player';
  text: string;
  timestamp: string;
  mood?: string;
  houseAdvice?: string;
}

export const CommonRoomView: React.FC<CommonRoomViewProps> = ({
  character,
  onAwardPoints,
  onAddDiscovery,
  onAddJournalEntry,
}) => {
  // Allow user to explore other common rooms or stick to their sorted house
  const [activeHouse, setActiveHouse] = useState<House>(character.house || 'Gryffindor');
  const [activeTab, setActiveTab] = useState<'hearth' | 'standings' | 'prefect' | 'notice_board'>('hearth');

  // Hearth interactive states
  const [hearthFireStoked, setHearthFireStoked] = useState(false);
  const [windowInspected, setWindowInspected] = useState(false);
  const [founderRelicInspected, setFounderRelicInspected] = useState(false);
  const [dormitorySlideTriggered, setDormitorySlideTriggered] = useState(false);
  const [hasStudiedToday, setHasStudiedToday] = useState(false);

  // Message Board states
  const [noticeCategory, setNoticeCategory] = useState<string>('all');
  const [noticeSearch, setNoticeSearch] = useState<string>('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'Academics' | 'Quidditch & Duels' | 'Rumors & Curfew' | 'Lost & Found'>('Academics');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeUrgent, setNewNoticeUrgent] = useState(false);

  // Prefect Chat states
  const [prefectInput, setPrefectInput] = useState('');
  const [isPrefectThinking, setIsPrefectThinking] = useState(false);

  // Initial notices customized per house
  const initialNoticesByHouse: Record<House, HouseNotice[]> = {
    Gryffindor: [
      {
        id: 'gn-1',
        title: 'Quidditch Practice: 6:00 AM Dawn Drills',
        author: 'Oliver Wood (Keeper & Captain)',
        yearGroup: '7th Year',
        category: 'Quidditch & Duels',
        timestamp: 'Today, 06:15',
        content:
          'Rain, snow, or gale-force winds—be on the pitch by first bell. We play Hufflepuff first this term, and Diggory has been practicing high-dive seeker swoops. Chasers need to tighten their Hawkshead Attacking formation. No excuses.',
        urgent: true,
        signedCount: 6,
      },
      {
        id: 'gn-2',
        title: 'Fat Lady Password Rotation Notice',
        author: 'Percy Weasley (Head Boy)',
        yearGroup: '7th Year',
        category: 'Rumors & Curfew',
        timestamp: 'Yesterday, 21:00',
        content:
          'Following recent security reviews by Professor McGonagall, the password for the portrait hole has been changed to "Fortuna Major". Do NOT write this down on scrap parchment or leave it near the common room threshold under any circumstances.',
        urgent: true,
        signedCount: 14,
      },
      {
        id: 'gn-3',
        title: 'Transfiguration Revision Group: Animagus Theory & Switches',
        author: 'Hermione Granger',
        yearGroup: '3rd Year',
        category: 'Academics',
        timestamp: 'Yesterday, 17:30',
        content:
          'Meeting by the library-facing armchairs after dinner. We will be reviewing cross-species switching formulas and the Ministry register laws. Please bring your own inkwells and parchment.',
        signedCount: 8,
      },
      {
        id: 'gn-4',
        title: 'Lost: Solid Brass Gobstone Set (With Rancid Smelling Fluid)',
        author: 'Ron Weasley',
        yearGroup: '3rd Year',
        category: 'Lost & Found',
        timestamp: '2 days ago',
        content:
          'Left somewhere between the squashy armchair and the dormitory stairs. If found, handle gently—the squirt valve is loose and Crookshanks has been pawing at the bag.',
        signedCount: 3,
      },
      {
        id: 'gn-5',
        title: 'Informal Dueling & Shield Charm Workshop',
        author: 'Fred & George Weasley',
        yearGroup: '5th Year',
        category: 'Quidditch & Duels',
        timestamp: '3 days ago',
        content:
          'Tired of getting caught off-guard in dark corridors? Meet behind the portrait of Sir Cadogan on Thursday midnight. No prefects allowed (especially Percy). Bring your quickest reflexes.',
        signedCount: 19,
      },
    ],
    Slytherin: [
      {
        id: 'sn-1',
        title: 'Tribunal Petition: The Hippogriff Incident',
        author: 'Draco Malfoy',
        yearGroup: '3rd Year',
        category: 'Rumors & Curfew',
        timestamp: 'Today, 09:30',
        content:
          'Father has contacted the Committee for the Disposal of Dangerous Creatures regarding the savage beast kept by the gamekeeper. All true Slytherins should sign the testimonial confirming the beast attacked unprovoked.',
        urgent: true,
        signedCount: 22,
      },
      {
        id: 'sn-2',
        title: 'Potions Ingredient Barter: Boomslang Skin & Bicorn Horn',
        author: 'Pansy Parkinson',
        yearGroup: '3rd Year',
        category: 'Academics',
        timestamp: 'Yesterday, 18:45',
        content:
          'Seeking fresh African tree snake skin and powdered bicorn horn for advanced restorative draughts. Willing to trade powdered dragon claw and pickled newt eyes.',
        signedCount: 5,
      },
      {
        id: 'sn-3',
        title: 'Curfew Movement Protocols in the Lower Dungeons',
        author: 'Gemma Farley (Prefect)',
        yearGroup: '5th Year',
        category: 'Rumors & Curfew',
        timestamp: '2 days ago',
        content:
          'Filch and Mrs. Norris have set grease-traps along the corridor leading to the Boathouse. If returning from the grounds after dusk, use the damp sewer duct beneath the Potions classroom.',
        urgent: true,
        signedCount: 18,
      },
      {
        id: 'sn-4',
        title: 'Dueling Club: Non-Verbal Stupefy & Disarming',
        author: 'Blaise Zabini',
        yearGroup: '3rd Year',
        category: 'Quidditch & Duels',
        timestamp: '3 days ago',
        content:
          'Meeting in the cold alcove past the Salazar statue. Serious duelists only. If you cannot cast without flinching, stay in your four-poster.',
        signedCount: 9,
      },
    ],
    Ravenclaw: [
      {
        id: 'rn-1',
        title: 'Weekly Eagle Door Knocker Riddle: Pondering Session',
        author: 'Robert Hilliard (Prefect)',
        yearGroup: '6th Year',
        category: 'Academics',
        timestamp: 'Today, 08:00',
        content:
          'Today’s knocker riddle: "What can run but never walks, has a mouth but never talks, has a bed but never sleeps?" Discussions will take place beneath the bronze bust of Rowena.',
        signedCount: 15,
      },
      {
        id: 'rn-2',
        title: 'Arithmancy & Predictive Geometry Salon',
        author: 'Penelope Clearwater (Head Girl)',
        yearGroup: '7th Year',
        category: 'Academics',
        timestamp: 'Yesterday, 16:00',
        content:
          'Analyzing Septima Vector’s newly published papers on runic probability. Tea and peppermint biscuits will be provided by the arched bay window.',
        signedCount: 11,
      },
      {
        id: 'rn-3',
        title: 'Lost: Enchanted Ever-Inking Peacock Feather Quill',
        author: 'Cho Chang',
        yearGroup: '4th Year',
        category: 'Lost & Found',
        timestamp: 'Yesterday, 14:20',
        content:
          'Last seen in the West Wing balcony overlooking the Forbidden Forest. Inscribes glowing azure ink when writing poetry or charms notes.',
        signedCount: 4,
      },
      {
        id: 'rn-4',
        title: 'Midnight Astronomy Parapet Watch: Perseid Star-Stream',
        author: 'Padma Patil',
        yearGroup: '3rd Year',
        category: 'Rumors & Curfew',
        timestamp: '3 days ago',
        content:
          'The sky will be exceptionally clear tonight above the mountain peaks. Professor Sinistra has granted parapet passes for advanced telescopic charting.',
        signedCount: 12,
      },
    ],
    Hufflepuff: [
      {
        id: 'hn-1',
        title: 'Kitchen Snack Heist: Tickling the Pear at 9:30 PM',
        author: 'Gabriel Truman (Prefect)',
        yearGroup: '6th Year',
        category: 'Rumors & Curfew',
        timestamp: 'Today, 11:00',
        content:
          'The house-elves have just pulled fresh cinnamon rolls, gingerbread badgers, and warm pumpkin pasties from the hearth. Gathering quietly near the fruit bowl painting. Bring an extra napkin.',
        urgent: false,
        signedCount: 26,
      },
      {
        id: 'hn-2',
        title: 'Herbology Clipping Exchange & Mandrake Care',
        author: 'Hannah Abbott',
        yearGroup: '3rd Year',
        category: 'Academics',
        timestamp: 'Yesterday, 15:30',
        content:
          'I have three healthy saplings of Dittany and two cuttings of Bouncing Bulb ready for repotting. Looking for fresh Chinese Chomping Cabbage seeds or Venomous Tentacula leaf mulch.',
        signedCount: 10,
      },
      {
        id: 'hn-3',
        title: 'Quidditch Team Pep Rally & Hearth Roast',
        author: 'Cedric Diggory (Captain & Seeker)',
        yearGroup: '5th Year',
        category: 'Quidditch & Duels',
        timestamp: 'Yesterday, 19:00',
        content:
          'We face Gryffindor in the opening clash this weekend. Gathering in the center of the sett for butterbeer, roasted chestnuts, and broom-tuning. Everyone welcome, from first years to alumni portraits!',
        urgent: true,
        signedCount: 31,
      },
      {
        id: 'hn-4',
        title: 'Lost: Thick Hand-Knitted Canary Yellow Winter Scarf',
        author: 'Ernie Macmillan',
        yearGroup: '3rd Year',
        category: 'Lost & Found',
        timestamp: '4 days ago',
        content:
          'Embroidered with my family crest and enchanted to remain dry in Scottish sleet. Left near the barrels in the basement corridor.',
        signedCount: 5,
      },
    ],
  };

  const [notices, setNotices] = useState<Record<House, HouseNotice[]>>(initialNoticesByHouse);

  // House-specific Prefect Dossier
  const prefectDossiers = {
    Gryffindor: {
      name: 'Percy Weasley',
      title: 'Head Boy & Gryffindor Prefect',
      year: '7th Year',
      avatar: '🦁',
      badge: 'Shiny Silver & Gold Head Boy Badge',
      quote: '“Discipline, academic pride, and vigilance against Sirius Black will keep Gryffindor at the pinnacle of Hogwarts.”',
      specialty: 'School Regulations, Curfew Enforcement, Transfiguration',
    },
    Slytherin: {
      name: 'Gemma Farley',
      title: 'Slytherin House Prefect',
      year: '5th Year',
      avatar: '🐍',
      badge: 'Silver Emerald Serpent Crest',
      quote: '“We look out for our own. Never let the other houses see you hesitate, and always keep Professor Snape impressed.”',
      specialty: 'Dungeon Corridors, Potion Precision, Tactical House Unity',
    },
    Ravenclaw: {
      name: 'Robert Hilliard',
      title: 'Ravenclaw House Prefect',
      year: '6th Year',
      avatar: '🦅',
      badge: 'Bronze Eagle Diadem Brooch',
      quote: '“Wit beyond measure is man’s greatest treasure. Challenge every premise and seek truth beyond the syllabus.”',
      specialty: 'Philosophical Riddles, Arithmancy, Ancient Runes',
    },
    Hufflepuff: {
      name: 'Gabriel Truman',
      title: 'Hufflepuff House Prefect',
      year: '6th Year',
      avatar: '🦡',
      badge: 'Honey-Burnished Copper Badger Badge',
      quote: '“We work hard, we never abandon a friend, and we make the sweetest hot cocoa in the entire Scottish Highlands.”',
      specialty: 'Kitchen Passage Secrets, Herbology, House Loyalty',
    },
  };

  const activePrefect = prefectDossiers[activeHouse];

  // Prefect Conversation thread per house
  const initialPrefectMessages: Record<House, PrefectMessage[]> = {
    Gryffindor: [
      {
        id: 'pm-1',
        sender: 'prefect',
        text: `“Welcome to the tower, ${character.name}. As Head Boy, I must remind you that Professor Dumbledore has tightened all security measures. The Fat Lady was terrified after Black’s assault—ensure you never reveal our password to anyone outside our common room.”`,
        timestamp: 'Term 1993',
        mood: 'authoritative',
        houseAdvice: 'Check the bulletin board daily for password updates and Quidditch drills.',
      },
    ],
    Slytherin: [
      {
        id: 'pm-1',
        sender: 'prefect',
        text: `“Come in, ${character.name}. Sit by the hearth. The green depths of the lake keep our minds sharp. Remember our motto: we stand united against the sanctimonious posturing of the other houses. What brings you to my chair?”`,
        timestamp: 'Term 1993',
        mood: 'conspiratorial',
        houseAdvice: 'Work closely with Professor Snape to secure top marks in Potions.',
      },
    ],
    Ravenclaw: [
      {
        id: 'pm-1',
        sender: 'prefect',
        text: `“Welcome high above the clouds, ${character.name}. The eagle knocker tested us with a brilliant riddle today. How are your studies progressing? Don't hesitate to share any philosophical dilemmas you encounter.”`,
        timestamp: 'Term 1993',
        mood: 'encouraging',
        houseAdvice: 'Spend an hour each evening studying by the arched starlight windows.',
      },
    ],
    Hufflepuff: [
      {
        id: 'pm-1',
        sender: 'prefect',
        text: `“Come on in, ${character.name}! Warm yourself up—the hearth has been crackling with apple-wood all evening. Diggory and the team are feeling great about the season. Have you had anything to eat yet?”`,
        timestamp: 'Term 1993',
        mood: 'warm',
        houseAdvice: 'Never skip breakfast or study groups—Hufflepuff strength is in our numbers.',
      },
    ],
  };

  const [prefectChats, setPrefectChats] = useState<Record<House, PrefectMessage[]>>(initialPrefectMessages);

  // Dynamic House Point standings
  // Player's house points dynamically scale their house!
  const basePoints = {
    Gryffindor: 385,
    Slytherin: 410,
    Ravenclaw: 395,
    Hufflepuff: 390,
  };

  const currentHousePoints = {
    ...basePoints,
    [character.house]: basePoints[character.house] + (character.housePoints || 0),
  };

  // Sorted House standings
  const sortedStandings = (['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'] as House[])
    .map((h) => ({
      house: h,
      points: currentHousePoints[h],
      gemName:
        h === 'Gryffindor'
          ? 'Rubies'
          : h === 'Slytherin'
          ? 'Emeralds'
          : h === 'Ravenclaw'
          ? 'Sapphires'
          : 'Topazes & Yellow Diamonds',
      gemColor:
        h === 'Gryffindor'
          ? 'bg-rose-600'
          : h === 'Slytherin'
          ? 'bg-emerald-600'
          : h === 'Ravenclaw'
          ? 'bg-blue-600'
          : 'bg-amber-500',
      gemGlow:
        h === 'Gryffindor'
          ? 'shadow-[0_0_15px_rgba(225,29,72,0.6)]'
          : h === 'Slytherin'
          ? 'shadow-[0_0_15px_rgba(16,185,129,0.6)]'
          : h === 'Ravenclaw'
          ? 'shadow-[0_0_15px_rgba(37,99,235,0.6)]'
          : 'shadow-[0_0_15px_rgba(245,158,11,0.6)]',
    }))
    .sort((a, b) => b.points - a.points);

  // House Themes configurations
  const houseThemes: Record<
    House,
    {
      name: string;
      bgClass: string;
      accentBorder: string;
      cardBg: string;
      primaryColor: string;
      secondaryColor: string;
      founder: string;
      relic: string;
      relicDescription: string;
      ghost: string;
      locationDescription: string;
      windowView: string;
      ambientText: string;
      founderQuote: string;
    }
  > = {
    Gryffindor: {
      name: 'Gryffindor',
      bgClass: 'from-[#2b0c0c] via-[#1a0a0a] to-[#0d0606]',
      accentBorder: 'border-red-800/60',
      cardBg: 'bg-[#1e0e0e]/80',
      primaryColor: 'text-amber-400',
      secondaryColor: 'text-red-400',
      founder: 'Godric Gryffindor',
      relic: 'The Sword of Godric Gryffindor',
      relicDescription:
        'A thousand-year-old goblin-wrought blade fashioned of pure silver, set with egg-sized rubies. Imbued with whatever makes it stronger—presently locked safely in Dumbledore’s headmaster vault, but its image hangs proudly embroidered on the scarlet hearth tapestry.',
      ghost: 'Sir Nicholas de Mimsy-Porpington (Nearly Headless Nick)',
      locationDescription:
        'High atop Gryffindor Tower on the seventh floor, guarded by the portrait hole of the Fat Lady in pink silk. Circular, cozy, and perpetually warmed by a roaring log hearth.',
      windowView:
        'Towering high above the grounds, the arched mullioned windows overlook the Forbidden Forest and the gold-ringed hoops of the Quidditch Pitch, framed by rolling Scottish mist and stormy highland clouds.',
      ambientText:
        'A crackling fire in the gothic fireplace warms squashy velvet armchairs, scattering golden sparks across scarlet tapestries embroidered with prowling lions.',
      founderQuote: '“Their daring, nerve, and chivalry set Gryffindors apart.”',
    },
    Slytherin: {
      name: 'Slytherin',
      bgClass: 'from-[#072418] via-[#051710] to-[#030d09]',
      accentBorder: 'border-emerald-800/60',
      cardBg: 'bg-[#081a13]/80',
      primaryColor: 'text-emerald-400',
      secondaryColor: 'text-emerald-200',
      founder: 'Salazar Slytherin',
      relic: 'The Heavy Gold Locket of Salazar',
      relicDescription:
        'An ornate golden locket stamped with the serpentine letter ‘S’ set with green serpent emeralds. An ancient family heirloom steeped in formidable Occlumency and dark ancestral protections.',
      ghost: 'The Bloody Baron',
      locationDescription:
        'Deep beneath the Black Lake within the ancient castle dungeons, entered by speaking a whispered password to a bare stretch of damp stone wall.',
      windowView:
        'Arched leaded-glass windows look directly out into the deep, cold green depths of the Black Lake. Dark aquatic shadows, grindylows, and the long rippling tentacles of the Giant Squid occasionally drift past.',
      ambientText:
        'Low-ceilinged rough stone walls illuminated by hanging green lamps suspended on tarnished silver chains, reflecting off carved dark leather chesterfields and grand stone serpent carvings.',
      founderQuote: '“Those cunning folk use any means to achieve their ends.”',
    },
    Ravenclaw: {
      name: 'Ravenclaw',
      bgClass: 'from-[#0b1b36] via-[#071124] to-[#040814]',
      accentBorder: 'border-blue-800/60',
      cardBg: 'bg-[#0c1a30]/80',
      primaryColor: 'text-sky-400',
      secondaryColor: 'text-amber-300',
      founder: 'Rowena Ravenclaw',
      relic: 'The Lost Diadem of Rowena Ravenclaw',
      relicDescription:
        'A delicate tiara engraved with the proverb: “Wit beyond measure is man’s greatest treasure.” The original diadem was lost for centuries, but a majestic white marble replica sits crowned upon Rowena’s statue.',
      ghost: 'The Grey Lady (Helena Ravenclaw)',
      locationDescription:
        'At the pinnacle of the West Wing in Ravenclaw Tower, entered through a grand oak door bearing a bronze eagle knocker that admits only those who solve a philosophical riddle.',
      windowView:
        'Vast arched windows offer sweeping, dizzying vistas of the snow-tipped Scottish mountains, the Astronomy Tower parapets, and the sparkling surface of the Great Lake far below.',
      ambientText:
        'A wide, airy circular room with midnight-blue silk draperies and a domed ceiling painted with gold rotating constellations. Bookshelves line every wall, illuminated by warm reading sconces.',
      founderQuote: '“For Ravenclaw, the cleverest would always be the best.”',
    },
    Hufflepuff: {
      name: 'Hufflepuff',
      bgClass: 'from-[#2b1f0c] via-[#1a1307] to-[#0e0a04]',
      accentBorder: 'border-amber-700/60',
      cardBg: 'bg-[#1e1509]/80',
      primaryColor: 'text-amber-400',
      secondaryColor: 'text-yellow-200',
      founder: 'Helga Hufflepuff',
      relic: 'The Golden Two-Handled Cup of Helga',
      relicDescription:
        'An exquisite golden chalice engraved with a dancing badger and adorned with two finely worked handles, said to possess mysterious restorative and nourishing enchantments.',
      ghost: 'The Fat Friar',
      locationDescription:
        'In the castle basement along the kitchen corridor, hidden behind a stack of barrels. Accessed by tapping the barrel two from the bottom in the middle of the second row, in the rhythm of ‘Helga Hufflepuff’.',
      windowView:
        'Round, low-set windows peek out level with the castle lawns, showing lush green grass, blooming dandelions, and the scurrying paws of friendly grounds creatures.',
      ambientText:
        'A cozy, earth-scented cellar reminiscent of a warm badger sett, with honey-colored polished wood, copper warming pans, plush yellow velvet armchairs, and trailing lush enchanted ferns.',
      founderQuote: '“I’ll teach the lot, and treat them just the same.”',
    },
  };

  const theme = houseThemes[activeHouse];

  // Stoke Hearth Fire Action
  const handleStokeFire = () => {
    soundEngine.playSpellCast('charm');
    setHearthFireStoked(true);
    setTimeout(() => setHearthFireStoked(false), 2400);
  };

  // Study in Common Room
  const handleStudy = () => {
    if (hasStudiedToday) return;
    soundEngine.playParchmentRustle();
    setHasStudiedToday(true);
    onAwardPoints(5, `Studied diligently in the ${character.house} Common Room`);
    if (onAddJournalEntry) {
      onAddJournalEntry({
        id: `j_${Date.now()}`,
        date: 'Term 1993',
        title: `Evening Study at ${character.house} Hearth`,
        content: `Spent a quiet hour revising charms and transfiguration notes in the warmth of the common room. The fire crackled comfortably as students shared rumors about Sirius Black and upcoming Quidditch tactics.`,
        mood: 'Hopeful',
        relatedEvent: 'Common Room Study',
      });
    }
  };

  // Prefect Quick Questions
  const handleQuickQuestion = async (question: string) => {
    setPrefectInput('');
    await sendPrefectDialogue(question);
  };

  // Prefect Dialogue Send
  const handleSendPrefectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefectInput.trim() || isPrefectThinking) return;
    const msg = prefectInput.trim();
    setPrefectInput('');
    await sendPrefectDialogue(msg);
  };

  const sendPrefectDialogue = async (userMsg: string) => {
    soundEngine.playParchmentRustle();

    const playerMsg: PrefectMessage = {
      id: `pmsg_${Date.now()}`,
      sender: 'player',
      text: userMsg,
      timestamp: 'Just now',
    };

    setPrefectChats((prev) => ({
      ...prev,
      [activeHouse]: [...prev[activeHouse], playerMsg],
    }));

    setIsPrefectThinking(true);

    try {
      const res = await fetch('/api/common-room/prefect-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prefectName: activePrefect.name,
          prefectHouse: activeHouse,
          prefectRole: activePrefect.title,
          playerCharacter: character,
          userMessage: userMsg,
        }),
      });

      const data = await res.json();
      soundEngine.playSpellCast('spark');

      const replyMsg: PrefectMessage = {
        id: `pmsg_rep_${Date.now()}`,
        sender: 'prefect',
        text: data.reply || `“Understood, ${character.name}. Keep your eyes open and do not take foolish risks.”`,
        timestamp: 'Just now',
        mood: data.mood,
        houseAdvice: data.houseAdvice,
      };

      setPrefectChats((prev) => ({
        ...prev,
        [activeHouse]: [...prev[activeHouse], replyMsg],
      }));
    } catch {
      // Local fallback
      soundEngine.playSpellCast('spark');
      const fallbackReply: PrefectMessage = {
        id: `pmsg_rep_${Date.now()}`,
        sender: 'prefect',
        text: `“I hear you, ${character.name}. Keep your focus squarely on your coursework and mind the curfew bells.”`,
        timestamp: 'Just now',
        mood: 'authoritative',
      };
      setPrefectChats((prev) => ({
        ...prev,
        [activeHouse]: [...prev[activeHouse], fallbackReply],
      }));
    } finally {
      setIsPrefectThinking(false);
    }
  };

  // Sign Notice
  const handleSignNotice = (noticeId: string) => {
    soundEngine.playParchmentRustle();
    setNotices((prev) => {
      const houseList = prev[activeHouse].map((n) => {
        if (n.id === noticeId) {
          const already = n.hasSigned;
          return {
            ...n,
            hasSigned: !already,
            signedCount: (n.signedCount || 0) + (already ? -1 : 1),
          };
        }
        return n;
      });
      return { ...prev, [activeHouse]: houseList };
    });
  };

  // Pin New Notice
  const handlePinNewNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    soundEngine.playParchmentRustle();

    const created: HouseNotice = {
      id: `notice_${Date.now()}`,
      title: newNoticeTitle.trim(),
      author: `${character.name} (You)`,
      yearGroup: `Year ${character.year || 3}`,
      category: newNoticeCategory,
      timestamp: 'Just now',
      content: newNoticeContent.trim(),
      urgent: newNoticeUrgent,
      signedCount: 1,
      hasSigned: true,
      isPlayerPost: true,
    };

    setNotices((prev) => ({
      ...prev,
      [activeHouse]: [created, ...prev[activeHouse]],
    }));

    setNewNoticeTitle('');
    setNewNoticeContent('');
    setNewNoticeUrgent(false);
    setIsPinModalOpen(false);

    if (onAddDiscovery) {
      onAddDiscovery({
        id: `disc_notice_${Date.now()}`,
        title: `Pinned Notice in ${activeHouse} Board`,
        category: 'House Community',
        description: `Posted a formal parchment notice to fellow housemates regarding: "${created.title}".`,
        timestamp: 'Term 1993',
      });
    }
  };

  // Filter notices
  const activeHouseNotices = notices[activeHouse] || [];
  const filteredNotices = activeHouseNotices.filter((n) => {
    const matchesCategory = noticeCategory === 'all' || n.category === noticeCategory;
    const matchesSearch =
      noticeSearch.trim() === '' ||
      n.title.toLowerCase().includes(noticeSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(noticeSearch.toLowerCase()) ||
      n.author.toLowerCase().includes(noticeSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-[calc(100vh-130px)] bg-gradient-to-b ${theme.bgClass} text-[#e4d6c0] font-garamond pb-16`}>
      {/* Top Atmospheric Banner */}
      <div className="border-b border-[#3d271d]/80 bg-[#120a07]/90 px-4 sm:px-6 py-4 shadow-lg backdrop-blur-md sticky top-[108px] z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-2xl border ${theme.accentBorder} bg-black/40 shadow-inner`}>
              {activeHouse === 'Gryffindor' && '🦁'}
              {activeHouse === 'Slytherin' && '🐍'}
              {activeHouse === 'Ravenclaw' && '🦅'}
              {activeHouse === 'Hufflepuff' && '🦡'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-[#f5ebd7] flex items-center gap-2">
                  <span>{theme.name} Common Room</span>
                  {character.house === activeHouse && (
                    <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-amber-400/90 border border-amber-600/50 px-1.5 py-0.5 rounded bg-amber-950/40">
                      Your House
                    </span>
                  )}
                </h1>
              </div>
              <p className="text-xs text-[#a89680] italic mt-0.5 max-w-xl line-clamp-1 sm:line-clamp-none">
                {theme.locationDescription}
              </p>
            </div>
          </div>

          {/* House Selector for previewing other common rooms */}
          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-lg border border-[#3d271d] text-xs">
            <span className="text-[10px] text-[#8c7b68] uppercase tracking-wider px-2 font-cinzel">Sanctuary:</span>
            {(['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'] as House[]).map((h) => {
              const isSelected = activeHouse === h;
              return (
                <button
                  key={h}
                  onClick={() => {
                    soundEngine.playParchmentRustle();
                    setActiveHouse(h);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-cinzel transition-all ${
                    isSelected
                      ? 'bg-[#3b2414] text-amber-300 font-bold border border-amber-600/70 shadow-sm'
                      : 'text-[#9c8b78] hover:text-[#f0e4d0] hover:bg-black/30'
                  }`}
                >
                  {h}
                </button>
              );
            })}
          </div>
        </div>

        {/* View Navigation Sub-Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 mt-4 border-t border-[#2d1e16] pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('hearth')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-cinzel text-xs font-semibold tracking-wider transition-all ${
              activeTab === 'hearth'
                ? 'bg-amber-900/40 text-amber-200 border border-amber-600/60 shadow-[0_0_12px_rgba(217,119,6,0.25)]'
                : 'text-[#9c8b78] hover:text-[#f5ebd7] hover:bg-black/30 border border-transparent'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>The Hearth & Ambiance</span>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-cinzel text-xs font-semibold tracking-wider transition-all ${
              activeTab === 'standings'
                ? 'bg-amber-900/40 text-amber-200 border border-amber-600/60 shadow-[0_0_12px_rgba(217,119,6,0.25)]'
                : 'text-[#9c8b78] hover:text-[#f5ebd7] hover:bg-black/30 border border-transparent'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>House Standings & Hourglasses</span>
          </button>

          <button
            onClick={() => setActiveTab('prefect')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-cinzel text-xs font-semibold tracking-wider transition-all relative ${
              activeTab === 'prefect'
                ? 'bg-amber-900/40 text-amber-200 border border-amber-600/60 shadow-[0_0_12px_rgba(217,119,6,0.25)]'
                : 'text-[#9c8b78] hover:text-[#f5ebd7] hover:bg-black/30 border border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Prefect’s Corner ({activePrefect.name.split(' ')[0]})</span>
          </button>

          <button
            onClick={() => setActiveTab('notice_board')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-cinzel text-xs font-semibold tracking-wider transition-all relative ${
              activeTab === 'notice_board'
                ? 'bg-amber-900/40 text-amber-200 border border-amber-600/60 shadow-[0_0_12px_rgba(217,119,6,0.25)]'
                : 'text-[#9c8b78] hover:text-[#f5ebd7] hover:bg-black/30 border border-transparent'
            }`}
          >
            <Pin className="w-3.5 h-3.5 text-amber-400" />
            <span>House Notice Board</span>
            {activeHouseNotices.length > 0 && (
              <span className="text-[10px] bg-amber-600/60 text-white px-1.5 py-0.2 rounded font-sans font-bold">
                {activeHouseNotices.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* ========================================================================= */}
        {/* TAB 1: THE HEARTH & ROOM AMBIANCE */}
        {/* ========================================================================= */}
        {activeTab === 'hearth' && (
          <div className="space-y-6">
            {/* Atmospheric Room Hero */}
            <div className={`relative overflow-hidden rounded-xl border ${theme.accentBorder} bg-black/60 p-6 md:p-8 shadow-2xl`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-transparent to-black pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="max-w-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#a89680] font-cinzel">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{theme.ghost} drifts quietly near the archways</span>
                  </div>
                  <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#f5ebd7]">
                    The Roaring Hearth of {theme.name}
                  </h2>
                  <p className="text-[#d8c8b2] text-sm sm:text-base leading-relaxed">
                    {theme.ambientText}
                  </p>
                  <blockquote className="border-l-2 border-amber-500/50 pl-3 italic text-xs sm:text-sm text-[#bcaaa0]">
                    {theme.founderQuote} — <span className="font-cinzel not-italic">{theme.founder}</span>
                  </blockquote>
                </div>

                {/* Animated Hearth Fireplace & Quick Actions */}
                <div className="flex flex-col items-center bg-[#180f0a]/90 p-5 rounded-xl border border-amber-800/40 shadow-inner w-full md:w-auto min-w-[240px]">
                  <div className="relative w-36 h-28 flex items-center justify-center">
                    {/* Fireplace glow */}
                    <div
                      className={`absolute inset-0 rounded-full bg-amber-500/30 blur-xl transition-all duration-700 ${
                        hearthFireStoked ? 'scale-150 bg-orange-500/50' : 'animate-pulse'
                      }`}
                    />
                    {/* Fire icon with embers */}
                    <Flame
                      className={`w-16 h-16 transition-all duration-300 ${
                        hearthFireStoked
                          ? 'scale-125 text-orange-400 drop-shadow-[0_0_25px_rgba(251,146,60,0.9)] animate-bounce'
                          : 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.7)]'
                      }`}
                    />
                  </div>

                  <div className="text-center mt-2 space-y-2 w-full">
                    <p className="text-xs text-[#a89680] font-cinzel">Crackling Ember Log Fire</p>
                    <div className="flex flex-col gap-2 w-full">
                      <button
                        onClick={handleStokeFire}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-600 hover:to-orange-600 text-[#fff5e6] text-xs font-cinzel font-semibold shadow hover:shadow-amber-600/30 transition-all"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Stoke the Hearthfire</span>
                      </button>

                      <button
                        onClick={handleStudy}
                        disabled={hasStudiedToday}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-cinzel font-semibold transition-all ${
                          hasStudiedToday
                            ? 'bg-stone-900/60 text-[#7a6f62] border border-stone-800 cursor-not-allowed'
                            : 'bg-[#291b12] hover:bg-[#3d2719] text-amber-200 border border-amber-700/50'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{hasStudiedToday ? 'Studies Completed Today' : 'Study by the Fire (+5 Pts)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Window Overlook */}
              <div className={`rounded-xl border ${theme.accentBorder} bg-black/40 p-5 space-y-3 shadow-md flex flex-col justify-between`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-cinzel uppercase tracking-wider">
                    <Eye className="w-4 h-4" />
                    <span>The Outer Outlook</span>
                  </div>
                  <h3 className="font-cinzel text-lg font-bold text-[#f5ebd7]">
                    {activeHouse === 'Gryffindor'
                      ? 'Towering Highland Parapet'
                      : activeHouse === 'Slytherin'
                      ? 'Black Lake Subterranean Windows'
                      : activeHouse === 'Ravenclaw'
                      ? 'High Astronomy Overlook'
                      : 'Garden Level Cellar Panes'}
                  </h3>
                  <p className="text-xs text-[#c4b5a0] leading-relaxed">
                    {theme.windowView}
                  </p>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playParchmentRustle();
                    setWindowInspected(!windowInspected);
                  }}
                  className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#1f150e] hover:bg-[#302115] text-xs font-cinzel text-amber-300 border border-amber-700/40 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{windowInspected ? 'Close Gazing Glass' : 'Peer Through the Glass'}</span>
                </button>
              </div>

              {/* Feature 2: Founder's Relic Lore */}
              <div className={`rounded-xl border ${theme.accentBorder} bg-black/40 p-5 space-y-3 shadow-md flex flex-col justify-between`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-cinzel uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    <span>Founder’s Heritage</span>
                  </div>
                  <h3 className="font-cinzel text-lg font-bold text-[#f5ebd7]">{theme.relic}</h3>
                  <p className="text-xs text-[#c4b5a0] leading-relaxed">
                    Preserved through generations of Hogwarts heads and house champions. {theme.relicDescription}
                  </p>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playSpellCast('spark');
                    setFounderRelicInspected(!founderRelicInspected);
                  }}
                  className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#1f150e] hover:bg-[#302115] text-xs font-cinzel text-amber-300 border border-amber-700/40 transition-colors"
                >
                  <Scroll className="w-3.5 h-3.5" />
                  <span>{founderRelicInspected ? 'Conceal Legend' : 'Inspect Founder’s Legend'}</span>
                </button>
              </div>

              {/* Feature 3: Dormitory Entrances & Charms */}
              <div className={`rounded-xl border ${theme.accentBorder} bg-black/40 p-5 space-y-3 shadow-md flex flex-col justify-between`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-cinzel uppercase tracking-wider">
                    <Coffee className="w-4 h-4" />
                    <span>Dormitory Quarters</span>
                  </div>
                  <h3 className="font-cinzel text-lg font-bold text-[#f5ebd7]">
                    Spiral Stairs & Four-Poster Beds
                  </h3>
                  <p className="text-xs text-[#c4b5a0] leading-relaxed">
                    {activeHouse === 'Gryffindor'
                      ? 'Two spiral staircases wind upward. The girls’ stairs are famously enchanted with the ‘Glisseo’ jinx—if a boy steps onto them, the stone stairs flatten into an inescapable slide!'
                      : activeHouse === 'Slytherin'
                      ? 'Subterranean corridors branch off toward dark oak doors. Sound is muffled by heavy velvet hangings and stone vaults.'
                      : activeHouse === 'Ravenclaw'
                      ? 'High airy chambers under the roof turrets, where the night wind whistles gentle lullabies across the four-posters.'
                      : 'Circular wooden doors resembling giant barrel lids lead to low, warm, circular bedrooms with patchwork quilts.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playRiddikulus();
                    setDormitorySlideTriggered(true);
                    setTimeout(() => setDormitorySlideTriggered(false), 3000);
                  }}
                  className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#1f150e] hover:bg-[#302115] text-xs font-cinzel text-amber-300 border border-amber-700/40 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Dormitory Entrance Charm</span>
                </button>
              </div>
            </div>

            {/* Interactive Alert / Modals based on actions */}
            {windowInspected && (
              <div className="rounded-xl border border-amber-600/50 bg-[#160c07]/95 p-5 shadow-xl animate-fadeIn space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-cinzel text-amber-300 text-sm font-bold flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>The Outlook from {theme.name}</span>
                  </h4>
                  <button
                    onClick={() => setWindowInspected(false)}
                    className="text-[#8c7b68] hover:text-[#f0e4d0]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-[#dfd0bd] leading-relaxed">
                  You step up to the gothic leaded glass. {theme.windowView} Outside, a distant screech-owl darts across the twilight, heading towards the Owlery. The wind howls softly against the ancient stonework, making the common room hearth feel doubly warm and impenetrable.
                </p>
              </div>
            )}

            {founderRelicInspected && (
              <div className="rounded-xl border border-amber-600/50 bg-[#160c07]/95 p-5 shadow-xl animate-fadeIn space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-cinzel text-amber-300 text-sm font-bold flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Relic Chronicle: {theme.relic}</span>
                  </h4>
                  <button
                    onClick={() => setFounderRelicInspected(false)}
                    className="text-[#8c7b68] hover:text-[#f0e4d0]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-[#dfd0bd] leading-relaxed">
                  Inscribed upon the gilded plate: <em>“{theme.relicDescription}”</em> Hogwarts was founded over a millennium ago by the four greatest witches and wizards of the age. Every time a student defends their house ideals, the magical core of the castle resonates in harmony.
                </p>
              </div>
            )}

            {dormitorySlideTriggered && (
              <div className="rounded-xl border border-amber-500 bg-amber-950/90 p-4 shadow-xl animate-bounce space-y-1">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-cinzel font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Stairs Transformed! (Glisseo Charm Triggered)</span>
                </div>
                <p className="text-xs text-[#faeade]">
                  A loud whooping klaxon rings out! The stone steps instantly melt into a mirror-slick stone slide, sending anyone attempting to sneak up tumbling backwards into the soft carpet of the common room!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: HOUSE STANDINGS & ENCHANTED HOURGLASSES */}
        {/* ========================================================================= */}
        {activeTab === 'standings' && (
          <div className="space-y-6">
            <div className="bg-black/60 border border-[#3d271d] rounded-xl p-6 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-cinzel text-2xl font-bold text-[#f5ebd7] flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <span>The Hogwarts House Cup Standings</span>
                  </h2>
                  <p className="text-xs text-[#a89680]">
                    Enchanted hourglasses in the entrance hall record every triumph and disciplinary penalty in real time.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#a89680] font-cinzel">Your Contribution:</span>
                  <span className="font-cinzel text-sm font-bold text-amber-400 bg-amber-950/60 border border-amber-600/40 px-2.5 py-1 rounded">
                    +{character.housePoints || 0} pts
                  </span>
                </div>
              </div>

              {/* 4 Giant Hourglasses Display */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {sortedStandings.map((standing, idx) => {
                  const isPlayerHouse = standing.house === character.house;
                  // calculate fill percentage (max 500)
                  const fillPercent = Math.min(100, Math.max(15, (standing.points / 500) * 100));

                  return (
                    <div
                      key={standing.house}
                      className={`relative rounded-xl border p-4 flex flex-col items-center justify-between text-center transition-all ${
                        isPlayerHouse
                          ? 'border-amber-500/80 bg-amber-950/20 shadow-[0_0_20px_rgba(217,119,6,0.2)]'
                          : 'border-[#332319] bg-black/40'
                      }`}
                    >
                      {/* Rank ribbon */}
                      <div className="w-full flex items-center justify-between text-xs font-cinzel font-bold text-[#bcaaa0] mb-2">
                        <span>Rank #{idx + 1}</span>
                        {isPlayerHouse && (
                          <span className="text-[10px] text-amber-400 uppercase tracking-widest font-sans">You</span>
                        )}
                      </div>

                      {/* Animated Hourglass Container */}
                      <div className="w-16 h-40 rounded-full border-2 border-[#543b2b] bg-black/70 relative overflow-hidden flex flex-col justify-end p-1 my-2 shadow-inner">
                        {/* Upper glass taper */}
                        <div className="absolute top-0 left-0 right-0 h-10 border-b border-[#3b281c] bg-stone-900/30" />

                        {/* Middle neck */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-3 right-3 h-2 bg-[#2d1e16] rounded-full z-10" />

                        {/* Gems falling stream */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-white/40 animate-pulse pointer-events-none" />

                        {/* Lower glass gem pile */}
                        <div
                          style={{ height: `${fillPercent}%` }}
                          className={`w-full rounded-b-full ${standing.gemColor} ${standing.gemGlow} transition-all duration-700 relative`}
                        >
                          {/* Sparkles on gems */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent)]" />
                        </div>
                      </div>

                      <div className="space-y-1 mt-2">
                        <h4 className="font-cinzel text-sm font-bold text-[#f0e3ce]">{standing.house}</h4>
                        <div className="font-cinzel text-xl font-black text-amber-300">
                          {standing.points} <span className="text-[10px] font-sans font-normal text-[#9c8b78]">pts</span>
                        </div>
                        <p className="text-[10px] text-[#8c7b68]">{standing.gemName}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* House Points Breakdown & Historic Contributors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Breakdown */}
              <div className="bg-black/50 border border-[#3d271d] rounded-xl p-5 space-y-4">
                <h3 className="font-cinzel text-base font-bold text-[#f5ebd7] flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{activeHouse} Points Ledger (Current Term)</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-[#2b1b13]">
                    <span className="text-[#c4b5a0]">Academic Excellence (Charms & Transfiguration)</span>
                    <span className="text-emerald-400 font-bold font-cinzel">+165 pts</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#2b1b13]">
                    <span className="text-[#c4b5a0]">Defense Against the Dark Arts (Boggart Mastery)</span>
                    <span className="text-emerald-400 font-bold font-cinzel">+90 pts</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#2b1b13]">
                    <span className="text-[#c4b5a0]">Quidditch League Matches Won</span>
                    <span className="text-emerald-400 font-bold font-cinzel">+100 pts</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#2b1b13]">
                    <span className="text-[#c4b5a0]">Exceptional Valor & Castle Secrets</span>
                    <span className="text-emerald-400 font-bold font-cinzel">+45 pts</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-[#9c8b78]">
                    <span className="text-rose-400/90">Curfew Infractions & Filch Encounters</span>
                    <span className="text-rose-400 font-bold font-cinzel">-20 pts</span>
                  </div>
                </div>

                <div className="p-3 bg-[#180e09] rounded-lg border border-[#3b2518] text-xs text-[#a89680]">
                  <strong className="text-amber-300 font-cinzel">Tip from {activePrefect.name}:</strong> “Remember that Professor McGonagall awards points for proactive revision, while Snape looks for any excuse to deduct from Gryffindor. Choose your moments wisely!”
                </div>
              </div>

              {/* Notable Contributors Leaderboard */}
              <div className="bg-black/50 border border-[#3d271d] rounded-xl p-5 space-y-4">
                <h3 className="font-cinzel text-base font-bold text-[#f5ebd7] flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Top {activeHouse} Contributors</span>
                </h3>

                <div className="space-y-3">
                  {[
                    { name: 'Hermione Granger', year: '3rd Year', points: 115, role: 'Academic Champion' },
                    { name: `${character.name} (You)`, year: `Year ${character.year || 3}`, points: character.housePoints || 85, role: 'Adventurer' },
                    { name: activeHouse === 'Gryffindor' ? 'Harry Potter' : activeHouse === 'Slytherin' ? 'Draco Malfoy' : activeHouse === 'Ravenclaw' ? 'Penelope Clearwater' : 'Cedric Diggory', year: 'Term 1993', points: 75, role: 'Quidditch / House Champion' },
                    { name: activeHouse === 'Gryffindor' ? 'Oliver Wood' : activeHouse === 'Slytherin' ? 'Gemma Farley' : activeHouse === 'Ravenclaw' ? 'Robert Hilliard' : 'Gabriel Truman', year: 'Senior Year', points: 60, role: 'Prefect Leadership' },
                  ].map((student, idx) => (
                    <div
                      key={student.name}
                      className={`flex items-center justify-between p-2.5 rounded-lg border ${
                        student.name.includes('(You)')
                          ? 'border-amber-600/70 bg-amber-950/30'
                          : 'border-[#2d1e16] bg-[#140b07]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-cinzel font-bold text-xs text-amber-400/80 w-4">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-cinzel text-xs font-bold text-[#f0e3ce]">{student.name}</p>
                          <p className="text-[10px] text-[#8c7b68]">{student.role} · {student.year}</p>
                        </div>
                      </div>
                      <span className="font-cinzel font-bold text-xs text-amber-300">
                        +{student.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PREFECT'S CORNER */}
        {/* ========================================================================= */}
        {activeTab === 'prefect' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prefect Bio & Dossier */}
            <div className="lg:col-span-1 bg-black/60 border border-[#3d271d] rounded-xl p-5 space-y-4">
              <div className="text-center pb-4 border-b border-[#2d1e16] space-y-2">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-b from-[#2d190e] to-black border-2 border-amber-600/60 flex items-center justify-center text-4xl shadow-lg">
                  {activePrefect.avatar}
                </div>
                <h3 className="font-cinzel text-lg font-bold text-[#f5ebd7]">{activePrefect.name}</h3>
                <p className="text-xs text-amber-400 font-cinzel">{activePrefect.title}</p>
                <p className="text-[11px] text-[#8c7b68]">{activePrefect.year} · {activeHouse} House</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-cinzel text-[#8c7b68] tracking-wider block">Official Badge</span>
                  <p className="text-[#d8c8b2] mt-0.5">{activePrefect.badge}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-cinzel text-[#8c7b68] tracking-wider block">Guiding Philosophy</span>
                  <p className="italic text-[#c4b5a0] mt-0.5">{activePrefect.quote}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-cinzel text-[#8c7b68] tracking-wider block">Specialties & Castle Knowledge</span>
                  <p className="text-[#d8c8b2] mt-0.5">{activePrefect.specialty}</p>
                </div>
              </div>

              {/* Quick Inquiry Prompts */}
              <div className="pt-4 border-t border-[#2d1e16] space-y-2">
                <span className="text-[10px] uppercase font-cinzel text-[#8c7b68] tracking-wider block">
                  Quick Inquiries
                </span>
                <div className="flex flex-col gap-1.5">
                  {[
                    'How can our house take the lead in points?',
                    'Any advice on avoiding Filch after curfew?',
                    'What do you know about Sirius Black?',
                    'What are the secrets of our Common Room?',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickQuestion(q)}
                      disabled={isPrefectThinking}
                      className="text-left text-xs text-[#c4b5a0] hover:text-amber-300 bg-[#160d08] hover:bg-[#28170e] p-2 rounded border border-[#2b1a11] transition-all flex items-center justify-between"
                    >
                      <span className="line-clamp-1">{q}</span>
                      <Send className="w-3 h-3 text-amber-500/60 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Prefect Live Dialogue Thread */}
            <div className="lg:col-span-2 bg-black/60 border border-[#3d271d] rounded-xl flex flex-col h-[540px] shadow-xl overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 bg-[#140b07] border-b border-[#2d1e16] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-lg">
                    {activePrefect.avatar}
                  </div>
                  <div>
                    <h4 className="font-cinzel text-xs font-bold text-[#f5ebd7]">{activePrefect.name}</h4>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>On duty in the Common Room</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-cinzel text-[#8c7b68]">Prefect Consultation</span>
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-amber-900/40">
                {(prefectChats[activeHouse] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'player' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                        msg.sender === 'player'
                          ? 'bg-[#2b180d] text-[#faead0] border border-amber-600/50'
                          : 'bg-[#180e08] text-[#dfd0bd] border border-[#3b2518]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] text-[#8c7b68] mb-1 font-cinzel">
                        <span>{msg.sender === 'player' ? character.name : activePrefect.name}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {msg.houseAdvice && (
                        <div className="mt-2 pt-2 border-t border-[#3b2518] text-[11px] text-amber-300/90 italic flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>Prefect Guidance: {msg.houseAdvice}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isPrefectThinking && (
                  <div className="flex items-center gap-2 text-xs text-[#8c7b68] italic p-2 bg-[#140b07] rounded-lg border border-[#2b1a11] w-fit">
                    <Feather className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>{activePrefect.name} is formulating a response...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendPrefectMessage} className="p-3 bg-[#140b07] border-t border-[#2d1e16] flex items-center gap-2">
                <input
                  type="text"
                  value={prefectInput}
                  onChange={(e) => setPrefectInput(e.target.value)}
                  placeholder={`Consult ${activePrefect.name.split(' ')[0]} regarding house duties, curfew, or spells...`}
                  className="flex-1 bg-[#0d0705] border border-[#3b2518] focus:border-amber-500 rounded px-3 py-2 text-xs text-[#f5ebd7] placeholder-[#6b5d4f] outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!prefectInput.trim() || isPrefectThinking}
                  className="px-4 py-2 rounded bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 disabled:opacity-50 text-white text-xs font-cinzel font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Inquire</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PRIVATE HOUSE NOTICE BOARD */}
        {/* ========================================================================= */}
        {activeTab === 'notice_board' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="bg-black/60 border border-[#3d271d] rounded-xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-cinzel text-2xl font-bold text-[#f5ebd7] flex items-center gap-2">
                  <Pin className="w-5 h-5 text-amber-400" />
                  <span>The {activeHouse} Notice Board</span>
                </h2>
                <p className="text-xs text-[#a89680]">
                  Private parchment notices pinned by {activeHouse} students and prefects.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:w-60">
                  <Search className="w-3.5 h-3.5 text-[#8c7b68] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={noticeSearch}
                    onChange={(e) => setNoticeSearch(e.target.value)}
                    placeholder="Search notices..."
                    className="w-full bg-[#120a07] border border-[#3b2518] focus:border-amber-500 rounded pl-8 pr-3 py-1.5 text-xs text-[#f5ebd7] placeholder-[#6b5d4f] outline-none"
                  />
                </div>

                {/* Pin Notice Button */}
                <button
                  onClick={() => {
                    soundEngine.playParchmentRustle();
                    setIsPinModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white font-cinzel text-xs font-semibold shadow hover:shadow-amber-700/30 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Pin New Notice</span>
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All Notices' },
                { id: 'Academics', label: '📜 Academics & Study' },
                { id: 'Quidditch & Duels', label: '🧹 Quidditch & Duels' },
                { id: 'Rumors & Curfew', label: '🗝️ Passwords & Curfew' },
                { id: 'Lost & Found', label: '🏷️ Lost & Found' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setNoticeCategory(cat.id)}
                  className={`px-3 py-1.5 rounded font-cinzel whitespace-nowrap transition-all ${
                    noticeCategory === cat.id
                      ? 'bg-amber-900/50 text-amber-200 border border-amber-600/60 font-semibold'
                      : 'text-[#9c8b78] hover:text-[#f0e3ce] hover:bg-black/30 border border-transparent'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Corkboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  className={`relative rounded-xl p-5 border flex flex-col justify-between shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${
                    notice.isPlayerPost
                      ? 'bg-[#21140d]/90 border-amber-500/80 shadow-[0_0_15px_rgba(217,119,6,0.15)]'
                      : 'bg-[#180e08]/90 border-[#3d271d]'
                  }`}
                >
                  {/* Pin Graphic */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-800 to-amber-500 border border-amber-300 shadow flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/60" />
                  </div>

                  <div className="space-y-3 pt-1">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#2d1e16] pb-2">
                      <span className="text-[10px] uppercase font-cinzel text-amber-400 font-semibold tracking-wider">
                        {notice.category}
                      </span>
                      <span className="text-[10px] text-[#8c7b68]">{notice.timestamp}</span>
                    </div>

                    {/* Title */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-cinzel text-base font-bold text-[#f5ebd7] leading-snug">
                        {notice.title}
                      </h4>
                      {notice.urgent && (
                        <span className="shrink-0 text-[10px] uppercase tracking-wider text-rose-300 font-sans font-bold border border-rose-800/60 bg-rose-950/40 px-1.5 py-0.5 rounded">
                          Urgent
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-xs text-[#d8c8b2] leading-relaxed whitespace-pre-wrap font-serif">
                      “{notice.content}”
                    </p>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-4 mt-4 border-t border-[#2d1e16] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-cinzel text-[11px] font-bold text-[#f0e3ce]">{notice.author}</p>
                      <p className="text-[10px] text-[#8c7b68]">{notice.yearGroup}</p>
                    </div>

                    <button
                      onClick={() => handleSignNotice(notice.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-cinzel transition-all ${
                        notice.hasSigned
                          ? 'bg-amber-600/30 text-amber-300 border border-amber-500/60'
                          : 'bg-[#24150c] hover:bg-[#382113] text-[#c4b5a0] border border-[#3b2518]'
                      }`}
                    >
                      <Check className={`w-3 h-3 ${notice.hasSigned ? 'text-amber-400' : 'text-[#8c7b68]'}`} />
                      <span>{notice.hasSigned ? 'Endorsed' : 'Endorse / Sign'}</span>
                      <span className="text-[10px] text-amber-400/90 font-sans font-bold ml-0.5">
                        ({notice.signedCount || 0})
                      </span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredNotices.length === 0 && (
                <div className="col-span-full py-12 text-center text-[#8c7b68] space-y-2">
                  <Scroll className="w-8 h-8 mx-auto text-[#543b2b]" />
                  <p className="font-cinzel text-sm">No notices found in this section.</p>
                  <p className="text-xs">Be the first to post a study session, rumor, or lost item on the board.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PIN NEW NOTICE MODAL */}
      {/* ========================================================================= */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#180e08] border border-amber-700/60 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-[#e4d6c0]">
            <div className="flex items-center justify-between border-b border-[#2d1e16] pb-3">
              <div className="flex items-center gap-2">
                <Pin className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel text-lg font-bold text-[#f5ebd7]">
                  Pin Notice to {activeHouse} Board
                </h3>
              </div>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="text-[#8c7b68] hover:text-[#f0e4d0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePinNewNotice} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-cinzel text-[#8c7b68] tracking-wider mb-1">
                  Notice Heading
                </label>
                <input
                  type="text"
                  required
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  placeholder="e.g., Ancient Runes Study Circle / Lost Sneakoscope"
                  className="w-full bg-[#0d0705] border border-[#3b2518] focus:border-amber-500 rounded px-3 py-2 text-xs text-[#f5ebd7] placeholder-[#6b5d4f] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-cinzel text-[#8c7b68] tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newNoticeCategory}
                    onChange={(e: any) => setNewNoticeCategory(e.target.value)}
                    className="w-full bg-[#0d0705] border border-[#3b2518] focus:border-amber-500 rounded px-3 py-2 text-xs text-[#f5ebd7] outline-none"
                  >
                    <option value="Academics">📜 Academics & Study</option>
                    <option value="Quidditch & Duels">🧹 Quidditch & Duels</option>
                    <option value="Rumors & Curfew">🗝️ Rumors & Curfew</option>
                    <option value="Lost & Found">🏷️ Lost & Found</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-cinzel text-[#8c7b68] tracking-wider mb-1">
                    Signatory Alias
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${character.name} (Year ${character.year || 3})`}
                    className="w-full bg-[#120a07] border border-[#2b1b13] rounded px-3 py-2 text-xs text-[#a89680] cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-cinzel text-[#8c7b68] tracking-wider mb-1">
                  Parchment Inscription
                </label>
                <textarea
                  required
                  rows={4}
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  placeholder="Write your notice clearly. Fellow housemates will be able to read and sign in endorsement..."
                  className="w-full bg-[#0d0705] border border-[#3b2518] focus:border-amber-500 rounded p-3 text-xs text-[#f5ebd7] placeholder-[#6b5d4f] outline-none resize-none font-serif"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgentNotice"
                  checked={newNoticeUrgent}
                  onChange={(e) => setNewNoticeUrgent(e.target.checked)}
                  className="rounded bg-[#0d0705] border-[#3b2518] text-amber-600 focus:ring-0"
                />
                <label htmlFor="urgentNotice" className="text-xs text-[#c4b5a0] cursor-pointer">
                  Mark as High Priority / Urgent Notice
                </label>
              </div>

              <div className="pt-3 border-t border-[#2d1e16] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-cinzel text-[#8c7b68] hover:text-[#e4d6c0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white font-cinzel text-xs font-semibold shadow hover:shadow-amber-700/30 transition-all"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>Pin Notice to Corkboard</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
