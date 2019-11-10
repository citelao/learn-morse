import React from "react";

export interface MainViewProperties {
    hasStarted: boolean,

    shownWord: string | null,

    onBegin: () => void,
    onGuess: (char: string) => void
}

export default class MainView extends React.Component<MainViewProperties>
{
    constructor(props: MainViewProperties) {
        super(props);
    }

    render()
    {
        const input = (this.props.hasStarted)
            ? <input onKeyPress={this.handleKeyPress} />
            : <button onClick={this.handleBegin}>Begin!</button>;

        return (
            <section className="main">
                {
                    (this.props.shownWord) 
                        ? <div className="letter">{this.props.shownWord}</div>
                        : null
                }
                {input}
            </section>
        );
    }

    private handleBegin = () => {
        this.props.onBegin();
    }

    private handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        this.props.onGuess(e.key);
    }
}