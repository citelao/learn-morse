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
                <h1>Learn Morse!</h1>
                <p>Welcome back! Jump back into your Morse.</p>
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
