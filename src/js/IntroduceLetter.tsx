import React from "react";
import MainView from "./view/MainView";

export interface IntroduceLetterProperties {
    letter: string,
    
    onRequestRenderMorse: (phrase: string) => void,
    onStopRequest: () => void,
}

interface IntroduceLetterState {
    // currentGuess: string,
}

export default class IntroduceLetter extends React.Component<IntroduceLetterProperties, IntroduceLetterState>
{
    state: IntroduceLetterState = {
        currentGuess: ""
    };

    constructor(props: IntroduceLetterProperties) {
        super(props);
    }

    componentDidMount() {
        this.props.onRequestRenderMorse(this.props.letter);
    }

    render()
    {
        return (
            <MainView
                shownWord={this.props.letter}
                statusMessage={"Type the letter you hear. Press space to repeat."}
                currentGuess={""}
                guessHistory={[]}
                onGuess={this.handleGuess}
                onStopRequest={this.handleStopRequest} />
        );
    }

    private handleGuess = (complete_guess: string): boolean => {
        console.log(complete_guess);

        if (complete_guess === " ") {
            this.props.onRequestRenderMorse(this.props.letter);
        }

        if (complete_guess === this.props.letter) {
        }

        // TODO: unnecessary.
        return true;
    }

    private handleStopRequest = () => {
        this.props.onStopRequest();
    }
}