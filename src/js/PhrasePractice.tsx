import React from "react";
import MainView from "./view/MainView";
import { IGuess } from "./LessonPlan";

export interface PhrasePracticeProperties {
    phrase: string[],
    
    onRequestRenderMorse: (phrase: string) => void,
    onStopRequest: () => void,

    onSuccess: () => void,
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

            // TODO: this only measures 100% correctness.
            // TODO: should use Levenshteim distance
            const isCorrect = this.props.phrase.every((value, index) => {
                return value === guesses[index];
            });

            if (isCorrect) {
                this.props.onSuccess();
            } else {
                // TODO: get a new phrase
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