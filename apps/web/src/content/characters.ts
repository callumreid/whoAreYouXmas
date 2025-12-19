export const CHARACTER_NAMES = [
  "Santy Claus (OG)",
  "Smelly Mall Santa",
  "Rudolph (before the other reindeer came around)",
  "Boring Flightless Reindeer",
  "The Grinch (early movie)",
  "The Grinch (late movie)",
  "Krampus",
  "Frosty the Snowman",
  "Charlie Brown",
  "Polar Bear (laid of by Coke)",
  "Orphan From a Christmas Movie",
  "Blow-Up Inflatable Santa",
  "Over-Served Uncle (melancholic)",
  "Over-Served Uncle (boisterous)",
  "Baby Jesus",
  "Jesus Dressed as Santa",
  "Elf Union Organizer",
  "Xmas Tree on the Roof of the Car",
  "Adult Caroler",
  "Even Tinier Tim",
  "(not so) Tiny Tim (took HGH and hit the gym)",
  "The Rat Under Santa's Hat Controlling Santa",
  "The Christmas Roast",
  "Max The Grinch's Dog",
  "A Who from Whoville (non-speaking part)",
  "The Ghost of a Chimney Sweep",
  "A Christmas Cow ('mooo')",
  "Surfing Santy Claws",
  "Santy Claws (crab Santa)",
  "Santy Paws (dog Santa)",
  "Santy Jaws (shark Santa)",
  "Skanky Claus (freaky-deeky Santa)",
  "Banky Claus (rich business Santa)",
  "Kevin McCallister (from home alone)",
  "Buzz McCallister (from home alone)",
  "the Bad Mother from home alone please do not change anything about the specifics of the list items no editing",
];

export const CHARACTERS = CHARACTER_NAMES;

export const CHARACTER_IMAGE_BASE_PATH = "/results";

// Images are resolved via slugified character names under /public/results.
const slugifyCharacterName = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const getCharacterImage = (name: string) =>
  `${CHARACTER_IMAGE_BASE_PATH}/${slugifyCharacterName(name)}.png`;
