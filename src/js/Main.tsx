import React from "react";

import Scheduler from "./audio/Scheduler";
import { generateMorseNotes } from "./audio/morse";
import { getLettersForLesson, generateWordForLesson } from "./LessonPlan";
import ListeningTutorialView from "./view/ListeningTutorialView";
import PhrasePracticeTutorialView from "./view/PhrasePracticeTutorialView";
import BeginView from "./view/BeginView";
import IntroduceLetter from "./IntroduceLetter";
import PhrasePractice from "./PhrasePractice";
import assert from "./assert";
import ContinueView from "./view/ContinueView";
import { ILearningState, ILessonState } from "./storage/LearningStateInterfaces";
import CookieStorage from "./storage/CookieStorage";

function createAudioContext(): AudioContext {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
}

type AppState =
    | "unstarted"
    | "unstarted_continue"
    | "tutorial_listening"
    | "introduce_listening"
    | "introduce_letter"
    | "tutorial_phrase_practice"
    | "phrase_practice";

const ENABLE_LISTENING_PRACTICE = false;

interface MainState {
    appState: AppState;

    learningState: ILearningState;
    lessonState?: ILessonState;
}

const storage = new CookieStorage();

function generateLessonState(learningState: ILearningState): ILessonState {
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

export default class Main extends React.Component<{}, MainState> {
    state: MainState = {
        appState: storage.hasStoredLearningState()
            ? "unstarted_continue"
            : "unstarted",
        learningState: storage.readLearningState()
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

        // Store a cookie of any new learning state!
        storage.storeLearningState(this.state.learningState);
    }

    render() {
        switch (this.state.appState) {
            case "unstarted":
                return <BeginView onBegin={this.handleBegin} />;
            case "unstarted_continue":
                return <ContinueView onBegin={this.handleBegin} />;
            case "tutorial_listening":
                return <ListeningTutorialView onBegin={this.handleBegin} />;
            case "introduce_listening":
                throw new Error("Listening practice is unimplemented");
            // return this.renderListeningPractice();
            case "introduce_letter": {
                const availableLetters = getLettersForLesson(
                    this.state.learningState.currentLesson
                );
                const currentLetter =
                    availableLetters[availableLetters.length - 1];
                return (
                    <IntroduceLetter
                        letter={currentLetter}
                        onRequestRenderMorse={this.renderMorse}
                        onStopRequest={this.handleStopRequest}
                        onSuccess={this.handleSuccess}
                    />
                );
            }
            case "tutorial_phrase_practice":
                return (
                    <PhrasePracticeTutorialView onBegin={this.handleBegin} />
                );
            case "phrase_practice":
                return (
                    <PhrasePractice
                        phrase={this.state.lessonState?.currentPhrase || []}
                        onRequestRenderMorse={this.renderMorse}
                        onStopRequest={this.handleStopRequest}
                        onSuccess={this.handleSuccess}
                        onFailure={this.handleFailure}
                    />
                );
        }

        // Compilation error if the switch is incomplete.
        const _exhaustive: never = this.state.appState;
        throw new Error(`Invalid render for state ${_exhaustive}`);
    }

    private handleBegin = () => {
        if (this.state.appState === "unstarted") {
            if (ENABLE_LISTENING_PRACTICE) {
                this.setState({
                    appState: "tutorial_listening"
                });
            } else {
                this.audioContext.resume();
                this.setState({
                    appState: "introduce_letter"
                });
            }
        } else if (this.state.appState === "unstarted_continue") {
            assert(
                !ENABLE_LISTENING_PRACTICE,
                "Continuation not specified for listening practice"
            );

            // Assume that the letter has already been introduced.
            this.audioContext.resume();
            this.setState({
                appState: "phrase_practice"
            });
        } else if (this.state.appState === "tutorial_listening") {
            this.audioContext.resume();
            this.setState({
                appState: "introduce_listening"
            });
        } else if (this.state.appState === "tutorial_phrase_practice") {
            this.setState({
                appState: "phrase_practice"
            });
        } else {
            throw new Error("Unexpected call of `handleBegin`");
        }
    };

    private handleSuccess = (accuracy?: number) => {
        if (this.state.appState === "introduce_letter") {
            // Special case learning the first letters:
            if (this.state.learningState.currentLesson === 1) {
                this.setState({
                    learningState: {
                        currentLesson:
                            this.state.learningState.currentLesson + 1,
                        history: this.state.learningState.history
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
        } else if (this.state.appState === "phrase_practice") {
            assert(accuracy !== undefined, "Must have accuracy.");

            this.setState({
                appState: "introduce_letter",
                learningState: {
                    currentLesson: this.state.learningState.currentLesson + 1,
                    history: [
                        ...this.state.learningState.history,
                        {
                            accuracy: accuracy,
                            lesson: this.state.learningState.currentLesson
                        }
                    ]
                }
            });
        } else {
            throw new Error("Unexpected call to `handleSuccess`");
        }
    };

    private handleFailure = (accuracy: number) => {
        assert(this.state.appState === "phrase_practice");

        // Get a new phrase and save the lesson state.
        this.setState({
            learningState: {
                currentLesson: this.state.learningState.currentLesson,
                history: [
                    ...this.state.learningState.history,
                    {
                        accuracy: accuracy,
                        lesson: this.state.learningState.currentLesson
                    }
                ]
            },
            lessonState: generateLessonState(this.state.learningState)
        });
    };

    private renderMorse = (phrase: string) => {
        console.log(`Rendering ${phrase}`);
        const notes = generateMorseNotes(this.audioContext, phrase);
        this.scheduler.clear();
        this.scheduler.scheduleNotes(notes);
    };

    private handleStopRequest = () => {
        console.log("Stopping!");
        this.scheduler.clear();
    };
}
