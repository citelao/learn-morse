import React from "react";
import { IGuess } from "../LessonPlan";
import LetterView from "./quiz_view/LetterView";

export interface MainViewProperties {
    letter?: string;
    currentGuess: string;
    guessHistory: IGuess[];
    statusMessage: string | null;

    onGuess: (char: string) => boolean;
    onStopRequest: () => void;
}

export default class MainView extends React.Component<MainViewProperties> {
    private inputRef: React.RefObject<HTMLInputElement>;

    constructor(props: MainViewProperties) {
        super(props);

        this.inputRef = React.createRef<HTMLInputElement>();
    }

    componentDidMount() {
        this.inputRef.current?.focus();
    }

    render() {
        const guessHistory = (
            <ol className="guesses">
                {this.props.guessHistory.map((guess, index) => {
                    return <li key={index}>{guess.guess}</li>;
                })}
            </ol>
        );

        return (
            <>
                {guessHistory}
                {this.props.letter ? (
                    <LetterView letter={this.props.letter} />
                ) : null}
                {/* <PhraseView /> */}
                <input
                    onChange={this.handleChange}
                    value={this.props.currentGuess}
                    className="morseInput"
                    autoCorrect="off"
                    autoCapitalize="off"
                    ref={this.inputRef}
                />
                {this.props.statusMessage ? (
                    <div className="status">{this.props.statusMessage}</div>
                ) : null}
                <button
                    className="stopButton"
                    onClick={this.handleStopRequest}
                    title="Stop"
                >
                    ■
                </button>
            </>
        );
    }

    private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const shouldCancel = this.props.onGuess(e.target.value);
        if (shouldCancel) {
            e.preventDefault();
        }
    };

    private handleStopRequest = () => {
        this.props.onStopRequest();
        this.inputRef.current?.focus();
    };
}
