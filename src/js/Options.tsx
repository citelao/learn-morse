import React from "react";
import Dialog from "./view/Dialog";
import { IRenderOptions } from "./audio/IRenderOptions";

export interface OptionsProperties {
    onChange: (change: Partial<IRenderOptions>) => void;
    state: IRenderOptions;
}

const PITCHES = [
    293.66, // D4
    311.13, // D#4
    329.63, // E4
    349.23, // F4
    369.99, // F#4
    392.0, // G4
    415.3, // G#4
    440.0, // A4
    466.16, // A#4
    493.88, // B4
    523.25, // C5
    554.37, // C#5
    587.33 // D5
];

function pitchToSlider(pitch: number): number {
    const index = PITCHES.indexOf(pitch);
    if (index === -1) {
        throw new Error(`Invalid pitch ${pitch}`);
    }

    return index;
}

function sliderToPitch(slider: number): number {
    if (slider < 0 || slider >= PITCHES.length) {
        throw new Error(`Invalid slider ${slider}`);
    }

    return PITCHES[slider];
}

export default class Options extends React.Component<OptionsProperties> {
    constructor(props: OptionsProperties) {
        super(props);
    }

    render() {
        return (
            <Dialog>
                <h1>Options</h1>

                <ul>
                    <li>
                        <label>
                            Speed
                            <input
                                type="range"
                                min="5"
                                max="50"
                                step="1"
                                value={this.props.state.codingSpeed}
                                onChange={this.handleSpeedChange}
                            />
                            ({this.props.state.codingSpeed}WPM)
                        </label>
                    </li>
                    <li>
                        <label>
                            Pitch
                            <input
                                type="range"
                                min="0"
                                max={PITCHES.length - 1}
                                step="1"
                                value={pitchToSlider(
                                    this.props.state.frequencyInHertz
                                )}
                                onChange={this.handlePitchChange}
                            />
                        </label>
                        ({this.props.state.frequencyInHertz}Hz)
                    </li>
                </ul>

                {/* TODO: put this with the slider */}
                {this.props.state.codingSpeed < 16 ? (
                    <p>We recommend choosing a speed &gt; 16WPM</p>
                ) : null}
            </Dialog>
        );
    }

    private handleSpeedChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newSpeed = parseInt(event.target.value);
        console.log(`New speed: ${newSpeed}`);
        this.props.onChange({
            codingSpeed: newSpeed
        });
    };

    private handlePitchChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newPitch = sliderToPitch(parseInt(event.target.value));
        console.log(`New pitch: ${newPitch}Hz`);
        this.props.onChange({
            frequencyInHertz: newPitch
        });
    };
}
