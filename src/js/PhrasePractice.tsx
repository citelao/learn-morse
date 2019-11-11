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
    currentGuess: string[],
    pendingGuess: string,
}

export default class PhrasePractice extends React.Component<PhrasePracticeProperties, PhrasePracticeState>
{
    state: PhrasePracticeState = {
        currentGuess: [],
        pendingGuess: ""
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
        const guessHistory = this.props.phrase.map((word, index): IGuess => {
            return {
                guess: (this.state.currentGuess[index])
                    ? this.state.currentGuess[index]
                    : "_ _ _ _ _"
            };
        });

        return (
            <MainView
                statusMessage={"Type the phrases you hear."}
                currentGuess={this.state.pendingGuess}
                guessHistory={guessHistory}
                onGuess={this.handleGuess}
                onStopRequest={this.handleStopRequest} />
        );
    }

    private handleGuess = (complete_guess: string): boolean => {
        console.log(complete_guess);

        const current_phrase_word_index = this.state.currentGuess.length;
        const current_phrase_word = this.props.phrase[current_phrase_word_index];

        const current_phrase_word_length = current_phrase_word.length;

        if (complete_guess.length === current_phrase_word_length) {
            // Submit!
            this.setState({
                currentGuess: [
                    ...this.state.currentGuess,
                    complete_guess
                ],
                pendingGuess: ""
            });
        } else {
            this.setState({
                pendingGuess: complete_guess
            });
        }

        return true;
    }

    private handleStopRequest = () => {
        this.props.onStopRequest();
    }
}