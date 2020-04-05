import React from "react";

export interface LiveRegionAnnouncerProperties {}

interface LiveRegionAnnouncerState {
    message: string;
}

export default class LiveRegionAnnouncer extends React.Component<
    LiveRegionAnnouncerProperties,
    LiveRegionAnnouncerState
> {
    state: LiveRegionAnnouncerState = {
        message: "Foo!"
    };

    constructor(props: LiveRegionAnnouncerProperties) {
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
