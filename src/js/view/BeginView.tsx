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
                <hgroup className="title">
                    <h1>Morse Horse</h1>
                    <h2>Can a horse teach Morse? Of&nbsp;course!</h2>
                </hgroup>
                <img
                    src="/img/morse_horse.png"
                    className="logo"
                    alt="Cartoon horse smiling with two dashes on his nose to look like a mustache"
                />
                <button onClick={this.handleBegin} className="startButton">
                    Begin!
                </button>
                <h2>What is Morse Horse?</h2>
                <p>
                    <strong>Morse Horse</strong> is a Koch-method Morse trainer.
                </p>
                <p>
                    That basically means that Morse Horse introduces you to
                    letters one by one, slowly building up your vocabulary. It
                    also plays the letters at <em>nearly full speed</em>, though
                    with very long spaces between words.
                </p>
                <p>
                    This is empirically the fastest, most efficient way to learn
                    Morse code!
                </p>

                <h2>Resources</h2>
                <p>
                    This isn't the only app for learning Morse code!{" "}
                    <em>Though it is the horsiest.</em>
                </p>
                <p>There are some other great sites online:</p>
                <ul>
                    <li>
                        <a href="https://lcwo.net/">Learn CW Online</a>: the
                        inspiration for Morse Horse. It has its own Koch trainer
                        and letter practice app.
                    </li>
                </ul>

                <h2>Privacy</h2>
                <p>This app uses local storage to track your progress.</p>
                <p>That means that your data never leaves your device!</p>

                <small>
                    Morse Horse is by{" "}
                    <a href="https://ben.stolovitz.com/">Ben Stolovitz</a>.
                    Check it out on{" "}
                    <a href="https://github.com/citelao/learn-morse">GitHub</a>!
                </small>
            </section>
        );
    }

    private handleBegin = () => {
        this.props.onBegin();
    };
}
