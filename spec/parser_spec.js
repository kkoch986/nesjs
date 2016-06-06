
const fs = require('fs');
import Promise from '../node_modules/promise';
import Parser from "../src/parser";

/**
 * Parse the output of a decompilation from http://e-tradition.net/bytes/6502/disassembler.html
 **/
const parseDecompilationFile = path => {
	const open = Promise.denodeify(fs.open);
	return new Promise((accept, reject) => {
		var fs = require('fs'),
		    readline = require('readline');

		var rd = readline.createInterface({
		    input: fs.createReadStream(path),
		    output: process.stdout,
		    terminal: false
		});
		const output = [];
		let lineNumberInFile = 0;

		rd.on('line', (line) => {
		    // the first 4 characters is the line number (in hex)
		    let lineNumber = line.substring(0,4);
		    
		    // the inputs are stored in 7-14
		    let inputs = line.substring(7, 15).split(" ").filter(i => i.length);

		    // the command name is 18 - 20
		    let instruction = line.substring(18,21);

		    // the remainder of the string is the assembly argument
		    let assemblyArgument = line.substring(22).trim();

		    output.push({
		    	lineNumberInFile: lineNumberInFile++,
		    	lineNumber: parseInt(lineNumber, 16),
		    	lineNumberHex: lineNumber,
		    	inputs: inputs,
		    	instruction: instruction,
		    	assemblyArgument: assemblyArgument
		    });
		});

		rd.on('close', (line) => {
			accept(output);
		});
	});
};



describe("Decompilation", () => {
  it("matches the reference decompilation from mario", (done) => {
  	parseDecompilationFile("spec/data/mario_disassembly.txt").then((referenceData) => {
  		// now parse the file using our decompiler
  		Parser.parseFile("./roms/mario.nes").then((ourData) => {
			expect(ourData.prg.instructions.length).toEqual(referenceData.length);

			for(let i = 0 ; i < ourData.prg.instructions.length ; i++) {
				expect(ourData.prg.instructions[i].operation).toEqual(referenceData[i].instruction);
			}

    		done();
		}).catch((err) => {
			fail(err);
		});
  	}).catch((err) => {
  		console.log("err", err);
  		fail(err);
  		done();
  	});
  });
});