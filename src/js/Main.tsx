import React from "react";

import Scheduler, { INote } from "./audio/Scheduler";
import { generateMorseNotes, INTER_WORD_DURATION, getKochSpeeds } from "./audio/morse";
import MainView from "./view/MainView";
import LessonPlan, { QuizMode, IGuess } from "./LessonPlan";
import ListeningTutorialView from "./view/ListeningTutorialView";

function createAudioContext(): AudioContext {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
}

interface ICachedLessonState {
    currentWord: string | null;
    wordId: number | null;
    currentPhrase: string[] | null;
    currentGuess: string;
    guessHistory: IGuess[];
    quizMode: QuizMode;
}
function getCachedLessonState(lessonPlan: LessonPlan) {
    const state: ICachedLessonState = {
        currentWord: lessonPlan.getCurrentWord(),
        wordId: lessonPlan.getWordId(),
        currentPhrase: lessonPlan.getCurrentPhrase(),
        currentGuess: lessonPlan.getCurrentGuess(),
        guessHistory: lessonPlan.getGuessHistory(),
        quizMode: lessonPlan.getQuizMode(),
    };
    return state;
}

type AppState = 
    "unstarted" |
    "tutorial_listening" |
    "introduce_listening" |
    "introduce_letter" |
    "tutorial_phrase_practice" |
    "phrase_practice";

interface MainState {
    appState: AppState,

    currentLesson: LessonPlan,
    cachedLessonState: ICachedLessonState | null
}

export default class Main extends React.Component<{}, MainState>
{
    state: MainState = {
        appState: "unstarted",
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
        if (this.state.appState != prevState.appState) {
            if (this.state.appState === "introduce_listening") {
                this.state.currentLesson.begin();
            }
        }

        const nowCachedLessonState = this.state.cachedLessonState && !prevState.cachedLessonState;
        const hasWordIdChanged = (this.state.cachedLessonState && 
            (this.state.cachedLessonState.wordId != prevState.cachedLessonState?.wordId))
        const shouldReadNewWords = (this.state.cachedLessonState?.quizMode !== QuizMode.InvisiblePhrase);
        if (shouldReadNewWords && 
            (nowCachedLessonState || hasWordIdChanged)) {
            setTimeout(() => {
                if (this.state.cachedLessonState && this.state.cachedLessonState.currentWord) {
                    // New word! Play it. Set a delay to not jolt people.
                    const notes = generateMorseNotes(this.audioContext, this.state.cachedLessonState.currentWord);
                    this.scheduler.clear();
                    this.scheduler.scheduleNotes(notes);
                }
            }, getKochSpeeds(20, 6).inter_word_duration_seconds * 1000);
        }

        const shouldReadNewPhrases = (this.state.cachedLessonState?.quizMode === QuizMode.InvisiblePhrase);
        const hasPhraseChanged = (this.state.cachedLessonState &&
            (this.state.cachedLessonState.currentPhrase !== prevState.cachedLessonState?.currentPhrase))
        if (shouldReadNewPhrases &&
            (hasPhraseChanged || nowCachedLessonState)) {
            if (this.state.cachedLessonState && this.state.cachedLessonState.currentPhrase) {
                // New phrase! Play it. Set a delay to not jolt people.
                const phrase = this.state.cachedLessonState?.currentPhrase.join(" ");
                const notes = generateMorseNotes(this.audioContext, phrase);
                this.scheduler.clear();
                this.scheduler.scheduleNotes(notes);
            }
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
                return "(type the letter you hear; press space to repeat)";
            case QuizMode.InvisibleWord:
                return `(type the words you hear 1/N)`;
            case QuizMode.InvisiblePhrase:
                return "(translate several words as they come)";
        }
    }

    render()
    {
        switch (this.state.appState) {
            case "tutorial_listening":
                return <ListeningTutorialView onBegin={this.handleBegin} />;
            case "introduce_listening":
                return this.renderListeningPractice();
            default:
                // Nothing.
        }

        const shownWord = (this.state.cachedLessonState && this.state.cachedLessonState.quizMode === QuizMode.VisibleSingle)
            ? this.state.cachedLessonState.currentWord
            : null;

        const guessHistory = this.state.cachedLessonState?.guessHistory || [];
        return (
            <MainView
                hasStarted={this.state.appState !== "unstarted"}
                shownWord={shownWord}
                statusMessage={this.getStatusMessage()}
                currentGuess={this.state.cachedLessonState?.currentGuess || ""}
                guessHistory={guessHistory}
                onBegin={this.handleBegin}
                onGuess={this.handleGuess}
                onStopRequest={this.handleStopRequest} />
        );
    }

    private renderListeningPractice() {
        return (
            <MainView
                hasStarted={true}
                shownWord={"k"}
                statusMessage={"TODO"}
                currentGuess={""}
                guessHistory={[]}
                onBegin={this.handleBegin}
                onGuess={this.handleGuess}
                onStopRequest={this.handleStopRequest} />
        );
    }

    private handleBegin = () => {
        if (this.state.appState === "unstarted") {
            this.setState({
                appState: "tutorial_listening",
            });
        } else if (this.state.appState === "tutorial_listening") {
            this.audioContext.resume();
            this.setState({
                appState: "introduce_listening",
            });
        }
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