import React from "react";

export interface PhrasePracticeTutorialViewProperties {
    onBegin: () => void
}

export default class PhrasePracticeTutorialView extends React.Component<PhrasePracticeTutorialViewProperties>
{
    private buttonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: PhrasePracticeTutorialViewProperties) {
        super(props);

        this.buttonRef = React.createRef<HTMLButtonElement>();
    }

    componentDidMount() {
        this.buttonRef.current?.focus();
    }

    render()
    {
        return (
            <section className="main">
                <h1>Learning phrases</h1>
                <p>
                    With 2 letters down, it's time to dive into <strong>phrases</strong>.
                </p>
                <p>
                    You will hear five different 5-letter words at full speed.
                    Don't worry! It's just 2 letters (for now),
                    and the space between words is lengthened.
                </p>
                <p>
                    Type the letters as you hear them. When you hear a space, type a space.
                </p>
                <p>
                    When you have typed all five words, you'll see how you did.
                </p>
                <button
                    onClick={this.handleBegin}
                    ref={this.buttonRef}
                    className="startButton">Get started!</button>
            </section>
        );
    }

    private handleBegin = () => {
        this.props.onBegin();
    }
}