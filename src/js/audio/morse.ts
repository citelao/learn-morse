import { INote } from "./Scheduler";
import { generateSineNote } from "./sine";

type MorseSymbol = "-" | ".";
function isMorseSymbol(char: string): char is MorseSymbol {
    return char === "-" || char === ".";
}

function parseMorseSymbols(symbols: string): MorseSymbol[] {
    const chars = symbols.split("");

    // Validate the string:
    const isValid = chars.every(isMorseSymbol);
    if (!isValid) {
        throw new Error(`Invalid morse symbols in '${symbols}'`);
    }

    return chars as MorseSymbol[];
}

function getMorseForCharacter(char: string): MorseSymbol[] {
    const MORSE_ALPHABET: { [key: string]: string } = {
        k: "-.-",
        m: "--",
        u: "..-",
        " ": " "
    };

    if (char.length > 1) {
        throw new Error(`Use only one char. (${char})`);
    }

    const morse = MORSE_ALPHABET[char];
    if (!morse) {
        throw new Error(`Don't know morse for ${char}`);
    }

    return parseMorseSymbols(morse);
}

export interface ISpeeds {
    dit_duration_seconds: number;
    dart_duration_seconds: number;
    inter_symbol_duration_seconds: number;
    inter_character_duration_seconds: number;
    inter_word_duration_seconds: number;
}

export function getSpeeds(wordsPerMinute: number): ISpeeds {
    // Use the standard word `PARIS`:
    // - 10 DIT
    // - 4 DART
    // - 9 INTER_SYMBOL
    // - 4 INTER_CHAR
    // - (1 INTER_WORD)
    //
    // With the ratios of spacing:
    // - DIT_DURATION = 1tu
    // - DART_DURATION = 3tu
    // - INTER_SYMBOL_DURATION = 1tu
    // - INTER_CHARACTER_DURATION = 3tu
    // - INTER_WORD_DURATION = 7tu
    //
    //   10 + 4 * 3 + 9 + 4 * 3
    // = 10 + 12 + 9 + 12 = 43
    //
    // + Word = 50tu.
    //
    // Therefore, units per minute = words per minute * 50(tu/word)
    // Therefore, length of unit = 60(s/min) / (WPM * 50(tu/word))
    //
    const unitsPerWord = 50;
    const secondsPerMinute = 60;
    const secondsPerUnit = secondsPerMinute / (wordsPerMinute * unitsPerWord);

    const speeds: ISpeeds = {
        dit_duration_seconds: secondsPerUnit,
        dart_duration_seconds: 3 * secondsPerUnit,
        inter_symbol_duration_seconds: secondsPerUnit,
        inter_character_duration_seconds: 3 * secondsPerUnit,
        inter_word_duration_seconds: 7 * secondsPerUnit
    };
    return speeds;
}

export function getKochSpeeds(
    codingWordsPerMinute: number,
    effectiveWordsPerMinute: number
): ISpeeds {
    const codingSpeeds = getSpeeds(codingWordsPerMinute);

    // PARIS has 43units + 7 space units.
    const unitsPerWord = 43;
    const codingTimePerMinute =
        effectiveWordsPerMinute *
        unitsPerWord *
        codingSpeeds.dit_duration_seconds;

    const secondsPerMinute = 60;
    const freeTimePerMinute = secondsPerMinute - codingTimePerMinute;
    const inter_word_duration = freeTimePerMinute / effectiveWordsPerMinute;

    const speeds: ISpeeds = {
        dit_duration_seconds: codingSpeeds.dit_duration_seconds,
        dart_duration_seconds: codingSpeeds.dart_duration_seconds,
        inter_symbol_duration_seconds:
            codingSpeeds.inter_symbol_duration_seconds,
        inter_character_duration_seconds:
            codingSpeeds.inter_character_duration_seconds,
        inter_word_duration_seconds: inter_word_duration
    };
    console.log(speeds);
    return speeds;
}

export function generateMorseNotes(
    context: AudioContext,
    message: string,
    options: {
        frequencyInHertz: number;
        codingSpeed: number;
        effectiveSpeed: number;
    } = {
        frequencyInHertz: 443,
        codingSpeed: 16,
        effectiveSpeed: 12
    }
): INote[] {
    const speeds = getKochSpeeds(options.codingSpeed, options.effectiveSpeed);
    const words = message.split(" ");
    const notes = words.reduce<INote[]>((currentWordNotes, word) => {
        const isFirstWord = currentWordNotes.length === 0;

        const chars = word.split("");
        const notes = chars.reduce<INote[]>((currentMorseChars, char) => {
            const isFirstCharacter = currentMorseChars.length === 0;

            const symbols = getMorseForCharacter(char);
            const notes = symbols.reduce<INote[]>((currentPoints, symbol) => {
                const isFirstPointInCharacter = currentPoints.length === 0;
                let timeOffset = 0;
                if (isFirstPointInCharacter) {
                    if (isFirstCharacter) {
                        if (isFirstWord) {
                            timeOffset = 0;
                        } else {
                            const previousWordPoint =
                                currentWordNotes[currentWordNotes.length - 1];
                            timeOffset =
                                previousWordPoint.timeFromNowInSeconds +
                                speeds.inter_word_duration_seconds;
                        }
                    } else {
                        const previousCharacterPoint =
                            currentMorseChars[currentMorseChars.length - 1];
                        timeOffset =
                            previousCharacterPoint.timeFromNowInSeconds +
                            speeds.inter_character_duration_seconds;
                    }
                } else {
                    const previousPoint =
                        currentPoints[currentPoints.length - 1];
                    timeOffset =
                        previousPoint.timeFromNowInSeconds +
                        speeds.inter_symbol_duration_seconds;
                }

                const duration = ((symbol: MorseSymbol): number => {
                    switch (symbol) {
                        case "-":
                            return speeds.dart_duration_seconds;
                        case ".":
                            return speeds.dit_duration_seconds;
                    }
                })(symbol);

                const frequency = ((symbol: MorseSymbol): number => {
                    // TODO: investigate this; it teaches better!
                    const SHOULD_SEPARATE_PITCHES = false;

                    if (SHOULD_SEPARATE_PITCHES) {
                        switch (symbol) {
                            case "-":
                                return options.frequencyInHertz;
                            case ".":
                                return options.frequencyInHertz * 1.5;
                        }
                    } else {
                        return options.frequencyInHertz;
                    }
                })(symbol);

                const note = generateSineNote({
                    context: context,
                    duration: duration,
                    frequencyInHertz: frequency,
                    timeFromNowInSeconds: timeOffset
                });
                return [...currentPoints, ...note];
            }, []);

            return [...currentMorseChars, ...notes];
        }, []);

        return [...currentWordNotes, ...notes];
    }, []);

    return notes;
}
