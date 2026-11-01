import React, { useState } from 'react';
import { soundEngine } from '../utils/audio';
import { BookOpen, User, Sparkles, Search } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  role: string;
  house?: string;
  year?: string;
  avatar: string;
  bio: string;
  yearThreeSignificance: string;
  wandOrSkill: string;
  quote: string;
}

const profilesList: Profile[] = [
  {
    id: 'lupin',
    name: 'Remus John Lupin',
    role: 'Defense Against the Dark Arts Professor',
    house: 'Gryffindor Alumnus',
    avatar: '🐺',
    bio: 'One of the original creators of the Marauder’s Map (Moony). Afflicted with lycanthropy since childhood, taught at Hogwarts with gentle patience and extraordinary skill.',
    yearThreeSignificance: 'Teaches Harry the Patronus Charm, helps Rowan with Boggarts, and drinks Snape’s Wolfsbane potion each lunar month.',
    wandOrSkill: 'Cypress with Unicorn hair, 10¼ inches · Master of Defense',
    quote: '“It is the quality of one’s convictions that determines success, not the number of followers.”',
  },
  {
    id: 'sirius',
    name: 'Sirius Black (Padfoot)',
    role: 'The Azkaban Escapee & Marauder',
    house: 'Gryffindor Alumnus',
    avatar: '🐕',
    bio: 'Harry’s godfather, falsely framed for the betrayal of James and Lily Potter and the murder of twelve Muggles and Peter Pettigrew. Escaped Azkaban in dog animagus form.',
    yearThreeSignificance: 'Spends Year 3 hunting Peter Pettigrew inside Hogwarts to protect Harry.',
    wandOrSkill: 'Animagus: Giant Black Dog (Padfoot)',
    quote: '“I did my waiting! Twelve years of it! In Azkaban!”',
  },
  {
    id: 'pettigrew',
    name: 'Peter Pettigrew (Wormtail)',
    role: 'The Traitor in Hiding',
    house: 'Gryffindor Alumnus',
    avatar: '🐀',
    bio: 'The fourth Marauder who betrayed the Potters to Voldemort, cut off his own index finger, and transformed into a rat to frame Sirius Black for twelve years.',
    yearThreeSignificance: 'Posing as Ron Weasley’s ancient pet rat Scabbers, missing a toe, hiding from Crookshanks.',
    wandOrSkill: 'Animagus: Common Garden Rat (Wormtail)',
    quote: '“He was bigger than me! What was there to be gained by fighting him?!”',
  },
  {
    id: 'snape',
    name: 'Severus Snape',
    role: 'Potions Master & Slytherin Head',
    house: 'Slytherin',
    avatar: '🧪',
    bio: 'Master of potions and former Death Eater turned double agent. Deeply bitter toward James Potter and Sirius Black, tasked with brewing Wolfsbane for Lupin.',
    yearThreeSignificance: 'Confronts Sirius in the Shrieking Shack and docks points relentlessly from Gryffindors.',
    wandOrSkill: 'Master of Occlumency and potion compounding',
    quote: '“I can teach you how to bottle fame, brew glory, even stopper death...”',
  },
  {
    id: 'mcgonagall',
    name: 'Minerva McGonagall',
    role: 'Deputy Headmistress & Transfiguration',
    house: 'Gryffindor Head',
    avatar: '🐈',
    bio: 'Stern, fiercely loyal, impeccable teacher of Transfiguration. Secured Ministry approval for Hermione Granger’s Time-Turner.',
    yearThreeSignificance: 'Oversees castle defenses after the Fat Lady portrait is slashed.',
    wandOrSkill: 'Fir and Dragon Heartstring, 9½ inches · Cat Animagus',
    quote: '“Potter, I will help you become an Auror if it is the last thing I do.”',
  },
  {
    id: 'dumbledore',
    name: 'Albus Percival Wulfric Brian Dumbledore',
    role: 'Headmaster of Hogwarts',
    house: 'Gryffindor Alumnus',
    avatar: '✨',
    bio: 'The greatest wizard of modern times. Refuses to allow Dementors inside the castle gates.',
    yearThreeSignificance: 'Gives the crucial Time-Turner hint to Hermione: “Three turns should do it.”',
    wandOrSkill: 'The Elder Wand (Deathstick)',
    quote: '“Happiness can be found, even in the darkest of times, if one only remembers to turn on the light.”',
  },
  {
    id: 'hagrid',
    name: 'Rubeus Hagrid',
    role: 'Care of Magical Creatures Professor',
    house: 'Gryffindor Alumnus',
    avatar: '🪓',
    bio: 'Keeper of Keys and Grounds, promoted to teacher in Year 3. Introduced the class to Buckbeak the Hippogriff.',
    yearThreeSignificance: 'Heartbroken over Malfoy’s incident and the Ministry execution order for Buckbeak.',
    wandOrSkill: 'Oak pieces concealed inside his pink umbrella',
    quote: '“What’s comin’ will come, an’ we’ll meet it when it does.”',
  },
  {
    id: 'harry',
    name: 'Harry James Potter',
    role: 'Gryffindor Seeker & Third-Year',
    house: 'Gryffindor',
    year: 'Year 3',
    avatar: '⚡',
    bio: 'The Boy Who Lived. Deeply affected by Dementors due to childhood horrors, learns the Patronus Charm from Lupin.',
    yearThreeSignificance: 'Receives the Marauder’s Map from Fred and George, flies the Firebolt broomstick.',
    wandOrSkill: 'Holly and Phoenix Feather, 11 inches',
    quote: '“I didn’t choose any of this. But I’m not running from it either.”',
  },
  {
    id: 'hermione',
    name: 'Hermione Jean Granger',
    role: 'Top Academic Student',
    house: 'Gryffindor',
    year: 'Year 3',
    avatar: '📚',
    bio: 'Brilliant Muggle-born witch taking an impossible double schedule using an hourglass Time-Turner.',
    yearThreeSignificance: 'Adopts Crookshanks the half-kneazle cat, uncovers Lupin’s lycanthropy essay, saves Sirius.',
    wandOrSkill: 'Vine wood with Dragon Heartstring, 10¾ inches',
    quote: '“Honestly, don’t you two read?”',
  },
  {
    id: 'ron',
    name: 'Ronald Bilius Weasley',
    role: 'Gryffindor Third-Year',
    house: 'Gryffindor',
    year: 'Year 3',
    avatar: '♟️',
    bio: 'Harry’s loyal companion, passionate about chess and Quidditch, fiercely protective of his rat Scabbers.',
    yearThreeSignificance: 'Dragged under the Whomping Willow by the black dog, breaking his leg.',
    wandOrSkill: 'Willow and Unicorn hair, 14 inches',
    quote: '“Why couldn’t it be follow the butterflies?!”',
  },
  {
    id: 'draco',
    name: 'Draco Malfoy',
    role: 'Slytherin Seeker',
    house: 'Slytherin',
    year: 'Year 3',
    avatar: '🐍',
    bio: 'Heir to Malfoy Manor, spoiled and arrogant. Provokes Buckbeak and stages fake Dementor pranks.',
    yearThreeSignificance: 'Punches from Hermione in the clock tower courtyard.',
    wandOrSkill: 'Hawthorn and Unicorn hair, 10 inches',
    quote: '“My father will hear about this!”',
  },
  {
    id: 'neville',
    name: 'Neville Longbottom',
    role: 'Gryffindor Herbologist',
    house: 'Gryffindor',
    year: 'Year 3',
    avatar: '🌱',
    bio: 'Shy and forgetful boy who turns Snape’s boggart into his grandmother’s vulture-hat attire.',
    yearThreeSignificance: 'Loses the list of passwords to Gryffindor Tower, allowing Sirius Black in.',
    wandOrSkill: 'Cherry and Unicorn hair',
    quote: '“Riddikulus!”',
  },
  {
    id: 'luna',
    name: 'Luna Lovegood',
    role: 'Ravenclaw Second-Year',
    house: 'Ravenclaw',
    year: 'Year 2',
    avatar: '🌙',
    bio: 'Dreamy and eccentric Ravenclaw who sees through conventional illusions.',
    yearThreeSignificance: 'Spotted in the library and courtyard discussing Nargles and Thestrals.',
    wandOrSkill: 'Unconventional perception of magical realities',
    quote: '“You’re just as sane as I am.”',
  },
  {
    id: 'fred_george',
    name: 'Fred & George Weasley',
    role: 'Gryffindor Fifth-Years & Beaters',
    house: 'Gryffindor',
    year: 'Year 5',
    avatar: '🗺️',
    bio: 'Master pranksters who stole the Marauder’s Map from Filch’s filing cabinet in Year 1.',
    yearThreeSignificance: 'Give the Marauder’s Map to Harry and Rowan so they can visit Hogsmeade.',
    wandOrSkill: 'Creation of Skiving Snackboxes and Secret Passage mastery',
    quote: '“I solemnly swear that I am up to no good.”',
  },
  {
    id: 'cedric',
    name: 'Cedric Diggory',
    role: 'Hufflepuff Captain & Seeker',
    house: 'Hufflepuff',
    year: 'Year 5',
    avatar: '🏆',
    bio: 'Extremely noble, honorable flier who catches the Snitch during the tempest.',
    yearThreeSignificance: 'Offers a rematch to Gryffindor after Dementors cause Harry to fall.',
    wandOrSkill: 'Ash and Unicorn hair, 12¼ inches',
    quote: '“We play hard, but we play fair.”',
  },
  {
    id: 'trelawney',
    name: 'Sybill Patricia Trelawney',
    role: 'Divination Professor',
    house: 'Ravenclaw Alumna',
    avatar: '🔮',
    bio: 'Great-great-granddaughter of the celebrated Seer Cassandra Trelawney.',
    yearThreeSignificance: 'Predicts the Grim in Harry’s cup and delivers the Second Prophecy in June.',
    wandOrSkill: 'Hazel and Unicorn Hair, 9½ inches',
    quote: '“The Dark Lord lies alone and friendless... his servant will rejoin him!”',
  },
  {
    id: 'flitwick',
    name: 'Filius Flitwick',
    role: 'Charms Professor & Ravenclaw Head',
    house: 'Ravenclaw Head',
    avatar: '✨',
    bio: 'Former dueling champion, excitable teacher of Cheering Charms and Glisseo.',
    yearThreeSignificance: 'Tests Harry’s Firebolt broomstick for dark hexes with McGonagall.',
    wandOrSkill: 'Master Dueling Champion',
    quote: '“Swish and flick, remember, swish and flick!”',
  },
  {
    id: 'sprout',
    name: 'Pomona Sprout',
    role: 'Herbology Professor & Hufflepuff Head',
    house: 'Hufflepuff Head',
    avatar: '🌿',
    bio: 'Earth-stained robes and green thumbs, keeper of the Hogwarts Greenhouses.',
    yearThreeSignificance: 'Nurtures Mandrakes and Venomous Tentacula on the castle grounds.',
    wandOrSkill: 'Herbological and botanical sorcery',
    quote: '“Flitterbloom may look harmless, but give it respect!”',
  },
  {
    id: 'pansy',
    name: 'Pansy Parkinson',
    role: 'Slytherin Third-Year',
    house: 'Slytherin',
    year: 'Year 3',
    avatar: '🥀',
    bio: 'Slytherin student who taunts Hagrid and dotes on Draco Malfoy.',
    yearThreeSignificance: 'Rallies Slytherin students to mock Harry’s Dementor fainting.',
    wandOrSkill: 'Sharp wit and Slytherin social influence',
    quote: '“Did you see Potter? Fainted right dead away!”',
  },
  {
    id: 'patil_twins',
    name: 'Parvati & Padma Patil',
    role: 'Third-Year Classmates',
    house: 'Gryffindor & Ravenclaw',
    year: 'Year 3',
    avatar: '🪞',
    bio: 'Twin sisters sorted into different houses. Parvati adores Divination and Trelawney.',
    yearThreeSignificance: 'Parvati faces the Boggart, turning a blood-stained mummy into a jack-in-the-box.',
    wandOrSkill: 'Divination and Charms aptitude',
    quote: '“Professor Trelawney sees into the beyond!”',
  },
  {
    id: 'colin',
    name: 'Colin Creevey',
    role: 'Gryffindor Second-Year',
    house: 'Gryffindor',
    year: 'Year 2',
    avatar: '📸',
    bio: 'Enthusiastic Gryffindor with a magical camera, always snapping pictures of Harry.',
    yearThreeSignificance: 'Cheering wildly from the stands during Quidditch matches.',
    wandOrSkill: 'Magical Photography',
    quote: '“Can I get a photo with your Firebolt, Harry?!”',
  },
  {
    id: 'hannah_ernie',
    name: 'Hannah Abbott & Ernie Macmillan',
    role: 'Hufflepuff Third-Years',
    house: 'Hufflepuff',
    year: 'Year 3',
    avatar: '🦡',
    bio: 'Dedicated Hufflepuff classmates who cheer for Cedric and study Herbology.',
    yearThreeSignificance: 'Discussing the security wards and curfew restrictions in the courtyard.',
    wandOrSkill: 'Herbology and Defensive Shield charms',
    quote: '“Hufflepuff stands united with Hogwarts.”',
  },
];

