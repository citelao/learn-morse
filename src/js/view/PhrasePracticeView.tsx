import React from "react";

export interface PhrasePracticeViewProperties {
    onBegin: () => void
}

export default class PhrasePracticeView extends React.Component<PhrasePracticeViewProperties>
{
    constructor(props: PhrasePracticeViewProperties) {
        super(props);
    }

    render()
    {
        return (
            <section className="main">
                <h1>Learning phrases</h1>
                <p>
                    This first lesson is about <em>understanding Morse</em>
                    and its timings.
                </p>
                <p>
                    You will hear five different 5-character words with random letters.
                    Each time you hear a character, type a key on the keyboard
                    (it doesn't matter which one).
                </p>
                <p>
                    When you hear a space, type a space.
                </p>
                <p>
                    Once you get the flow, we will actually name some of the letters.
                </p>
                <button onClick={this.handleBegin} className="startButton">Get started!</button>
            </section>
        );
    }

    private handleBegin = () => {
        this.props.onBegin();
    }
}