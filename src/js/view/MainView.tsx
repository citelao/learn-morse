import React from "react";
import { IGuess } from "../LessonPlan";
import LetterView from "./quiz_view/LetterView";
import Dialog from "./Dialog";
import Options from "../Options";
import { IRenderOptions } from "../audio/IRenderOptions";

export interface MainViewProperties {
    letter?: string;
    currentGuess: string;
    guessHistory: IGuess[];
    statusMessage: string | null;
    renderOptions: IRenderOptions;

    onGuess: (char: string) => boolean;
    onStopRequest: () => void;
    onOptionsChange: (change: Partial<IRenderOptions>) => void;
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
                    className="startButton"
                    onClick={this.handleStopRequest}
                >
                    (stop)
                </button>
                <button
                    className="optionsButton"
                    onClick={this.handleOptionsRequest}
                >
                    Options
                </button>
                <Options
                    onChange={this.props.onOptionsChange}
                    state={this.props.renderOptions}
                />
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

    private handleOptionsRequest = () => {

    };
}
