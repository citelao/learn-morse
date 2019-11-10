import React from "react";

import Scheduler, { INote } from "./audio/Scheduler";
import { generateMorseNotes, INTER_WORD_DURATION } from "./audio/morse";
import MainView from "./view/MainView";
import LessonPlan, { QuizMode } from "./LessonPlan";

function createAudioContext(): AudioContext {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
}

interface ICachedLessonState {
    currentWord: string | null;
    wordId: number | null;
    currentGuess: string;
    quizMode: QuizMode;
}
function getCachedLessonState(lessonPlan: LessonPlan) {
    const state: ICachedLessonState = {
        currentWord: lessonPlan.getCurrentWord(),
        wordId: lessonPlan.getWordId(),
        currentGuess: lessonPlan.getCurrentGuess(),
        quizMode: lessonPlan.getQuizMode(),
    };
    return state;
}

interface MainState {
    hasStarted: boolean,

    currentLesson: LessonPlan,
    cachedLessonState: ICachedLessonState | null
}

export default class Main extends React.Component<{}, MainState>
{
    state: MainState = {
        hasStarted: false,
        currentLesson: LessonPlan.create(),
        cachedLessonState: null
    };

    private audioContext: AudioContext;
    private scheduler: Scheduler;

    constructor(props: {}) {
        super(props);

        this.audioContext = createAudioContext();
        this.scheduler = new Scheduler(window, this.audioContext);
        this.scheduler.start();

        this.state.currentLesson.registerListener(this.handleLessonStateChange);
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps: {}, prevState: MainState) {
        if (this.state.hasStarted != prevState.hasStarted) {
            this.state.currentLesson.begin();
        }

        const nowCachedLessonState = this.state.cachedLessonState && !prevState.cachedLessonState;
        const hasWordIdChanged = (this.state.cachedLessonState && 
            (this.state.cachedLessonState.wordId != prevState.cachedLessonState?.wordId))
        if (nowCachedLessonState ||
            hasWordIdChanged) {
            setTimeout(() => {
                if (this.state.cachedLessonState && this.state.cachedLessonState.currentWord) {
                    // New word! Play it. Set a delay to not jolt people.
                    const notes = generateMorseNotes(this.audioContext, this.state.cachedLessonState.currentWord);
                    this.scheduler.clear();
                    this.scheduler.scheduleNotes(notes);
                }
            }, INTER_WORD_DURATION * 1000);
        }
    }

    private getStatusMessage(): string | null {
        if (!this.state.cachedLessonState) {
            return null;
        }

        switch(this.state.cachedLessonState.quizMode) {
            case QuizMode.VisibleSingle:
                // fallthrough
            case QuizMode.InvisibleSingle:
                return "(type the letter you hear)";
            case QuizMode.InvisibleWords:
                return "(type the words you hear)";
        }
    }

    render()
    {
        const shownWord = (this.state.cachedLessonState && this.state.cachedLessonState.quizMode === QuizMode.VisibleSingle)
            ? this.state.cachedLessonState.currentWord
            : null;
        return (
            <MainView
                hasStarted={this.state.hasStarted}
                shownWord={shownWord}
                statusMessage={this.getStatusMessage()}
                currentGuess={this.state.cachedLessonState?.currentGuess || ""}
                onBegin={this.handleBegin}
                onGuess={this.handleGuess}
                onStopRequest={this.handleStopRequest} />
        );
    }

    private handleBegin = () => {
        this.audioContext.resume();
        this.setState({
            hasStarted: true
        });
    }

    private handleGuess = (char: string) => {
        console.log(char);

        if (char === ' ') {
            // Restart.
            if (this.state.cachedLessonState && this.state.cachedLessonState.currentWord) {
                const notes = generateMorseNotes(this.audioContext, this.state.cachedLessonState.currentWord);
                this.scheduler.clear();
                this.scheduler.scheduleNotes(notes);
                
                return true;
            }
        } else {
            this.state.currentLesson.handleGuess(char);
        }

        return false;
    }

    private handleStopRequest = () => {
        console.log("Stopping!")
        this.scheduler.clear();
    }

    private handleLessonStateChange = () => {
        this.setState({
            cachedLessonState: getCachedLessonState(this.state.currentLesson)
        });
    }
}