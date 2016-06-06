
import Constants from "./constants";
const fs = require('fs'),
    PNG = require('pngjs').PNG;

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
	buildSpriteSheet: buildSpriteSheet
};