import React from "react";
import BeginView from "./BeginView";

export interface MainViewProperties {
    hasStarted: boolean,

    shownWord: string | null,
    currentGuess: string,
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

        return (
            <section className="main">
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