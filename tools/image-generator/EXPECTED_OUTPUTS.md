# Expected Character Image Filenames

This list contains the expected slugified folder structure for the character images.

**Output Directory**: `apps/web/public/characters/`
**Primary Image**: `[slug]/1.png`

| Character Name | Folder Path | Primary Image |
| :--- | :--- | :--- |
| Santy Claus (OG) | `santy-claus-og/` | `santy-claus-og/1.png` |
| Smelly Mall Santa | `smelly-mall-santa/` | `smelly-mall-santa/1.png` |
| Rudolph (before the other reindeer came around) | `rudolph-before-the-other-reindeer-came-around/` | `.../1.png` |
| Boring Flightless Reindeer | `boring-flightless-reindeer/` | `.../1.png` |
| The Grinch (early movie) | `the-grinch-early-movie/` | `.../1.png` |
| The Grinch (late movie) | `the-grinch-late-movie/` | `.../1.png` |
| Krampus | `krampus/` | `krampus/1.png` |
| Frosty the Snowman | `frosty-the-snowman/` | `.../1.png` |
| Charlie Brown | `charlie-brown/` | `charlie-brown/1.png` |
| Polar Bear (laid of by Coke) | `polar-bear-laid-of-by-coke/` | `.../1.png` |
| Orphan From a Christmas Movie | `orphan-from-a-christmas-movie/` | `.../1.png` |
| Blow-Up Inflatable Santa | `blow-up-inflatable-santa/` | `.../1.png` |
| Over-Served Uncle (melancholic) | `over-served-uncle-melancholic/` | `.../1.png` |
| Over-Served Uncle (boisterous) | `over-served-uncle-boisterous/` | `.../1.png` |
| Baby Jesus | `baby-jesus/` | `baby-jesus/1.png` |
| Jesus Dressed as Santa | `jesus-dressed-as-santa/` | `.../1.png` |
| Elf Union Organizer | `elf-union-organizer/` | `.../1.png` |
| Xmas Tree on the Roof of the Car | `xmas-tree-on-the-roof-of-the-car/` | `.../1.png` |
| Adult Caroler | `adult-caroler/` | `.../1.png` |
| Even Tinier Tim | `even-tinier-tim/` | `.../1.png` |
| (not so) Tiny Tim (took HGH and hit the gym) | `not-so-tiny-tim-took-hgh-and-hit-the-gym/` | `.../1.png` |
| The Rat Under Santa's Hat Controlling Santa | `the-rat-under-santas-hat-controlling-santa/` | `.../1.png` |
| The Christmas Roast | `the-christmas-roast/` | `.../1.png` |
| Max The Grinch's Dog | `max-the-grinchs-dog/` | `.../1.png` |
| A Who from Whoville (non-speaking part) | `a-who-from-whoville-non-speaking-part/` | `.../1.png` |
| The Ghost of a Chimney Sweep | `the-ghost-of-a-chimney-sweep/` | `.../1.png` |
| A Christmas Cow ('mooo') | `a-christmas-cow-mooo/` | `.../1.png` |
| Surfing Santy Claws | `surfing-santy-claws/` | `.../1.png` |
| Santy Claws (crab Santa) | `santy-claus-crab-santa/` | `.../1.png` |
| Santy Paws (dog Santa) | `santy-paws-dog-santa/` | `.../1.png` |
| Santy Jaws (shark Santa) | `santy-jaws-shark-santa/` | `.../1.png` |
| Skanky Claus (freaky-deeky Santa) | `skanky-claus-freaky-deeky-santa/` | `.../1.png` |
| Banky Claus (rich business Santa) | `banky-claus-rich-business-santa/` | `.../1.png` |
| Kevin McCallister (from home alone) | `kevin-mccallister-from-home-alone/` | `.../1.png` |
| Buzz McCallister (from home alone) | `buzz-mccallister-from-home-alone/` | `.../1.png` |
| the Bad Mother from home alone | `the-bad-mother-from-home-alone/` | `.../1.png` |
| runaway polar express | `runaway-polar-express/` | `.../1.png` |

## Multiple Images
To add variations, simply add `2.png`, `3.png`, etc., to the respective folder.

## Derived Sizes
If running with `--derived`, the files are saved directly in the character folder:
- `[slug]/512.png`
- `[slug]/256.png`

# Question Images

The tool now supports generating images for each question. These are displayed alongside the questions during the quiz.

**Output Directory**: `apps/web/public/questions/`
**Primary Image**: `[questionId]/1.png` (e.g., `q1/1.png`)

To generate these, run the tool with the `--mode=questions` flag:

```bash
pnpm image:gen -- --anchor [path] --mode=questions
```

| Question ID | Folder Path | Primary Image |
| :--- | :--- | :--- |
| q1 | `q1/` | `q1/1.png` |
| q2 | `q2/` | `q2/1.png` |
| q3 | `q3/` | `q3/1.png` |
| ... | ... | ... |
| q24 | `q24/` | `q24/1.png` |

## Multiple Images
Just like characters, you can add `2.png`, `3.png`, etc., to the respective question folder to support future variation picking.