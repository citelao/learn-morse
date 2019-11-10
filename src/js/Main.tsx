import React from "react";

import Scheduler, { INote } from "./audio/Scheduler";
import { generateMorseNotes } from "./audio/morse";

function createAudioContext(): AudioContext {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
}

interface MainState {
    currentLetters: string[]
}

export default class Main extends React.Component<{}, MainState>
{
    state = {
        currentLetters: [
            "m",
            "k"
        ]
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
        setTimeout(() => {
            const notes = generateMorseNotes(this.audioContext, 'kmmkk');
            this.scheduler.scheduleNotes(notes);
        }, 300);
    }

    render()
    {
        return (
            <section className="main">
                <div className="letter">v</div>
                <input type="text" />
            </section>
        );
    }
}