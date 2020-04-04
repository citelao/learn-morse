import React from "react";

export interface ContinueViewProperties {
    onBegin: () => void;
}

export default class ContinueView extends React.Component<BeginViewProperties> {
    constructor(props: BeginViewProperties) {
        super(props);
    }

    render() {
        return (
            <section className="main">
                <h1>Morse Horse: "learn more Morse!"</h1>
                <p>Welcome back! Jump back into your Morse.</p>
                <img
                    src="/img/morse_horse_600w.png"
                    className="logo"
                    alt="Cartoon horse smiling with two dashes on his nose to look like a mustache"
                />
                <button onClick={this.handleBegin} className="startButton">
                    Continue!
                </button>
            </section>
        );
    }

    private handleBegin = () => {
        this.props.onBegin();
    };
}
