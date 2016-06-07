const Constants = {
	_16k: 16384,

	// The RGBA represntation of a transparent color
	transparent: [0x00,0x00,0x00,0x00],

	// a blank 8x8 sprite
	blankSprite: "0000000000000000000000000000000000000000000000000000000000000000",

	// all of the asm instructions indexed by their opcode
	opcodes: {

		// ADC
		0x69: { name: "ADC", size: 2, mode: "Immediate"			},
		0x65: { name: "ADC", size: 2, mode: "Zero Page"			},
		0x75: { name: "ADC", size: 2, mode: "Zero Page, X"		},
		0x6D: { name: "ADC", size: 3, mode: "Absolute"			},
		0x7D: { name: "ADC", size: 3, mode: "Absolute, X"		},
		0x79: { name: "ADC", size: 3, mode: "Absolute, Y"		},
		0x61: { name: "ADC", size: 2, mode: "Indirect, X"		},
		0x71: { name: "ADC", size: 2, mode: "Indirect, Y"		},

		// AND 
		0x29: { name: "AND", size: 2, mode: "Immediate"			},
		0x25: { name: "AND", size: 2, mode: "Zero Page"			},
		0x35: { name: "AND", size: 2, mode: "Zero Page, X"		},
		0x2D: { name: "AND", size: 3, mode: "Absolute"			},
		0x3D: { name: "AND", size: 3, mode: "Absolute, X"		},
		0x39: { name: "AND", size: 3, mode: "Absolute, Y"		},
		0x21: { name: "AND", size: 2, mode: "Indirect, X"		},
		0x31: { name: "AND", size: 2, mode: "Indirect, Y"		},

		// ASL
		0x0A: { name: "ASL", size: 1, mode: "Accumulator"		},
		0x06: { name: "ASL", size: 2, mode: "Zero Page"			},
		0x16: { name: "ASL", size: 2, mode: "Zero Page, X"		},
		0x0E: { name: "ASL", size: 3, mode: "Absolute"			},
		0x1E: { name: "ASL", size: 3, mode: "Absolute, X"		},

		// BPL / BMI / BVC / BVS / BCC / BCS / BNE / BEQ
		0x90: { name: "BCC", size: 2 },
		0xB0: { name: "BCS", size: 2 },
		0xF0: { name: "BEQ", size: 2 },
		0x30: { name: "BMI", size: 2 },
		0xD0: { name: "BNE", size: 2 },
		0x10: { name: "BPL", size: 2 },
		0x50: { name: "BVC", size: 2 },
		0x70: { name: "BVS", size: 2 },

		// BIT
		0x24: { name: "BIT", size: 2, mode: "Zero Page"			},
		0x2C: { name: "BIT", size: 3, mode: "Absolute"			},

		// BRK
		0x00: { name: "BRK", size: 1 },

		// CLC / CLD / CLI / CLV
		0x18: { name: "CLC", size: 1 },
		0xD8: { name: "CLD", size: 1 },
		0x58: { name: "CLI", size: 1 },
		0xB8: { name: "CLV", size: 1 },

		// CMP
		0xC9: { name: "CMP", size: 2, mode: "Immediate"			},
		0xC5: { name: "CMP", size: 2, mode: "Zero Page"			},
		0xD5: { name: "CMP", size: 2, mode: "Zero Page, X"		},
		0xCD: { name: "CMP", size: 3, mode: "Absolute"			},
		0xDD: { name: "CMP", size: 3, mode: "Absolute, X"		},
		0xD9: { name: "CMP", size: 3, mode: "Absolute, Y"		},
		0xC1: { name: "CMP", size: 2, mode: "Indirect, X"		},
		0xD1: { name: "CMP", size: 2, mode: "Indirect, Y"		},

		// CPX
		0xE0: { name: "CPX", size: 2, mode: "Immediate"			},
		0xE4: { name: "CPX", size: 2, mode: "Zero Page"			},
		0xEC: { name: "CPX", size: 3, mode: "Absolute"			},

		// CPY
		0xC0: { name: "CPY", size: 2, mode: "Immediate"			},
		0xC4: { name: "CPY", size: 2, mode: "Zero Page"			},
		0xCC: { name: "CPY", size: 3, mode: "Absolute"			},

		// DEC
		0xC6: { name: "DEC", size: 2, mode: "Zero Page"			},
		0xD6: { name: "DEC", size: 2, mode: "Zero Page, X"		},
		0xCE: { name: "DEC", size: 3, mode: "Absolute"			},
		0xDE: { name: "DEC", size: 3, mode: "Absolute, X"		},

		// DEX / DEY
		0xCA: { name: "DEX", size: 1 },
		0x88: { name: "DEY", size: 1 },
		
		// EOR
		0x49: { name: "EOR", size: 2, mode: "Immediate"			},
		0x45: { name: "EOR", size: 2, mode: "Zero Page"			},
		0x55: { name: "EOR", size: 2, mode: "Zero Page, X"		},
		0x4D: { name: "EOR", size: 3, mode: "Absolute"			},
		0x5D: { name: "EOR", size: 3, mode: "Absolute, X"		},
		0x59: { name: "EOR", size: 3, mode: "Absolute, Y"		},
		0x41: { name: "EOR", size: 2, mode: "Indirect, X"		},
		0x51: { name: "EOR", size: 2, mode: "Indirect, Y"		},

		// INC
		0xE6: { name: "INC", size: 2, mode: "Zero Page"			},
		0xF6: { name: "INC", size: 2, mode: "Zero Page, X"		},
		0xEE: { name: "INC", size: 3, mode: "Absolute"			},
		0xFE: { name: "INC", size: 3, mode: "Absolute, X"		},

		// INX / INY
		0xE8: { name: "INX", size: 1 },
		0xC8: { name: "INY", size: 1 },

		// JMP
		0x6C: { name: "JMP", size: 3, mode: "Indirect" },
		0x4C: { name: "JMP", size: 3, mode: "Absolute" },

		// JSR
		0x20: { name: "JSR", size: 3 },

		// LDA
		0xA9: { name: "LDA", size: 2, mode: "Immediate"			},
		0xA5: { name: "LDA", size: 2, mode: "Zero Page"			},
		0xB5: { name: "LDA", size: 2, mode: "Zero Page, X"		},
		0xAD: { name: "LDA", size: 3, mode: "Absolute"			},
		0xBD: { name: "LDA", size: 3, mode: "Absolute, X"		},
		0xB9: { name: "LDA", size: 3, mode: "Absolute, Y"		},
		0xA1: { name: "LDA", size: 2, mode: "Indirect, X"		},
		0xB1: { name: "LDA", size: 2, mode: "Indirect, Y"		},

		// LDX
		0xA6: { name: "LDX", size: 2, mode: "Zero Page"			},
		0xB6: { name: "LDX", size: 2, mode: "Zero Page, Y"		},
		0xAE: { name: "LDX", size: 3, mode: "Absolute"			},
		0xBE: { name: "LDX", size: 3, mode: "Absolute, Y"		},
		0xA2: { name: "LDX", size: 2, mode: "Immediate"			},

		// LDY
		0xA0: { name: "LDY", size: 2, mode: "Immediate"			},
		0xA4: { name: "LDY", size: 2, mode: "Zero Page"			},
		0xB4: { name: "LDY", size: 2, mode: "Zero Page, X"		},
		0xAC: { name: "LDY", size: 3, mode: "Absolute"			},
		0xBC: { name: "LDY", size: 3, mode: "Absolute, X"		},

		// LSR
		0x4A: { name: "LSR", size: 1, mode: "Accumulator"		},
		0x46: { name: "LSR", size: 2, mode: "Zero Page"			},
		0x56: { name: "LSR", size: 2, mode: "Zero Page, X"		},
		0x4E: { name: "LSR", size: 3, mode: "Absolute"			},
		0x5E: { name: "LSR", size: 3, mode: "Absolute, X"		},

		// NOP
		0xEA: { name: "NOP", size: 1 },

		// ORA
		0x09: { name: "ORA", size: 2, mode: "Immediate"			},
		0x05: { name: "ORA", size: 2, mode: "Zero Page"			},
		0x15: { name: "ORA", size: 2, mode: "Zero Page, X"		},
		0x0D: { name: "ORA", size: 3, mode: "Absolute"			},
		0x1D: { name: "ORA", size: 3, mode: "Absolute, X"		},
		0x19: { name: "ORA", size: 3, mode: "Absolute, Y"		},
		0x01: { name: "ORA", size: 2, mode: "Indirect, X"		},
		0x11: { name: "ORA", size: 2, mode: "Indirect, Y"		},

		// PHA / PHP / PLA / PLP
		0x48: { name: "PHA", size: 1 },
		0x08: { name: "PHP", size: 1 },
		0x68: { name: "PLA", size: 1 },
		0x28: { name: "PLP", size: 1 },

		// ROL
		0x2A: { name: "ROL", size: 1, mode: "Accumulator"		},
		0x26: { name: "ROL", size: 2, mode: "Zero Page"			},
		0x36: { name: "ROL", size: 2, mode: "Zero Page, X"		},
		0x2E: { name: "ROL", size: 3, mode: "Absolute"			},
		0x3E: { name: "ROL", size: 3, mode: "Absolute, X"		},

		// ROR
		0x6A: { name: "ROR", size: 1, mode: "Accumulator"		},
		0x66: { name: "ROR", size: 2, mode: "Zero Page"			},
		0x76: { name: "ROR", size: 2, mode: "Zero Page, X"		},
		0x6E: { name: "ROR", size: 3, mode: "Absolute"			},
		0x7E: { name: "ROR", size: 3, mode: "Absolute, X"		},

		// RTI / RTS
		0x40: { name: "RTI", size: 1 },
		0x60: { name: "RTS", size: 1 },

		// SBC
		0xE9: { name: "SBC", size: 2, mode: "Immediate"			},
		0xE5: { name: "SBC", size: 2, mode: "Zero Page"			},
		0xF5: { name: "SBC", size: 2, mode: "Zero Page, X"		},
		0xED: { name: "SBC", size: 3, mode: "Absolute"			},
		0xFD: { name: "SBC", size: 3, mode: "Absolute, X"		},
		0xF9: { name: "SBC", size: 3, mode: "Absolute, Y"		},
		0xE1: { name: "SBC", size: 2, mode: "Indirect, X"		},
		0xF1: { name: "SBC", size: 2, mode: "Indirect, Y"		},

		// SEC / SED / SEI
		0x38: { name: "SEC", size: 1 },
		0xF8: { name: "SED", size: 1 },
		0x78: { name: "SEI", size: 1 },

		// STA
		0x85: { name: "STA", size: 2, mode: "Zero Page"			},
		0x95: { name: "STA", size: 2, mode: "Zero Page, X"		},
		0x8D: { name: "STA", size: 3, mode: "Absolute"			},
		0x9D: { name: "STA", size: 3, mode: "Absolute, X"		},
		0x99: { name: "STA", size: 3, mode: "Absolute, Y"		},
		0x81: { name: "STA", size: 2, mode: "Indirect, X"		},
		0x91: { name: "STA", size: 2, mode: "Indirect, Y"		},

		// STX
		0x86: { name: "STX", size: 2, mode: "Zero Page"			},
		0x96: { name: "STX", size: 2, mode: "Zero Page, Y"		},
		0x8E: { name: "STX", size: 3, mode: "Absolute"			},

		// STY
		0x84: { name: "STY", size: 2, mode: "Zero Page"			},
		0x94: { name: "STY", size: 2, mode: "Zero Page, X"		},
		0x8C: { name: "STY", size: 3, mode: "Absolute"			},

		// TAX / TAY / TSX / TXA / TXS / TYA 
		0xAA: { name: "TAX", size: 1 },
		0xA8: { name: "TAY", size: 1 },
		0xBA: { name: "TSX", size: 1 },
		0x8A: { name: "TXA", size: 1 },
		0x9A: { name: "TXS", size: 1 },
		0x98: { name: "TYA", size: 1 },

		// unknown?
		0xFF: { name: "???", size: 1 },
	},

	// some cool pallets
	pallets: {
		greyScale: [ [0xFF, 0xFF, 0xFF, 0xFF], [0xCC, 0xCC, 0xCC, 0xFF], [0x66, 0x66, 0x66, 0xFF], [0x00, 0x00, 0x00, 0xFF] ],
		mario: {
			fireballMario: [ [0x5C, 0x94, 0xFC, 0xFF], [0xFF, 0xFF, 0xFF, 0xFF], [0xFC, 0xD8, 0xA8, 0xFF], [0xD7, 0x27, 0x00, 0xFF], ],
			clouds: [ [0x5C, 0x94, 0xFC, 0xFF], [0xFC, 0xFC, 0xFC, 0xFF], [0x4C, 0xC0, 0xFC, 0xFF], [0x17, 0x1B, 0x23, 0xFF] ],
			bushes: [ [0x5C, 0x94, 0xFC, 0xFF], [0x80, 0xD0, 0x10, 0xFF], [0x1F, 0xB1, 0x03, 0xFF], [0x17, 0x1B, 0x23, 0xFF] ]
		}
	}
}

export default Constants;