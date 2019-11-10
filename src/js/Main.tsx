import React from "react";

import Scheduler, { INote } from "./audio/Scheduler";
import { generateMorseNotes } from "./audio/morse";
import MainView from "./MainView";

function createAudioContext(): AudioContext {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
}

interface MainState {
    hasStarted: boolean,
    currentLesson: number
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

    return word
}

export default class Main extends React.Component<{}, MainState>
{
    state = {
        hasStarted: false,
        currentLesson: 1,
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
        this.setState({
            hasStarted: true
        });

        const word = generateWordForLesson(this.state.currentLesson);
        console.log(word);
        const notes = generateMorseNotes(this.audioContext, word);
        this.scheduler.clear();
        this.scheduler.scheduleNotes(notes);
    }

    private handleGuess = (char: string) => {
        console.log(char);
    }
}