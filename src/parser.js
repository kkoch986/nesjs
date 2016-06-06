const fs = require('fs');
const Promise = require('promise');
const open = Promise.denodeify(fs.open);

const _16k = 16384;

import Constants from "./constants";
const opcodes = Constants.opcodes;

/**
 * Take a decimal number and return it as a binary string
 **/
const dec2bin = dec => (dec >>> 0).toString(2);

/**
 * Take a decimal number and return it as a hex string
 **/
const dec2hex = dec => (dec >>> 0).toString(16);

/**
 * Add together 2 binary strings according to the rules of sprite channels in CHR
 * Channel A bears weight 1 and Channel B bears weight 2
 * ex: 11110000 + 11111111 = 33332222
 **/
const chrAdd = (channelA, channelB) => {
	while(channelA.length < 8) {
		channelA = "0" + channelA;
	}
	while(channelB.length < 8) {
		channelB = "0" + channelB;
	}

	let output = "";
	for(let i = 0 ; i < channelB.length ; i++) {
		output += parseInt(channelA[i]) + (2 * parseInt(channelB[i]));
	}
	return output;
};

/**
 * Print the given 64-character string to the console as an 8x8 sprite
 **/
const printSprite = (sprite) => {
	let output = "";
	for(let i = 0 ; i < 64 ; i++) {
		if(sprite[i] === '0') output += " ";
		else output += sprite[i];
		if((i + 1) % 8 === 0) output += "\n";
	}
	console.log(output);
};

/**
 * Validate the header from the given file descriptor and extract any useful information
 **/
const validateHeader = (fd) => {
	return new Promise((accept, reject) => {

		// Start by validating the header codes
		const codes = [
			'N'.charCodeAt(0),
			'E'.charCodeAt(0),
			'S'.charCodeAt(0),
			0x01a
		];
		const buffer = new Buffer(16);
		let num = fs.readSync(fd, buffer, 0, 16, 0);
		for(let i in codes) {
			if(buffer[i] !== codes[i]) {
				reject("Invalid Header, expected " + codes[i] + ", got " + buffer[i]);
			}
		}

		// now exctract the number of PRG and CHR banks
		accept({
			prgBanks: buffer[4],
			chrBanks: buffer[5]
		});
	});
};

/**
 * Extract the PRG banks
 **/
const readPRGBanks = (fd, numberOfBanks) => {
	return new Promise((accept, reject) => {
		const size = _16k * numberOfBanks;
		const buffer = new Buffer(size);
		let num = fs.read(fd, buffer, 0, size, 16, (err, num, buffer) => {
			if(err) reject(err);
			else {

				// Try to decompile the program code
				const instructions = [];
				let pos = 0;
				while(pos < size) {
					const opcode = buffer[pos];
					let opcodeDefinition = opcodes[0xFF];
					if(opcodes[opcode]) {
						opcodeDefinition = opcodes[opcode];
					}

					const instructionSize = opcodeDefinition.size;
					const rawInstruction = buffer.slice(pos, pos + instructionSize);

					instructions.push({
						operation: opcodeDefinition.name,
						raw: rawInstruction
					});

					pos += instructionSize;
				}

				accept({num: num, buffer: buffer, instructions: instructions});
			}
		});
	});
};

/**
 * Read all of thr sprites out of the CHR banks
 **/
const readCHRBanks = (fd, prgSize, numberOfBanks) => {
	return new Promise((accept, reject) => {
		const size = (_16k / 2) * numberOfBanks;
		const buffer = new Buffer(size);
		let num = fs.read(fd, buffer, 0, size, 16 + prgSize, (err, num, buffer) => {
			if(err) reject(err);
			else {

				const sprites = [];
				for(let bank = 0 ; bank < numberOfBanks ; bank++) {
					for(let offset = 0; offset < 512; offset++) {
						let pos = (bank * 512) + (offset * 16);

						// read all of the sprites
						const channelA = buffer.slice(pos, pos+7);
						const channelB = buffer.slice(pos+8,pos+15);

						let output = "";
						for(let i = 0 ; i < 8 ; i++) {
							const testA = dec2bin(channelA[i]);
							const testB = dec2bin(channelB[i]);
							output += chrAdd(testA, testB);
						}
						// printSprite(output);
						sprites.push(output);
					}
				}

				accept({num: num, buffer: buffer, sprites: sprites});
			}
		});
	});
};

/**
 * Attempt to read the optional 128-bit suffix which contains the title information
 **/
const readTitleBank = (fd, prgSize, chrSize) => {
	return new Promise((accept, reject) => {
		const startPos = 16 + prgSize + chrSize;

		fs.fstat(fd, (err, stats) => {
			if(err) reject(err);
			if(stats.size === startPos) {
				accept(null);
			} else if(stats.size - startPos === 128) {
				const size = 128;
				const buffer = new Buffer(size);
				let num = fs.read(fd, buffer, 0, size, startPos, (err, num, buffer) => {
					if(err) reject(err);
					else accept(buffer.toString("ascii"));
				});
			} else {
				reject("Unexpected excess "+(stats.size - startPos)+" bytes at the end of the file.");
			}
		})

	});
};

/**
 * A function to parse the given .nes file and return all of the extracted information
 **/
const parseFile = (path) => {
	return open(path, "r").then((fd) => {
		return validateHeader(fd)
			.then((headerData) => {
				// read in the PRG banks
				return readPRGBanks(fd, headerData.prgBanks)
					.then(({num, buffer, instructions}) => {
						const prg = {bankCount: headerData.prgBanks, num: num, buffer: buffer, instructions: instructions};
						return readCHRBanks(fd, num, headerData.chrBanks).then(({num, buffer, sprites}) => {
							return {
								prg: prg,
								chr: {bankCount: headerData.chrBanks, num: num, buffer: buffer, sprites: sprites}
							}
						});
					});
			}).then((data) => {
				return readTitleBank(fd, data.prg.num, data.chr.num).then((result) => {
					data.title = result;
					return data;
				});
			}).then((finalResult) => {
				fs.close(fd);
				return finalResult;
			});
	});
}

export default {parseFile: parseFile};