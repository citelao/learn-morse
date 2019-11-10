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

// Our letter time should be ~20WPM.
// Assume 5 letters/word, 4 points/letter, 50% dits
// ((2 * DIT + 2 * DART) * 5 + INTER_POINT * 4) * 20 + INTER_WORD * 19 = 60s
// DART = 3 * DIT
// INTER_POINT = DIT
// INTER_WORD = 3 * DART = 9 * DIT
// ((2 * DIT + 6 * DIT) * 5 + DIT * 4) * 20 + (9 * DIT) * 19 = 60s
// ((8 * DIT) * 5 + DIT * 4) * 20 + (9 * DIT) * 19 = 60s
// (44 * DIT) * 20 + (171 * DIT) = 60s
// 880 * DIT + 171 * DIT = 60s
// 1050 * DIT = 60s
// DIT = .057142857s

export const DIT_DURATION = 0.06;
export const DART_DURATION = 3 * DIT_DURATION;
export const INTER_POINT_DURATION = DIT_DURATION;
export const INTER_CHARACTER_DURATION = DART_DURATION;
export const INTER_WORD_DURATION = 7 * DIT_DURATION;

export function generateMorseNotes(context: AudioContext, message: string, options: {
    frequencyInHertz: number,
} = {
    frequencyInHertz: 443,
}): INote[] {
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
                    timeOffset = previousCharacterPoint.timeFromNowInSeconds + INTER_CHARACTER_DURATION;
                }
            } else {
                const previousPoint = currentPoints[currentPoints.length - 1];
                timeOffset = previousPoint.timeFromNowInSeconds + INTER_POINT_DURATION;
            }
            
            const duration = (point === "-")
                ? DART_DURATION
                : DIT_DURATION;
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