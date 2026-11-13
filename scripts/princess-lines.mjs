// Prints every princess-game line as JSON: [{ key, text }, ...]
// Feed this list to the voice batch; save each clip as public/sounds/en/princess/<key>.mp3
import { Lines } from '../src/components/princess/princessLines.js';

console.log(JSON.stringify(Lines.all(), null, 2));
