import React from "react";

import Scheduler, { INote } from "./audio/Scheduler";
import { generateMorseNotes, INTER_WORD_DURATION, getKochSpeeds } from "./audio/morse";
import MainView from "./view/MainView";
import LessonPlan, { QuizMode, IGuess, getLettersForLesson } from "./LessonPlan";
import ListeningTutorialView from "./view/ListeningTutorialView";
import PhrasePracticeView from "./view/PhrasePracticeView";
import BeginView from "./view/BeginView";
import IntroduceLetter from "./IntroduceLetter";

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

const ENABLE_LISTENING_PRACTICE = false;

// Replaces `lessonPlan`.
interface LearningState {
    currentLesson: number,
}

interface MainState {
    appState: AppState,

    learningState: LearningState,

    currentLesson: LessonPlan,
    cachedLessonState: ICachedLessonState | null
}

export default class Main extends React.Component<{}, MainState>
{
    state: MainState = {
        appState: "unstarted",
        learningState: {
            currentLesson: 1
        },
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
            // if (this.)
            // if (this.state.appState === "introduce_listening") {
            //     this.state.currentLesson.begin();
            // }
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
                    this.renderMorse(this.state.cachedLessonState.currentWord);
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
                this.renderMorse(phrase);
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
            case "unstarted":
                return <BeginView onBegin={this.handleBegin} />;
            case "tutorial_listening":
                return <ListeningTutorialView onBegin={this.handleBegin} />;
            case "introduce_listening":
                return this.renderListeningPractice();
            case "introduce_letter":
                const availableLetters = getLettersForLesson(this.state.learningState.currentLesson);
                const currentLetter = availableLetters[availableLetters.length - 1];
                return <IntroduceLetter
                    letter={currentLetter}
                    onRequestRenderMorse={this.renderMorse}
                    onStopRequest={this.handleStopRequest}
                    onSuccess={this.handleSuccess} />;
            case "tutorial_phrase_practice":
                return <PhrasePracticeView onBegin={this.handleBegin} />;
            case "phrase_practice":
                return null;
        }

        // const shownWord = (this.state.cachedLessonState && this.state.cachedLessonState.quizMode === QuizMode.VisibleSingle)
        //     ? this.state.cachedLessonState.currentWord
        //     : null;

        // const guessHistory = this.state.cachedLessonState?.guessHistory || [];
        // return (
        //     <MainView
        //         shownWord={shownWord}
        //         statusMessage={this.getStatusMessage()}
        //         currentGuess={this.state.cachedLessonState?.currentGuess || ""}
        //         guessHistory={guessHistory}
        //         onGuess={this.handleGuess}
        //         onStopRequest={this.handleStopRequest} />
        // );
    }

    private renderListeningPractice() {
        // TODO: this mode is not fully implemented.

        const handleGuess = (complete_guess: string): boolean => {
            return false;
        };

        return (
            <MainView
                shownWord={null}
                statusMessage={"(type any letter when you hear a letter, and type a space when you hear a space)"}
                currentGuess={""}
                guessHistory={[]}
                onGuess={handleGuess}
                onStopRequest={this.handleStopRequest} />
        );
    }

    private handleBegin = () => {
        if (this.state.appState === "unstarted") {
            if (ENABLE_LISTENING_PRACTICE) {
                this.setState({
                    appState: "tutorial_listening",
                });
            } else {
                this.audioContext.resume();
                this.setState({
                    appState: "introduce_letter",
                });
            }
        } else if (this.state.appState === "tutorial_listening") {
            this.audioContext.resume();
            this.setState({
                appState: "introduce_listening",
            });
        } else if (this.state.appState === "tutorial_phrase_practice") {
            this.setState({
                appState: "phrase_practice",
            });
        } else {
            throw new Error("Unexpected call of `handleBegin`")
        }
    }

    private handleSuccess = () => {
        if (this.state.appState === "introduce_letter") {
            // Special case learning the first letters:
            if (this.state.learningState.currentLesson === 1) {
                this.setState({
                    learningState: {
                        currentLesson: this.state.learningState.currentLesson + 1
                    }
                });
            } else if (this.state.learningState.currentLesson === 2) {
                this.setState({
                    appState: "tutorial_phrase_practice"
                });
            } else {
                this.setState({
                    appState: "phrase_practice"
                });
            }
        }
    }

    private renderMorse = (phrase: string) => {
        console.log(`Rendering ${phrase}`);
        const notes = generateMorseNotes(this.audioContext, phrase);
        this.scheduler.clear();
        this.scheduler.scheduleNotes(notes);
    }

    private handleGuess = (char: string) => {
        console.log(char);

        if (char === ' ') {
            // Restart.
            if (this.state.cachedLessonState && this.state.cachedLessonState.currentWord) {
                this.renderMorse(this.state.cachedLessonState.currentWord);

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