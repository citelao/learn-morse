import React from "react";

export interface PhraseViewProperties {
    // letter: string
}

export default class PhraseView extends React.Component<PhraseViewProperties>
{
    constructor(props: PhraseViewProperties) {
        super(props);
    }

    render()
    {
        return (
            <div className="phrase">
                <p>_ _ _ _ _</p>
                <p>_ _ _ _ _</p>
                <p>_ _ _ _ _</p>
                <p>_ _ _ _ _</p>
                <p>_ _ _ _ _</p>
            </div>
        );
    }
}