export const CharacterProfilesView: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<Profile>(profilesList[0]);
  const [search, setSearch] = useState('');
  const [filterHouse, setFilterHouse] = useState<'All' | 'Gryffindor' | 'Slytherin' | 'Ravenclaw' | 'Hufflepuff' | 'Staff'>('All');

  const filtered = profilesList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase()) ||
      p.bio.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterHouse === 'All') return true;
    if (filterHouse === 'Staff') return p.role.includes('Professor') || p.role.includes('Head');
    return p.house?.includes(filterHouse);
  });

  const handleSelect = (p: Profile) => {
    soundEngine.playParchmentRustle();
    setSelectedProfile(p);
  };

  return (
    <div className="max-w-6xl mx-auto my-4 px-2 sm:px-4 space-y-6">
      {/* Header bar */}
      <div className="bg-[#14121a] border border-[#3b2e22] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="font-cinzel text-xl text-amber-200 font-bold tracking-wide flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Character Profiles & Lore Dossiers</span>
          </h2>
          <p className="text-xs text-[#a09080] font-garamond italic">
            The Living Cast of 1993 · Professors, Fellow Students, Fugitives & Creatures
          </p>
        </div>

        {/* Search & House Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8e8070]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dossiers..."
              className="pl-8 pr-3 py-1 bg-[#1b1722] border border-[#3b2e22] rounded text-xs text-amber-100 placeholder-[#7d6f60] focus:outline-none focus:border-amber-500 font-garamond"
            />
          </div>

          <select
            value={filterHouse}
            onChange={(e) => setFilterHouse(e.target.value as typeof filterHouse)}
            className="p-1.5 bg-[#1b1722] border border-[#3b2e22] rounded text-xs text-amber-200 font-cinzel"
          >
            <option value="All">All Characters</option>
            <option value="Staff">Professors & Staff</option>
            <option value="Gryffindor">Gryffindor</option>
            <option value="Slytherin">Slytherin</option>
            <option value="Ravenclaw">Ravenclaw</option>
            <option value="Hufflepuff">Hufflepuff</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile List */}
        <div className="md:col-span-5 space-y-2 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-900/40">
          {filtered.map((prof) => {
            const isSelected = selectedProfile.id === prof.id;
            return (
              <button
                key={prof.id}
                onClick={() => handleSelect(prof)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#291e14] border-amber-500/80 text-amber-200 shadow-md scale-[1.01]'
                    : 'bg-[#15131a] border-[#2e241b] text-[#c0b3a0] hover:border-amber-700/50 hover:bg-[#1d171d]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-full bg-[#201912] flex items-center justify-center text-xl border border-[#3d2e20]">
                    {prof.avatar}
                  </div>
                  <div className="truncate">
                    <div className="font-cinzel text-xs font-bold truncate text-amber-200">
                      {prof.name}
                    </div>
                    <div className="text-[11px] font-garamond italic text-[#8a7b6b] truncate">
                      {prof.role}
                    </div>
                  </div>
                </div>

                {prof.house && (
                  <span className="text-[10px] font-cinzel text-amber-400/80 px-2 py-0.5 bg-[#1f1915] rounded border border-[#3d2e20] flex-shrink-0">
                    {prof.house}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Dossier Detailed Card */}
        <div className="md:col-span-7 bg-[#14121a] border border-[#3b2e22] rounded-lg p-6 space-y-5 shadow-2xl">
          <div className="border-b border-[#2d231b] pb-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#251e18] flex items-center justify-center text-4xl border-2 border-amber-600/40 shadow-inner flex-shrink-0">
              {selectedProfile.avatar}
            </div>
            <div>
              <h3 className="font-cinzel text-2xl font-bold text-amber-200">
                {selectedProfile.name}
              </h3>
              <div className="text-xs text-[#a09080] font-garamond italic">
                {selectedProfile.role} {selectedProfile.house && `· ${selectedProfile.house}`}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs font-garamond text-[#d0c2af]">
            <div>
              <span className="font-cinzel text-amber-400 font-bold block mb-1">
                Background & Dossier:
              </span>
              <p className="leading-relaxed italic">{selectedProfile.bio}</p>
            </div>

            <div className="p-3 bg-[#1c1722] rounded border border-[#362b20]">
              <span className="font-cinzel text-amber-400 font-bold block mb-1">
                Role in the Prisoner of Azkaban (1993–1994):
              </span>
              <p className="italic text-[#c5b8a5]">{selectedProfile.yearThreeSignificance}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#191522] p-2.5 rounded border border-[#2f241c]">
                <span className="font-cinzel text-amber-400 font-semibold block mb-0.5">
                  Wand / Mastery:
                </span>
                <span className="italic text-[#a09080]">{selectedProfile.wandOrSkill}</span>
              </div>
              <div className="bg-[#191522] p-2.5 rounded border border-[#2f241c]">
                <span className="font-cinzel text-amber-400 font-semibold block mb-0.5">
                  Archival Quote:
                </span>
                <span className="italic text-[#a09080]">“{selectedProfile.quote}”</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
