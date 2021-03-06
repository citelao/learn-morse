import React from "react";
import MainView from "./view/MainView";
import { IGuess } from "./LessonPlan";
import levenshtein from "js-levenshtein";

export interface PhrasePracticeProperties {
    phrase: string[];

    onRequestRenderMorse: (phrase: string) => void;
    onStopRequest: () => void;

    onSuccess: (accuracy: number) => void;
    onFailure: (accuracy: number) => void;
}

interface PhrasePracticeState {
    currentGuess: string;
    isReview: boolean;
}

function gradeGuess(phrase: string[], guesses: string[]): number {
    // Koch had a metric of "90% accuracy," though it is not entirely
    // clear what that denoted. To better handle accidental skipped
    // characters, use the Levenshtein distance between our guesses and
    // the ground truth.
    //
    // Try to respect the "90% accuracy" as "90% of the characters
    // correct." That means, for each character, there should be at most
    // 0.1 Levenshtein "errors."
    const distance = phrase.map((word, index) => {
        return levenshtein(guesses[index], word);
    });
    console.log(`[${distance}]`);

    const error = distance.reduce((runningTotalError, error) => {
        return runningTotalError + error;
    }, 0);
    const totalCharacters = phrase.reduce<number>((runningTotalChars, word) => {
        return runningTotalChars + word.length;
    }, 0);
    const errorPercentage = error / totalCharacters;

    return 1 - errorPercentage;
}

export default class PhrasePractice extends React.Component<
    PhrasePracticeProperties,
    PhrasePracticeState
> {
    state: PhrasePracticeState = {
        currentGuess: "",
        isReview: false
    };

    constructor(props: PhrasePracticeProperties) {
        super(props);
    }

    componentDidMount() {
        this.props.onRequestRenderMorse(this.props.phrase.join(" "));
    }

    componentDidUpdate(prevProps: PhrasePracticeProperties) {
        if (prevProps.phrase != this.props.phrase) {
            this.props.onRequestRenderMorse(this.props.phrase.join(" "));
            this.setState({
                currentGuess: "",
                isReview: false
            });
        }
    }

    render() {
        if (this.state.isReview) {
            return this.renderReview();
        }

        // Generate dash strings for remaining phrases:
        const guesses = this.state.currentGuess.split(" ");

        // Don't print the one we are still typing:
        guesses.pop();

        console.log(guesses);
        const guessHistory = this.props.phrase.map(
            (word, index): IGuess => {
                return {
                    guess: guesses[index]
                        ? guesses[index].split("").join(" ")
                        : "_ _ _ _ _"
                };
            }
        );

        return (
            <section className="main">
                <MainView
                    statusMessage={
                        "Type the phrases you hear. Press space at the end of the word."
                    }
                    currentGuess={this.state.currentGuess}
                    guessHistory={guessHistory}
                    onGuess={this.handleGuess}
                    onStopRequest={this.handleStopRequest}
                />
            </section>
        );
    }

    private renderReview() {
        const guesses = this.state.currentGuess.split(" ");

        const results = guesses.map((guess, index) => {
            const truth = this.props.phrase[index];

            const true_difference = levenshtein(truth, guess);
            const letterwise_diff = truth
                .split("")
                .map((true_letter, index) => {
                    const guess_letter = guess.split("")[index];
                    if (guess_letter !== true_letter) {
                        return true_letter;
                    } else {
                        return " ";
                    }
                });

            const correct_letters = guess
                .split("")
                .map((guess_letter, index) => {
                    const is_correct = letterwise_diff[index] === " ";
                    return is_correct ? (
                        <span key={index}>{guess_letter} </span>
                    ) : (
                        <strong key={index}>
                            <u>{guess_letter}</u>{" "}
                        </strong>
                    );
                });

            const error_string =
                true_difference > 0 ? ` (Errors: ${true_difference})` : "";

            console.log(`Diff: '${letterwise_diff.join(" ")}'`);

            return (
                <li key={index}>
                    <p className="guess">{...correct_letters}</p>
                    <p className="truth">
                        {letterwise_diff.join(" ")}
                        {error_string}
                    </p>
                </li>
            );
        });

        const accuracy = gradeGuess(this.props.phrase, guesses);

        return (
            <section className="main">
                <h1>Review</h1>
                <p>Accuracy: {(accuracy * 100).toFixed(2)}%</p>
                <ol className="guesses">{...results}</ol>
                <button onClick={this.handleContinue} className="startButton">
                    Continue!
                </button>
            </section>
        );
    }

    private handleGuess = (complete_guess: string): boolean => {
        console.log(complete_guess);

        const guesses = complete_guess.split(" ");
        const lastChar = complete_guess[complete_guess.length - 1];

        const isEnoughGuesses = guesses.length > this.props.phrase.length;
        const lastCharWasSpace = lastChar === " ";
        const isFinished = isEnoughGuesses && lastCharWasSpace;
        if (isFinished) {
            // We have completed this phrase. Ready to submit it for grading.
            // There might be more cues to submit that reveal themselves with
            // user testing.
            console.log(
                `Guesses & actual: \n[${guesses}]\n[${this.props.phrase}]`
            );

            this.props.onStopRequest();
            this.setState({
                isReview: true
            });
        } else {
            this.setState({
                currentGuess: complete_guess
            });
        }

        return true;
    };

    private handleStopRequest = () => {
        this.props.onStopRequest();
    };

    private handleContinue = () => {
        const accuracy = gradeGuess(
            this.props.phrase,
            this.state.currentGuess.split(" ")
        );
        console.log(`Accuracy: ${accuracy * 100}%`);

        const DESIRED_ACCURACY = 0.9;
        if (accuracy >= DESIRED_ACCURACY) {
            this.props.onSuccess(accuracy);
        } else {
            this.props.onFailure(accuracy);
        }
    };
}
