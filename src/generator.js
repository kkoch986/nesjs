import Sprites from "./sprites";
import Promise from 'promise';
import fs from "fs";

const open = Promise.denodeify(fs.open);
const write = Promise.denodeify(fs.write);
const close = Promise.denodeify(fs.close);

/**
 * A function to take the data returned from the parser and write it out to a new rom
 *
 * NOTE: currently it just rewrites the PRG buffer as it read it in. this is because i dont 
 * understand enough about the programming aspect yet to be able to reverse engineer the programs
 * as a result, modifications made to the title block and sprites array will be reflected in the output 
 * but changing the instructions array in the PRG section will not be reflected, since the raw PRG buffer
 * is just regurgitated into the output.
 **/
const getRomBuffer = (romData) => {
	return new Promise((accept, reject) => {
		// first step is to compute the final size of the ROM
		// and allocate a buffer for it
		const finalSize = 16 + romData.prg.buffer.length + (romData.chr.sprites.length * 16) + (romData.title ? 128 : 0);
		const buffer = Buffer.alloc(finalSize);

		// Copy in the header
		romData.hdr.copy(buffer, 0);

		// Copy the PRG data
		// TODO: rebuild this data from romData.prg.instructions in case instructions were modified
		romData.prg.buffer.copy(buffer, 16);

		// modify the header value for the number of CHR banks since it may have changed
		const chrBanks = Math.ceil(romData.chr.sprites.length / 512);
		buffer[5] = chrBanks;

		// Next is to write the CHR banks using the sprites given
		const startingPos = 16 + romData.prg.buffer.length;
		for(let i in romData.chr.sprites) {
			const spriteBuffer = Sprites.spriteToBytes(romData.chr.sprites[i]);
			spriteBuffer.copy(buffer, startingPos + (i * 16));
		}

		// check for (and if it exists, write) a title buffer
		if(romData.title) {
			(Buffer.from(romData.title)).copy(buffer, finalSize - 128);
		}

		// return the buffer to the promise
		accept(buffer);
	});
}

const exportRom = (romData, destination) => {
	return new Promise((accept, reject) => 
		getRomBuffer(romData).then((romBuffer) => {
			// Open the target file and write the buffer
			return open(destination, "w+").then((fd) => {
				return write(fd, romBuffer, 0, romBuffer.length).then(() => {
					return close(fd);
				});
			});
		}).catch(err => {
			reject(err);
		})
	);
};

export default {
	exportRom: exportRom
};