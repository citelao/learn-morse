import React from "react";

import Scheduler, { INote } from "./audio/Scheduler";
import { generateMorseNotes } from "./audio/morse";
import MainView from "./MainView";

function createAudioContext(): AudioContext {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
}

interface MainState {
    hasStarted: boolean,
    currentLesson: number,
    currentWord: string | null
}

const LETTER_SERIES = [
    "k",
    "m",
    "u"
];

function generateWordForLesson(currentLesson: number): string {
    const availableLetters = LETTER_SERIES.slice(0, currentLesson);

    const LENGTH = 5;
    let word = "";
    for(let i = 0; i < LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * (availableLetters.length - 1));
        word += availableLetters[randomIndex];
    }

    return word;
}

export default class Main extends React.Component<{}, MainState>
{
    state: MainState = {
        hasStarted: false,
        currentLesson: 1,
        currentWord: null
    };

    private audioContext: AudioContext;
    private scheduler: Scheduler;

    constructor(props: {}) {
        super(props);

        this.audioContext = createAudioContext();
        this.scheduler = new Scheduler(window, this.audioContext);
        this.scheduler.start();
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps: {}, prevState: MainState) {
        if (this.state.hasStarted != prevState.hasStarted) {
            // We just started!
        }

        if (this.state.currentWord != prevState.currentWord) {
            if (this.state.currentWord) {
                // New word! Play it.
                const notes = generateMorseNotes(this.audioContext, this.state.currentWord);
                this.scheduler.clear();
                this.scheduler.scheduleNotes(notes);
            }
        }
    }

    render()
    {
        return (
            <MainView
                hasStarted={this.state.hasStarted}
                onBegin={this.handleBegin}
                onGuess={this.handleGuess} />
        );
    }

    private handleBegin = () => {
        const word = generateWordForLesson(this.state.currentLesson);
        console.log(word);

        this.setState({
            hasStarted: true,
            currentWord: word
        });
    }

    private handleGuess = (char: string) => {
        console.log(char);
    }
}