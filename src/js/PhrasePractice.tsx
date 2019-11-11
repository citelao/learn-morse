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
            // this.props.onRequestRenderMorse(this.props.phrase.join(" "));
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
                    ? guesses[index]
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

        const guesses = this.state.currentGuess.split(" ");

        if (guesses.length > this.props.phrase.length) {
            // We have completed this phrase. Ready to submit it for grading.
            // TODO.
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