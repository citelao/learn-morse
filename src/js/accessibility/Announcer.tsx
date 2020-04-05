import React from "react";

export interface AnnouncerProperties {}

interface AnnouncerState {
    message: string;
}

export default class Announcer extends React.Component<
    AnnouncerProperties,
    AnnouncerState
> {
    state: AnnouncerState = {
        message: "Foo!"
    };

    constructor(props: AnnouncerProperties) {
        super(props);

        setTimeout(() => {
            this.setState({
                message: "Just you wait!"
            });
        }, 3000);

        setTimeout(() => {
            this.setState({
                message: "Just you date!"
            });
        }, 5000);
    }

    render() {
        return (
            <div aria-live="polite" onClick={this.handleClick}>
                {this.state.message}
            </div>
        );
    }

    handleClick = () => {
        this.setState({
            message: "Hi!"
        });
    };
}
