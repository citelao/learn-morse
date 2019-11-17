import React from "react";

export interface BeginViewProperties {
    onBegin: () => void;
}

export default class BeginView extends React.Component<BeginViewProperties> {
    constructor(props: BeginViewProperties) {
        super(props);
    }

    render() {
        return (
            <section className="main">
                <h1>Learn Morse!</h1>
                <p>
                    This app uses cookies to track your progress. By clicking OK,
                    you consent to a cookie that tracks your lesson state and
                    accuracy history.
                </p>
                <p>
                    We use this to generate good lessons for you.
                </p>
                <button onClick={this.handleBegin} className="startButton">
                    Begin!
                </button>
            </section>
        );
    }

    private handleBegin = () => {
        this.props.onBegin();
    };
}
