import React from "react";

import Scheduler, { INote } from "./audio/Scheduler";
import { generateMorseNotes, INTER_WORD_DURATION, getKochSpeeds } from "./audio/morse";
import MainView from "./view/MainView";
import { QuizMode, IGuess, getLettersForLesson, generateWordForLesson } from "./LessonPlan";
import ListeningTutorialView from "./view/ListeningTutorialView";
import PhrasePracticeTutorialView from "./view/PhrasePracticeTutorialView";
import BeginView from "./view/BeginView";
import IntroduceLetter from "./IntroduceLetter";
import PhrasePractice from "./PhrasePractice";

function createAudioContext(): AudioContext {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
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

interface LessonState {
    currentPhrase: string[]
}

interface MainState {
    appState: AppState,

    learningState: LearningState,
    lessonState?: LessonState,
}

function generateLessonState(learningState: LearningState): LessonState {
    const phrase: string[] = [];
    const PHRASE_LENGTH = 6;
    for (let index = 0; index < PHRASE_LENGTH; index++) {
        phrase.push(generateWordForLesson(learningState.currentLesson));
    }

    console.log(`generateLessonState - phrase [${phrase}]`);
    return {
        currentPhrase: phrase
    };
}

export default class Main extends React.Component<{}, MainState>
{
    state: MainState = {
        appState: "unstarted",
        learningState: {
            currentLesson: 1
        },
    };
    // state: MainState = {
    //     appState: "phrase_practice",
    //     learningState: {
    //         currentLesson: 2
    //     },
    // };

    private audioContext: AudioContext;
    private scheduler: Scheduler;

    constructor(props: {}) {
        super(props);

        this.audioContext = createAudioContext();
        this.scheduler = new Scheduler(window, this.audioContext);
        this.scheduler.start();
    }

    componentDidMount() {
        if (this.state.appState === "phrase_practice") {
            this.setState({
                lessonState: generateLessonState(this.state.learningState)
            });
        }
    }

    componentDidUpdate(prevProps: {}, prevState: MainState) {
        if (this.state.appState != prevState.appState) {
            if (this.state.appState === "phrase_practice") {
                this.setState({
                    lessonState: generateLessonState(this.state.learningState)
                });
            }
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
                return <PhrasePracticeTutorialView onBegin={this.handleBegin} />;
            case "phrase_practice":
                return <PhrasePractice
                    phrase={this.state.lessonState?.currentPhrase || []}
                    onRequestRenderMorse={this.renderMorse}
                    onStopRequest={this.handleStopRequest}
                    onSuccess={this.handleSuccess}
                    />;
        }
    }

    private renderListeningPractice() {
        // TODO: this mode is not fully implemented.

        const handleGuess = (complete_guess: string): boolean => {
            return false;
        };

        return (
            <MainView
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
        } else {
            throw new Error("Unexpected call to `handleSuccess`");
        }
    }

    private renderMorse = (phrase: string) => {
        console.log(`Rendering ${phrase}`);
        const notes = generateMorseNotes(this.audioContext, phrase);
        this.scheduler.clear();
        this.scheduler.scheduleNotes(notes);
    }

    private handleStopRequest = () => {
        console.log("Stopping!")
        this.scheduler.clear();
    }
}