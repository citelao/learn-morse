import { INote } from "./Scheduler";

/**
 * Time when the set value reaches 63.2% of its desired value
 * (https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime)
 **/
const DECAY_CONSTANT_IN_SECONDS = 0.01;

// Volumes to decay to.
const MAX_VOLUME = 1;
const MIN_VOLUME = 0;

function createSineOscillator(
    context: AudioContext,
    frequencyInHertz: number
): OscillatorNode {
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequencyInHertz, context.currentTime);
    return osc;
}

/** Represents an oscillator attached to a gain node. */
interface IOscillatorPair {
    oscillator: OscillatorNode;
    gain: GainNode;
}

/**
 * Create a sine oscillator connected to a gain node.
 *
 * The oscillator is always "playing," but the gain node is set to 0.
 */
function createPleasantSineOscillator(
    context: AudioContext,
    frequencyInHertz: number
): IOscillatorPair {
    const osc = createSineOscillator(context, frequencyInHertz);
    const gain = context.createGain();

    gain.gain.setValueAtTime(0, context.currentTime);
    osc.connect(gain);
    osc.start();

    return {
        oscillator: osc,
        gain: gain
    };
}

export function generateSineNote(options: {
    context: AudioContext;
    duration: number;
    frequencyInHertz: number;
    timeFromNowInSeconds?: number;
}): INote[] {
    const timeFromNowInSeconds = options.timeFromNowInSeconds || 0;

    const oscillator = createPleasantSineOscillator(
        options.context,
        options.frequencyInHertz
    );
    oscillator.gain.connect(options.context.destination);

    let wasStarted = false;
    return [
        {
            timeFromNowInSeconds: timeFromNowInSeconds,
            callback: currentTime => {
                oscillator.gain.gain.setTargetAtTime(
                    MAX_VOLUME,
                    currentTime,
                    DECAY_CONSTANT_IN_SECONDS
                );
                wasStarted = true;
            }
        },
        {
            timeFromNowInSeconds: timeFromNowInSeconds + options.duration,
            callback: currentTime => {
                oscillator.gain.gain.setTargetAtTime(
                    MIN_VOLUME,
                    currentTime,
                    DECAY_CONSTANT_IN_SECONDS
                );
            },
            cancellationCallback: currentTime => {
                if (wasStarted) {
                    oscillator.gain.gain.setTargetAtTime(
                        MIN_VOLUME,
                        currentTime,
                        DECAY_CONSTANT_IN_SECONDS
                    );
                }
            }
        }
    ];
}
