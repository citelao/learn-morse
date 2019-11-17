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
                <h1>Learn morse!</h1>
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
