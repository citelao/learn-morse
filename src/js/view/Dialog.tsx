import React from "react";

export interface DialogProperties {
    // letter: string;
}

export interface DialogState {
    isOpen: boolean;
}

export default class Dialog extends React.Component<
    DialogProperties,
    DialogState
> {
    private dialogRef: React.RefObject<HTMLDialogElement>;

    constructor(props: DialogProperties) {
        super(props);

        this.dialogRef = React.createRef();

        this.state = {
            isOpen: true
        };

        // this.dialogRef.current?.showModal
    }

    render() {
        return (
            <dialog open={this.state.isOpen} ref={this.dialogRef}>
                <form method="dialog">
                    {this.props.children}
                    <button value="close">Close</button>
                </form>
            </dialog>
        );
    }
}
