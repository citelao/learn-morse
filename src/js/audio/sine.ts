import { INote } from "./Scheduler";

/** A number close to 0 but not quite 0 so we can exponentially decay to it. */
const EPSILON = 0.00001;

function createSineOscillator(context: AudioContext, frequencyInHertz: number): OscillatorNode {
    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequencyInHertz, context.currentTime);
    return osc;
}

/** Represents an oscillator attached to a gain node. */
interface IOscillatorPair {
    oscillator: OscillatorNode,
    gain: GainNode
}

/**
 * Create a sine oscillator connected to a gain node.
 * 
 * The oscillator is always "playing," but the gain node is set to 0.
 */
function createPleasantSineOscillator(context: AudioContext, frequencyInHertz: number): IOscillatorPair
{
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
    context: AudioContext,
    duration: number,
    frequencyInHertz: number,
    timeFromNowInSeconds?: number
}): INote[] {
    const timeFromNowInSeconds = (options.timeFromNowInSeconds) || 0;

    const oscillator = createPleasantSineOscillator(options.context, options.frequencyInHertz);
    oscillator.gain.connect(options.context.destination);

    let wasStarted = false;
    return [
        {
            timeFromNowInSeconds: timeFromNowInSeconds,
            callback: (currentTime) => {
                oscillator.gain.gain.setValueAtTime(EPSILON, currentTime);
                oscillator.gain.gain.exponentialRampToValueAtTime(1, currentTime + 0.05);
                wasStarted = true;
            }
        },
        {
            timeFromNowInSeconds: timeFromNowInSeconds + options.duration,
            callback: (currentTime) => {
                oscillator.gain.gain.setValueAtTime(oscillator.gain.gain.value, currentTime);
                oscillator.gain.gain.exponentialRampToValueAtTime(EPSILON, currentTime + 0.05);
            },
            cancellationCallback: (currentTime) => {
                if (wasStarted) {
                    oscillator.gain.gain.setValueAtTime(oscillator.gain.gain.value, currentTime);
                    oscillator.gain.gain.exponentialRampToValueAtTime(EPSILON, currentTime + 0.05);
                }
            }
        },
    ];
}