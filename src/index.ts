const table2 = [0x1, 0x5, 0x0, 0x4, 0x2, 0x3, 0x6, 0x7];
const invertedTable = [0xD, 0x5, 0x9, 0x7, 0x0, 0xF, 0xA, 0x2, 0xC, 0x3, 0xE, 0x1, 0x8, 0x6, 0xB, 0x4];

export class WiiNumber {
    hollywoodId: bigint;
    generationCount: bigint;
    hardwareModel: bigint;
    areaCode: bigint;
    unscrambled: bigint;

    constructor(
        hollywoodId: bigint,
        generationCount: bigint,
        hardwareModel: bigint,
        areaCode: bigint,
        unscrambled: bigint
    ) {
        this.hollywoodId = hollywoodId;
        this.generationCount = generationCount;
        this.hardwareModel = hardwareModel;
        this.areaCode = areaCode;
        this.unscrambled = unscrambled;
    }

    /**
     * Checks if the provided Wii number is valid.
     * @returns true if the Wii number is valid, false otherwise.
     */
    checkWiiNumber(): boolean {
        let temp = this.unscrambled;
        for (let i = 0n; i <= 42n; i++) {
            const val = temp >> (52n - i);
            if (val & 1n) {
                const xorVal = 0x0000000000000635n << (42n - i);
                temp ^= xorVal;
            }
        }
        return (temp & 0xFFn) === 0n;
    }

    /**
     * Obtains the Hollywood ID of the Wii number.
     * @returns The Hollywood ID of the provided Wii number.
     */
    getHollywoodID(): bigint {
        return this.hollywoodId;
    }

    /**
     * Obtains the generation count of the Wii number.
     * @returns The generation count of the Wii number.
     */
    getGenerationCount(): bigint {
        return this.generationCount;
    }

    /**
     * Obtains the hardware model of the Wii number.
     * @returns The hardware model of the Wii number.
     */
    getHardwareModel(): bigint {
        return this.hardwareModel;
    }

    /**
     * Obtains the area code of the Wii number.
     * @returns The area code of the Wii number.
     */
    getAreaCode(): bigint {
        return this.areaCode;
    }
}

function getByte(value: bigint, shift: number): number {
    return Number((value >> (BigInt(shift) * 8n)) & 0xFFn);
}

function insertByte(value: bigint, shift: number, byte: number): bigint {
    const mask = 0xFFn << (BigInt(shift) * 8n);
    const inst = BigInt(byte) << (BigInt(shift) * 8n);
    return (value & ~mask) | inst;
}

/**
 * Unscrambles a Wii number to obtain the original ID.
 * @param wiiNumber - The Wii number to unscramble, as a BigInt.
 * @returns The unscrambled ID as a BigInt.
 */
export function unscrambleId(wiiNumber: bigint): bigint {
    wiiNumber &= 0x001FFFFFFFFFFFFFn;
    wiiNumber ^= 0x00005E5E5E5E5E5En;
    wiiNumber &= 0x001FFFFFFFFFFFFFn;
    let mixId = wiiNumber;
    mixId ^= 0xFFn;
    mixId = (wiiNumber << 5n) & 0x20n;
    wiiNumber |= mixId << 48n;
    wiiNumber >>= 1n;
    mixId = wiiNumber;
    for (let i = 0; i <= 5; i++) {
        const val = getByte(mixId, table2[i]);
        wiiNumber = insertByte(wiiNumber, i, val);
    }
    for (let i = 0; i <= 5; i++) {
        const val = getByte(wiiNumber, i);
        const newByte = ((invertedTable[(val >> 4) & 0xF] << 4) | invertedTable[val & 0xF]) & 0xFF;
        wiiNumber = insertByte(wiiNumber, i, newByte);
    }
    let mixIdCopy = wiiNumber >> 0x20n;
    let anotherMixIdCopy = (wiiNumber >> 0x16n) | ((mixIdCopy & 0x7FFn) << 10n);
    mixIdCopy = (wiiNumber * 0x400n) | ((mixIdCopy >> 0xBn) & 0x3FFn);
    mixIdCopy = (anotherMixIdCopy << 0x20n) | mixIdCopy;
    mixIdCopy ^= 0x0000B3B3B3B3B3B3n;
    return mixIdCopy;
}

/**
 * Creates a WiiNumber object from a Wii number.
 * @param wiiNumber - The Wii number to load, as a BigInt. It should be a 16-digit number.
 * @returns A WiiNumber object containing the Hollywood ID, generation count, hardware model, area code, and unscrambled ID.
 */
export function loadWiiNumber(wiiNumber: bigint): WiiNumber {
    const unscrambled = unscrambleId(wiiNumber);
    return new WiiNumber(
        (unscrambled >> 15n) & 0xFFFFFFFFn,
        (unscrambled >> 10n) & 0x1Fn,
        (unscrambled >> 47n) & 7n,
        (unscrambled >> 50n) & 7n,
        unscrambled
    );
}

/**
 * Validates a Wii number string.
 * @param numberString - The Wii number string to validate. The format must be xxxx-xxxx-xxxx-xxxx.
 * @returns true if the Wii number is valid, false otherwise.
 */
export function isValidWiiNumber(numberString: string): boolean {
    const cleanedNumber = numberString.replace(/\D/g, '');

    if (cleanedNumber.length !== 16) {
        return false;
    }

    const wiiNumber = BigInt(cleanedNumber);

    const loadedWiiNumber = loadWiiNumber(wiiNumber);
    if (!loadedWiiNumber.checkWiiNumber()) {
        return false;
    }

    return loadedWiiNumber.getHollywoodID() != 0x0403AC68n;
}