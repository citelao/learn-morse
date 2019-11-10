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

const DIT_DURATION = 0.5;
const DART_DURATION = 3 * DIT_DURATION;
const INTER_POINT_DURATION = DIT_DURATION;
const INTER_CHARACTER_DURATION = 3 * DART_DURATION;

function generateMorseNotes(letters: string, options: {
    frequencyInHertz: number,
} = {
    frequencyInHertz: 443,
}): INote[] {
    const morse = letters.split("").map(getMorseForCharacter);

    // const notes = morse.reduce<INote[]>((noteArray, morseChar, letterIndex) => {
    //     const notesForCharacter = morseChar.split("").reduce<INote[]>((noteArray, point, pointIndex) => {
    //         const offsetTime = (noteArray.length == 0)
    //             ? 0
    //             : noteArray[-1].timeFromNowInSeconds + INTER_POINT_DURATION;
    //         const note = (point == "-")
    //             ? generateSineNote({ context: context, duration: 0.6, frequencyInHertz: 443, timeFromNowInSeconds: offsetTime })
    //             : generateSineNote({ context: context, duration: 0.2, frequencyInHertz: 886, timeFromNowInSeconds: offsetTime });

    //         return [
    //             ...noteArray,
    //             ...note
    //         ];
    //     }, []);

    //     return [
    //         ...noteArray,
    //         ...notesForCharacter
    //     ];
    // }, []);

    // return notes;
    return [];
}

const context = createAudioContext();
const scheduler = new Scheduler(window, context);
scheduler.start();

setTimeout(() => {
    // const notes = generateMorseNotes('k');
    const FREQUENCY = 443;
    const notes = [
        ... generateSineNote({ context: context, duration: DART_DURATION, frequencyInHertz: FREQUENCY, timeFromNowInSeconds: 0 }),
        ... generateSineNote({ context: context, duration: DIT_DURATION, frequencyInHertz: FREQUENCY, timeFromNowInSeconds: DART_DURATION + INTER_POINT_DURATION }),
        ... generateSineNote({ context: context, duration: DART_DURATION, frequencyInHertz: FREQUENCY, timeFromNowInSeconds: DART_DURATION + 2 * INTER_POINT_DURATION + DIT_DURATION }),
    ];
    
    scheduler.scheduleNotes(notes);
}, 30);