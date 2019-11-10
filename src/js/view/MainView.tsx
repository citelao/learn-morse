import React from "react";
import BeginView from "./BeginView";

export interface MainViewProperties {
    hasStarted: boolean,

    shownWord: string | null,

    onBegin: () => void,
    onGuess: (char: string) => void
}

export default class MainView extends React.Component<MainViewProperties>
{
    constructor(props: MainViewProperties) {
        super(props);
    }

    render()
    {
        if (!this.props.hasStarted) {
            return <BeginView
                onBegin={this.props.onBegin} />;
        }

        const input = (this.props.hasStarted)
            ? <input onKeyPress={this.handleKeyPress} className="morseInput" />
            : <button onClick={this.handleBegin} className="startButton">Begin!</button>;

        return (
            <section className="main">
                {
                    (this.props.shownWord) 
                        ? <div className="letter">{this.props.shownWord}</div>
                        : null
                }
                {input}
            </section>
        );
    }

    private handleBegin = () => {
        this.props.onBegin();
    }

    private handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        this.props.onGuess(e.key);
    }
}