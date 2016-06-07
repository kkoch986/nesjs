
export default {
	/**
	 * Take a decimal number and return it as a binary string
	 **/
	dec2bin: dec => (dec >>> 0).toString(2),

	/**
	 * Take a decimal number and return it as a hex string
	 **/
	dec2hex: dec => (dec >>> 0).toString(16),

	/**
	 * Add together 2 binary strings according to the rules of sprite channels in CHR
	 * Channel A bears weight 1 and Channel B bears weight 2
	 * ex: 11110000 + 11111111 = 33332222
	 **/
	chrAdd: (channelA, channelB) => {
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
	},
}