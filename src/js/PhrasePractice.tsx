import React from "react";
import MainView from "./view/MainView";

export interface PhrasePracticeProperties {
    phrase: string,
    
    onRequestRenderMorse: (phrase: string) => void,
    onStopRequest: () => void,

    onSuccess: () => void,
}

interface PhrasePracticeState {
    // currentGuess: string,
}

export default class PhrasePractice extends React.Component<PhrasePracticeProperties, PhrasePracticeState>
{
    state: PhrasePracticeState = {
        // currentGuess: ""
    };

    constructor(props: PhrasePracticeProperties) {
        super(props);
    }

    componentDidMount() {
        this.props.onRequestRenderMorse(this.props.phrase);
    }

    componentDidUpdate(prevProps: PhrasePracticeProperties) {
        if (prevProps.phrase != this.props.phrase) {
            this.props.onRequestRenderMorse(this.props.phrase);
        }
    }

    render()
    {
        return (
            <MainView
                shownWord={this.props.phrase}
                statusMessage={"Type the phrase you hear. Press space to repeat."}
                currentGuess={""}
                guessHistory={[]}
                onGuess={this.handleGuess}
                onStopRequest={this.handleStopRequest} />
        );
    }

    private handleGuess = (complete_guess: string): boolean => {
        console.log(complete_guess);

        if (complete_guess === " ") {
            this.props.onRequestRenderMorse(this.props.phrase);
        }

        if (complete_guess === this.props.phrase) {
            this.props.onSuccess();
        }

        // TODO: unnecessary.
        return true;
    }

    private handleStopRequest = () => {
        this.props.onStopRequest();
    }
}