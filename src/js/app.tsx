import ReactDOM from "react-dom";
import React from "react";

import Main from "./Main";
import { test } from "./morse";
import Scheduler, { INote } from "./audio/Scheduler";
import { generateSineNote } from "./audio/sine";

ReactDOM.render(
    <Main />,
    document.getElementById('root')
);

//

function createAudioContext(): AudioContext {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
}

function getMorseForCharacter(char: string) {
    const MORSE_ALPHABET: { [key: string]: string } = {
        "k": "-.-",
        "m": "--"
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

const DIT_DURATION = 0.06;
const DART_DURATION = 3 * DIT_DURATION;
const INTER_POINT_DURATION = DIT_DURATION;
const INTER_CHARACTER_DURATION = 3 * DART_DURATION;

function generateMorseNotes(letters: string, options: {
    frequencyInHertz: number,
} = {
    frequencyInHertz: 443,
}): INote[] {
    // const morse = letters.split("").map(getMorseForCharacter);
    const FREQUENCY = 443;
    const notes = [
        ... generateSineNote({ context: context, duration: DART_DURATION, frequencyInHertz: FREQUENCY, timeFromNowInSeconds: 0 }),
        ... generateSineNote({ context: context, duration: DIT_DURATION, frequencyInHertz: FREQUENCY, timeFromNowInSeconds: DART_DURATION + INTER_POINT_DURATION }),
        ... generateSineNote({ context: context, duration: DART_DURATION, frequencyInHertz: FREQUENCY, timeFromNowInSeconds: DART_DURATION + 2 * INTER_POINT_DURATION + DIT_DURATION }),
    ];
    return notes;
}

const context = createAudioContext();
const scheduler = new Scheduler(window, context);
scheduler.start();

setTimeout(() => {
    const notes = generateMorseNotes('k');
    scheduler.scheduleNotes(notes);
}, 30);