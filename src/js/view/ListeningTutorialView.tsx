import React from "react";

export interface ListeningTutorialViewProperties {
    onBegin: () => void;
}

export default class ListeningTutorialView extends React.Component<
    ListeningTutorialViewProperties
> {
    private buttonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: ListeningTutorialViewProperties) {
        super(props);

        this.buttonRef = React.createRef<HTMLButtonElement>();
    }

    componentDidMount() {
        this.buttonRef.current?.focus();
    }

    render() {
        return (
            <section className="main">
                <h1>Learn to listen</h1>
                <p>
                    This first lesson is about <em>understanding Morse</em>
                    and its timings.
                </p>
                <p>
                    You will hear five different 5-character words with random
                    letters. Each time you hear a character, type a key on the
                    keyboard (it doesn't matter which one).
                </p>
                <p>When you hear a space, type a space.</p>
                <p>
                    Once you get the flow, we will actually name some of the
                    letters.
                </p>
                <button
                    onClick={this.handleBegin}
                    ref={this.buttonRef}
                    className="startButton"
                >
                    Get started!
                </button>
            </section>
        );
    }

    private handleBegin = () => {
        this.props.onBegin();
    };
}
