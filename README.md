

# NESJS

I'm building this library to learn a bit more about NES roms and hacking and to build some cool tools for messing around with ROMs and maybe programming some games.

## Parsing Roms

Parsing a ROM is pretty simple, it will provide you with a list of the PRG section disassembled, the CHR section and an array of the parsed sprites (64 character strings of [0-3])
as well as the optional title block and information found in the header. To parse a rom:

```javascript
import Parser from "./src/parser";

Parser.parseFile("./roms/mario.nes").then((data) => {
	console.log(data);	
}).catch((err) => {
	console.log("ERR",err);
});
```

You should get something like the following:

```
{ hdr: <Buffer 4e 45 53 1a 02 01 01 00 00 00 00 00 00 00 00 00>,
  prg: 
   { bankCount: 2,
     num: 32768,
     buffer: <Buffer 78 d8 a9 10 8d 00 20 a2 ff 9a ad 02 20 10 fb ad 02 20 10 fb a0 fe a2 05 bd d7 07 c9 0a b0 0c ca 10 f6 ad ff 07 c9 a5 d0 02 a0 d6 20 cc 90 8d 11 40 8d ... >,
     instructions: 
      [   { operation: 'SEI', raw: <Buffer 78> },
		  { operation: 'CLD', raw: <Buffer d8> },
		  { operation: 'LDA', raw: <Buffer a9 10> },
		  { operation: 'STA', raw: <Buffer 8d 00 20> },
		  ...
      ]
    },
  chr:
  	{ bankCount: 1,
  	    num: 8192,
  	    buffer: <Buffer 03 0f 1f 1f 1c 24 26 66 00 00 00 00 1f 3f 3f 7f e0 c0 80 fc 80 c0 00 20 00 20 60 00 f0 fc fe fe 60 70 18 07 0f 1f 3f 7f 7f 7f 1f 07 00 1e 3f 7f fc 7c ... >,
  	    sprites: 
  	     [ '0000001100001111000111110001111100033322003223220032233203322332', .... ]
  	}
  title: null
}
```

## Working with Sprites

There are a few tools for working with sprites extracted from the ROMs, hopefully soon this list will grow with more useful tools.

### Convert a 16-byte buffer to a 64-character string

These 64 character strings represent the color index for each pixel of an 8x8px sprite. Theres plenty of information on the web for how these 16-byte buffers should be structured.
In the parse function, this is called and all of the strings are returned to you anyway so in reality this is probably not too useful yet...

```javascript
import Sprites from "./src/sprites";
console.log(Sprites.bufferToSprite(Buffer.from([
	0x03, 0x0f, 0x1f, 0x1f, 0x1c, 0x24, 0x26, 0x66, 
	0x00, 0x00, 0x00, 0x00, 0x1f, 0x3f, 0x3f, 0x7f]))
// output should be 
// 		"0000001100001111000111110001111100033322003223220032233203322332"
```

### Output a sprite to a PNG file

Once you have the 64-byte sprite string you can output it to a PNG file by providing a color mapping. 
The color mapping is simply a 4x4 array containing the following:

```
[
	[ color0_R, color0_G, color0_B, color0_A ],
	[ color1_R, color1_G, color1_B, color1_A ],
	[ color2_R, color2_G, color2_B, color2_A ],
	[ color3_R, color3_G, color3_B, color3_A ],
]
```

for example

```
[ 
	[0x5C, 0x94, 0xFC, 0xFF], 
	[0xFF, 0xFF, 0xFF, 0xFF], 
	[0xFC, 0xD8, 0xA8, 0xFF], 
	[0xD7, 0x27, 0x00, 0xFF]
]
```

To create a PNG from a sprite:

```javascript
import Sprites from "./src/sprites";

Sprites.spriteToPNG(
	"0000001100001111000111110001111100033322003223220032233203322332",
	[ 
		[0x5C, 0x94, 0xFC, 0xFF], 
		[0xFF, 0xFF, 0xFF, 0xFF], 
		[0xFC, 0xD8, 0xA8, 0xFF], 
		[0xD7, 0x27, 0x00, 0xFF]
	],
	"./output/sprite.png"
);
```

### Output multiple sprites into a spritesheet PNG

You can also pass in an array of sprites and output them into a single PNG file using `buildSpriteSheet(spriteArray, colorMap, destination, spritesPerRow = 10))`.

```
import Parser from "./src/parser";

// Print all of the sprites in this ROM 64 sprites to a line
Parser.parseFile("./roms/mario.nes").then((data) => {
	Sprites.buildSpriteSheet(
		data.chr.sprites, 
		[ 
			[0x5C, 0x94, 0xFC, 0xFF], 
			[0xFF, 0xFF, 0xFF, 0xFF], 
			[0xFC, 0xD8, 0xA8, 0xFF], 
			[0xD7, 0x27, 0x00, 0xFF]
		], 
		"./output/" + i + ".png", 
		64
	);
}).catch((err) => {
	console.log("ERR",err);
});
```


### Convert a sprite string back to its 8-byte CHR representation

If you have a sprite string but want the 8-byte CHR representation just pass it into `spriteToBytes`:

```javascript

import Sprites from "./src/sprites";

console.log(Sprites.spriteToBytes("0000001100001111000111110001111100033322003223220032233203322332"));;
// Output should be:
// 		<Buffer 03 0f 1f 1f 1c 24 26 66 00 00 00 00 1f 3f 3f 7f>

```

## Generating a ROM from a modified ROM Parse

Once you parse the rom, you can modify the CHR and title sections and re-ouput the file as a valid NES ROM using `Generator.exportRom(romData, destination)`.
Currently, since i lack the experience and knowledge of 6502 ASM it does not re-compile the informations in the `prg.instructions` array.

### Modifying Sprites in CHR

You can modify the array of 64-character sprite strings found in the `chr.sprites` array in the parse results. 
You can add or remove them and the CHR bank count in the header will automatically be updated when this function is called.

### Adding/Removing/Modifying the TITLE section

NES ROMs have an optional 128-byte section at the end of the file for storing a title, sort of like metadata in ID3 tags. 
So if you change or set the `title` property on the ROM data before passing to this function, you will get that block added to the end of the ROM file.

### Outputting the ROM

```javascript
/**
 * Parse a rom, modify it and write out a new one.
 **/
import Parser from "./src/parser";
import Generator from "./src/generator";

// parse the old, boring rom
Parser.parseFile("./roms/mario.nes").then((data) => {
	
	// add a title section
	data.title = 'Super Headless Mario';

	// Remove some of big marios head!
	data.chr.sprites[0] = "0000000000000000000000000000000000000000000000000000000000000000";
	data.chr.sprites[1] = "0000000000000000000000000000000000000000000000000000000000000000";
	data.chr.sprites[8] = "0000000000000000000000000000000000000000000000000000000000000000";
	data.chr.sprites[9] = "0000000000000000000000000000000000000000000000000000000000000000";
	data.chr.sprites[10] = "0000000000000000000000000000000000000000000000000000000000000000";
	data.chr.sprites[11] = "0000000000000000000000000000000000000000000000000000000000000000";
	data.chr.sprites[16] = "0000000000000000000000000000000000000000000000000000000000000000";
	data.chr.sprites[17] = "0000000000000000000000000000000000000000000000000000000000000000";

	// export the rom
	Generator.exportRom(data, "./output/mario.nes").catch(err => { console.log("ERROR", err); });

}).catch((err) => {
	console.log("ERR",err);
});
```

