import { INote } from "./Scheduler";
import { generateSineNote } from "./sine";

function getMorseForCharacter(char: string) {
    const MORSE_ALPHABET: { [key: string]: string } = {
        "k": "-.-",
        "m": "--",
        "u": "..-"
    };

    if (char.length > 1) {
        throw new Error(`Use only one char. (${char})`);
    }

    const morse = MORSE_ALPHABET[char];
    if (!morse) {
        throw new Error(`Don't know morse for ${char}`);
    }

    return morse;
}

export interface ISpeeds {
    dit_duration_seconds: number;
    dart_duration_seconds: number;
    inter_symbol_duration_seconds: number;
    inter_character_duration_seconds: number;
    inter_word_duration_seconds: number;
}

export function getSpeeds(wordsPerMinute: number): ISpeeds {
    // Assumptions:
    // const lettersPerWord = 5;
    // const pointsPerLetter = 4
    // const ditsVersusDartsPercentage = 0.5;

    // For:
    // - `n` wpm,
    // - `l` letters per word,
    // - `p` points per letter,
    // - `d` dits versus darts percentage (decimal)
    //
    // Letter duration:
    // `j = (d * p * DIT_DURATION + (1 - d) * p * DART_DURATION) + (p - 1) * INTER_SYMBOL_DURATION`
    //
    // Word duration:
    // `k = j * l + (l - 1) * INTER_CHARACTER_DURATION`
    //
    // Words per minute:
    // `60sec = n * k + (n - 1) * INTER_WORD_DURATION`
    //
    // Solve for n:
    //
    // 60sec = n * k + n * INTER_WORD_DURATION - INTER_WORD_DURATION
    // => 60sec = n * (k + INTER_WORD_DURATION) - INTER_WORD_DURATION
    // => (60sec + INTER_WORD_DURATION) / (k + INTER_WORD_DURATION) = n
    //
    // Expand `k`:
    //
    // n = (60sec + INTER_WORD_DURATION) / (k + INTER_WORD_DURATION)
    // n = (60sec + INTER_WORD_DURATION) / ((j * l + (l - 1) * INTER_CHARACTER_DURATION) + INTER_WORD_DURATION)
    // n = (60sec + INTER_WORD_DURATION) / ((((d * p * DIT_DURATION + (1 - d) * p * DART_DURATION) + (p - 1) * INTER_SYMBOL_DURATION) * l + (l - 1) * INTER_CHARACTER_DURATION) + INTER_WORD_DURATION)
    //
    // Great, now use the ratios of spacing:
    // - DIT_DURATION = 1tu
    // - DART_DURATION = 3tu
    // - INTER_POINT_DURATION = 1tu
    // - INTER_CHARACTER_DURATION = 3tu
    // - INTER_WORD_DURATION = 7tu
    //
    // Solving on paper:
    const unitsPerMinute = 74 * wordsPerMinute - 7;
    const minutesPerUnite = 1 / unitsPerMinute;
    const secondsPerMinute = 60;
    const secondsPerUnit = secondsPerMinute * minutesPerUnite;

    const speeds: ISpeeds = {
        dit_duration_seconds: secondsPerUnit,
        dart_duration_seconds: 3 * secondsPerUnit,
        inter_symbol_duration_seconds: secondsPerUnit,
        inter_character_duration_seconds: 3 * secondsPerUnit,
        inter_word_duration_seconds: 7 * secondsPerUnit
    };
    return speeds;
}

export function getKochSpeeds(codingWordsPerMinute: number, effectiveWordsPerMinute: number): ISpeeds {
    const codingSpeeds = getSpeeds(codingWordsPerMinute);

    const symbolsPerLetter = 4
    const ditsVersusDartsPercentage = 0.5;
    const letterDuration = (
        (
            (symbolsPerLetter * ditsVersusDartsPercentage * codingSpeeds.dit_duration_seconds)
            - (symbolsPerLetter * (1 - ditsVersusDartsPercentage) * codingSpeeds.dart_duration_seconds)
        ) + (symbolsPerLetter - 1) * codingSpeeds.inter_symbol_duration_seconds
    );

    const lettersPerWord = 5;
    const wordDuration = lettersPerWord * letterDuration + (lettersPerWord - 1) * codingSpeeds.inter_word_duration_seconds;
    
    const totalWordDuration = wordDuration * effectiveWordsPerMinute;
    const totalWordPauses = 1 - totalWordDuration;

    const inter_word_duration = totalWordPauses / (1 - effectiveWordsPerMinute);
    const speeds: ISpeeds = {
        dit_duration_seconds: codingSpeeds.dit_duration_seconds,
        dart_duration_seconds: codingSpeeds.dart_duration_seconds,
        inter_symbol_duration_seconds: codingSpeeds.inter_symbol_duration_seconds,
        inter_character_duration_seconds: codingSpeeds.inter_character_duration_seconds,
        inter_word_duration_seconds: inter_word_duration
    };
    return speeds;
}

export function generateMorseNotes(context: AudioContext, message: string, options: {
    frequencyInHertz: number,
} = {
    frequencyInHertz: 443,
}): INote[] {
    const speeds = getSpeeds(20);
    const chars = message.split("");
    const notes = chars.reduce<INote[]>((currentMorseChars, char) => {
        const isFirstCharacter = (currentMorseChars.length === 0);

        const points = getMorseForCharacter(char).split("");
        const notes = points.reduce<INote[]>((currentPoints, point, pointIndex) => {
            const isFirstPointInCharacter = (currentPoints.length === 0);
            let timeOffset = 0;
            if (isFirstPointInCharacter) {
                if (isFirstCharacter) {
                    timeOffset = 0;
                } else {
                    const previousCharacterPoint = currentMorseChars[currentMorseChars.length - 1];
                    timeOffset = previousCharacterPoint.timeFromNowInSeconds + speeds.inter_character_duration_seconds;
                }
            } else {
                const previousPoint = currentPoints[currentPoints.length - 1];
                timeOffset = previousPoint.timeFromNowInSeconds + speeds.inter_symbol_duration_seconds;
            }
            
            const duration = (point === "-")
                ? speeds.dart_duration_seconds
                : speeds.dit_duration_seconds;
            const note = generateSineNote({
                context: context, 
                duration: duration,
                frequencyInHertz: options.frequencyInHertz, 
                timeFromNowInSeconds: timeOffset
            });
            return [
                ... currentPoints,
                ... note
            ];
        }, []);

        return [
            ... currentMorseChars,
            ... notes
        ];
    }, []);
    return notes;
}