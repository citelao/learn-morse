import React from "react";
import BeginView from "./BeginView";
import { IGuess } from "../LessonPlan";

export interface MainViewProperties {
    hasStarted: boolean,

    shownWord: string | null,
    currentGuess: string,
    guessHistory: IGuess[],
    statusMessage: string | null,

    onBegin: () => void,
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

    componentDidUpdate(prevProps: MainViewProperties) {
        if(this.props.hasStarted != prevProps.hasStarted) {
            this.inputRef.current?.focus();
        }
    }

    render()
    {
        if (!this.props.hasStarted) {
            return <BeginView
                onBegin={this.props.onBegin} />;
        }

        const guessHistory = <ol>
            {this.props.guessHistory.map((guess) => {
                return <li>
                    {guess.guess}
                </li>;
            })}
        </ol>;

        return (
            <section className="main">
                {guessHistory}
                {
                    (this.props.shownWord) 
                        ? <div className="letter">{this.props.shownWord}</div>
                        : null
                }
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