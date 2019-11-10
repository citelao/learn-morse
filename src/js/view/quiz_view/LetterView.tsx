import React from "react";

export interface LetterViewProperties {
    letter: string
}

export default class LetterView extends React.Component<LetterViewProperties>
{
    constructor(props: LetterViewProperties) {
        super(props);
    }

    render()
    {
        return (
            <div className="letter">
                {this.props.letter}
            </div>
        );
    }
}