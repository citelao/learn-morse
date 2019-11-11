import React from "react";
import BeginView from "./BeginView";
import { IGuess } from "../LessonPlan";
import LetterView from "./quiz_view/LetterView";
import PhraseView from "./quiz_view/PhraseView";

export interface MainViewProperties {
    letter?: string,
    currentGuess: string,
    guessHistory: IGuess[],
    statusMessage: string | null,

    onGuess: (char: string) => boolean,
    onStopRequest: () => void,
}

export default class MainView extends React.Component<MainViewProperties>
{
    private inputRef: React.RefObject<HTMLInputElement>;

    constructor(props: MainViewProperties) {
        super(props);

        this.inputRef = React.createRef<HTMLInputElement>();
    }

    componentDidMount() {
        this.inputRef.current?.focus();
    }

    render()
    {
        const historyOffset = (this.props.guessHistory.length > 5)
            ? this.props.guessHistory.length - 5
            : 0;

        const trimmedHistory = this.props.guessHistory.slice(historyOffset, this.props.guessHistory.length)

        const guessHistory = <ol>
            {trimmedHistory.map((guess, index) => {
                return <li key={index + historyOffset}>
                    {guess.guess}
                </li>;
            })}
        </ol>;

        return (
            <section className="main">
                {guessHistory}
                {
                    (this.props.letter) 
                        ? <LetterView letter={this.props.letter} />
                        : null
                }
                {/* <PhraseView /> */}
                <input
                    onChange={this.handleChange}
                    value={this.props.currentGuess}
                    className="morseInput"
                    autoCorrect="off"
                    autoCapitalize="off"
                    ref={this.inputRef} />
                {
                    (this.props.statusMessage) 
                        ? <div className="status">{this.props.statusMessage}</div>
                        : null
                }
                <button className="startButton" onClick={this.handleStopRequest}>(stop)</button>
            </section>
        );
    }

    private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const shouldCancel = this.props.onGuess(e.target.value);
        if (shouldCancel) {
            e.preventDefault();
        }
    }

    private handleStopRequest = () => {
        this.props.onStopRequest();
        this.inputRef.current?.focus();
    }
}