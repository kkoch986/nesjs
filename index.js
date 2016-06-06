
import Parser from "./src/parser";
import Sprites from "./src/sprites";
import Constants from "./src/constants";


/**
 * Write the contents of the PRG buffer to a file
 * Useful for generating test cases for decompilation
 **/
function writePRGToFile() {
	const fs = require("fs");
	fs.open("../mario_prg.txt", "w+", (err,fd) => {
		if(err) throw err;
		fs.writeSync(fd, data.prg.buffer, 0, data.prg.buffer.length);
		fs.close(fd);
	});
}

/** 
 * Test it out
 **/
Parser.parseFile("./roms/mario.nes").then((data) => {
		
	// Sprites.spriteToPNG(data.chr.sprites[2], [ Constants.transparent, [0xFF, 0x00, 0x00, 0xFF], [0x00, 0xFF, 0x00, 0xFF], [0x00, 0x00, 0xFF, 0xFF] ], "testSprite.png");

	const pallets = {
		"greyScale": Constants.pallets.greyScale,
		"fireballMario": Constants.pallets.mario.fireballMario,
		"clouds": Constants.pallets.mario.clouds,
		"bushes": Constants.pallets.mario.bushes
	}
	for(let i in pallets) {
		Sprites.buildSpriteSheet(data.chr.sprites, pallets[i], "./output/" + i + ".png", 32);
	}

}).catch((err) => {
	console.log("ERR",err);
});