import React from "react";
import BeginView from "./BeginView";

export interface MainViewProperties {
    hasStarted: boolean,

    shownWord: string | null,

    onBegin: () => void,
    onGuess: (char: string) => void,
    onStopRequest: () => void,
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

        return (
            <section className="main">
                {
                    (this.props.shownWord) 
                        ? <div className="letter">{this.props.shownWord}</div>
                        : null
                }
                <button className="startButton" onClick={this.handleStopRequest}>(stop)</button>
                <input onKeyPress={this.handleKeyPress} className="morseInput" />
            </section>
        );
    }

    private handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        this.props.onGuess(e.key);
    }

    private handleStopRequest = () => {
        this.props.onStopRequest();
    }
}