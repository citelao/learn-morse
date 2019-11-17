import React from "react";
import MainView from "./view/MainView";
import { IGuess } from "./LessonPlan";
import levenshtein from "js-levenshtein";

export interface PhrasePracticeProperties {
    phrase: string[],
    
    onRequestRenderMorse: (phrase: string) => void,
    onStopRequest: () => void,

    onSuccess: () => void,
    onFailure: (errorPercentage: number) => void,
}

interface PhrasePracticeState {
    currentGuess: string,
}

export default class PhrasePractice extends React.Component<PhrasePracticeProperties, PhrasePracticeState>
{
    state: PhrasePracticeState = {
        currentGuess: "",
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
                currentGuess: ""
            });
        }
    }

    render()
    {
        // Generate dash strings for remaining phrases:
        const guesses = this.state.currentGuess.split(" ");
        
        // Don't print the one we are still typing:
        guesses.pop();

        console.log(guesses);
        const guessHistory = this.props.phrase.map((word, index): IGuess => {
            return {
                guess: (guesses[index])
                    ? guesses[index].split("").join(" ")
                    : "_ _ _ _ _"
            };
        });

        return (
            <section className="main">
                <MainView
                    statusMessage={"Type the phrases you hear. Press space at the end of the word."}
                    currentGuess={this.state.currentGuess}
                    guessHistory={guessHistory}
                    onGuess={this.handleGuess}
                    onStopRequest={this.handleStopRequest} />
            </section>
        );
    }

    private handleGuess = (complete_guess: string): boolean => {
        console.log(complete_guess);

        const guesses = complete_guess.split(" ");
        const lastChar = complete_guess[complete_guess.length - 1];

        const isEnoughGuesses = (guesses.length > this.props.phrase.length);
        const lastCharWasSpace = lastChar === " ";
        const isFinished = (isEnoughGuesses && lastCharWasSpace);
        if (isFinished) {
            // We have completed this phrase. Ready to submit it for grading.
            // There might be more cues to submit that reveal themselves with
            // user testing.
            console.log(`Guesses & actual: \n[${guesses}]\n[${this.props.phrase}]`);

            // Koch had a metric of "90% accuracy," though it is not entirely
            // clear what that denoted. To better handle accidental skipped
            // characters, use the Levenshtein distance between our guesses and
            // the ground truth.
            //
            // Try to respect the "90% accuracy" as "90% of the characters
            // correct." That means, for each character, there should be at most
            // 0.1 Levenshtein "errors."
            const distance = this.props.phrase.map((value, index) => {
                return levenshtein(guesses[index], value);
            });
            console.log(`[${distance}]`);

            const error = distance.reduce((runningTotalError, error) => {
                return runningTotalError + error;
            }, 0);
            const totalCharacters = this.props.phrase.reduce<number>((runningTotalChars, word) => {
                return runningTotalChars + word.length;
            }, 0);
            const errorPercentage = error / totalCharacters;
            console.log(`Error: ${errorPercentage * 100}%`);
            
            const DESIRED_ACCURACY = 0.9;
            if ((1 - errorPercentage) >= DESIRED_ACCURACY) {
                // TODO: we should keep track of this accuracy for later.
                this.props.onSuccess();
            } else {
                this.props.onFailure(errorPercentage);
            }

        } else {
            this.setState({
                currentGuess: complete_guess
            });
        }

        return true;
    }

    private handleStopRequest = () => {
        this.props.onStopRequest();
    }
}