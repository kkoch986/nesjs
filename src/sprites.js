
import Constants from "./constants";
import Utils from "./utils";
import fs from 'fs';
import _PNG from "pngjs"
const PNG = _PNG.PNG;

// read all of the sprites
const bufferToSprite = (buffer) => {
	const channelA = buffer.slice(0, 8);
	const channelB = buffer.slice(8, 16);

	let output = "";
	for(let i = 0 ; i < 8 ; i++) {
		const testA = Utils.dec2bin(channelA[i]);
		const testB = Utils.dec2bin(channelB[i]);
		output += Utils.chrAdd(testA, testB);
	}

	return output;
}

/**
 * Given a 64 character string of sprite data, return a 16-byte buffer containing
 * the sprite as it should appear in the CHR banks of a ROM
 **/
const spriteToBytes = (spriteData) => {
	const buffer = Buffer.alloc(16);

	// read the sprite 8 characters at a time
	let bufferIndex = 0;
	for(let i = 0 ; i < spriteData.length ; i += 8) {
		const byte = spriteData.substring(i, i+8);
		
		// now break down the channel A and B values
		// if theres a 3 then thats a 1 in both channels
		// a 2 is a 1 in channel B and a 1 is a 1 in channel A
		let channelA = "";
		let channelB = "";

		for(let j = 0 ; j < byte.length ; j++) {
			if(byte[j] === "3") {
				channelA += "1";
				channelB += "1";
			} else if(byte[j] === "2") {
				channelA += "0";
				channelB += "1";
			} else if(byte[j] === "1") {
				channelA += "1";
				channelB += "0";
			} else {
				channelA += "0";
				channelB += "0";
			}
		}


		buffer[bufferIndex++] = parseInt(channelA, 2);
		buffer[bufferIndex+7] = parseInt(channelB, 2);
	}

	return buffer;
};

/**
 * Given a 64 character string of sprite data and a color map
 * write a PNG to the given destination with the real representation
 * of the given sprite
 **/
const spriteToPNG = (spriteData, colorMap, destination) => {
	const png = new PNG({
		height: 8,
		width: 8
    });

	for (let y = 0; y < png.height; y++) {
		for (let x = 0; x < png.width; x++) {
			let pos = (png.width * y + x) << 2;
			let i = pos / 4;
			png.data[pos] = colorMap[spriteData[i]][0];
			png.data[pos + 1] = colorMap[spriteData[i]][1];
			png.data[pos + 2] = colorMap[spriteData[i]][2];
			png.data[pos + 3] = colorMap[spriteData[i]][3];
		}
	}

    png.pack().pipe(fs.createWriteStream(destination));
};

/**
 * Output a single PNG which contains all of the given sprites in an 
 * array to the given destination using the given color map.
 **/
const buildSpriteSheet = (spriteArray, colorMap, destination, spritesPerRow = 10) => {
	const spriteArrayCopy = spriteArray.slice();

	// compute the number of rows we will need
	const numberOfRows = Math.ceil(spriteArrayCopy.length / spritesPerRow);

	// compute the total number of 8x8 cells so we make sure to blank out the remaining 
	// cells at the end of the file.
	const numberOfCells = numberOfRows * spritesPerRow;
	const blankCells = numberOfCells - spriteArrayCopy.length;

	// just to make things simpler, push on <blankCells> blank sprites at the end of the sprite data array
	for(let i = 0 ; i < blankCells ; i++) {
		spriteArrayCopy.push(Constants.blankSprite);
	}

	// create the PNG
	const png = new PNG({
		height: numberOfRows * 8,
		width: spritesPerRow * 8,
		inputHasAlpha: true,
        filterType: 4,
		data: finalData
    });

	// assemble all of the images
	const finalData = [];
	for (let y = 0; y < png.height; y++) {
		for (let x = 0; x < png.width; x++) {
			// try to figure out which image to pull from
			const xIndex = Math.floor(x / 8);
			const yIndex = Math.floor(y / 8);
			const flatIndex = (yIndex * spritesPerRow) + xIndex;
			const sourceX = x % 8;
			const sourceY = y % 8;
			const flatSource = (sourceY * 8) + sourceX;
			const sprite = spriteArrayCopy[flatIndex];
			const cell = sprite[flatSource];

			// set the colors on the png
			let pos = (png.width * y + x) << 2;
			png.data[pos] 		= colorMap[cell][0];
			png.data[pos + 1] 	= colorMap[cell][1];
			png.data[pos + 2] 	= colorMap[cell][2];
			png.data[pos + 3] 	= colorMap[cell][3];
		}
	}

	// output the png
	png.pack().pipe(fs.createWriteStream(destination));
}


/**
 * Reveal the correct functions
 **/
export default {
	spriteToPNG: spriteToPNG,
	buildSpriteSheet: buildSpriteSheet,
	spriteToBytes: spriteToBytes,
	bufferToSprite: bufferToSprite
};