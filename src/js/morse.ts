/** A number close to 0 but not quite 0 so we can exponentially decay to it. */
const EPSILON = 0.00001;

function createAudioContext(): AudioContext {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
}

async function sleep(durationInSeconds: number)
{
    const MS_PER_SECOND = 1000;
    return new Promise((resolve) => {
        setTimeout(resolve, durationInSeconds * MS_PER_SECOND);
    });
}

function schedulePleasantParamChange(
    param: AudioParam,
    value: number,
    timeInSeconds: number,
    options?: { decayTimeInSeconds?:number })
{
    const DECAY_TIME_IN_SECONDS = 0.03;
    const decayTime = (options && options.decayTimeInSeconds) || DECAY_TIME_IN_SECONDS;
    param.setValueAtTime(param.value, timeInSeconds);
    param.exponentialRampToValueAtTime(value, timeInSeconds + decayTime);
}

async function playNoteDuration(
    context: AudioContext,
    oscillator: IOscillatorPair,
    durationInSeconds: number) {
    schedulePleasantParamChange(oscillator.gain.gain, 1, context.currentTime);

    const stopTime = context.currentTime + durationInSeconds;
    const decayTime = 0.3;
    const beginStopTime = stopTime - decayTime;
    schedulePleasantParamChange(oscillator.gain.gain, EPSILON, beginStopTime, { decayTimeInSeconds: decayTime});

    return await sleep(durationInSeconds);
}

export async function test() {
    const context = createAudioContext();
    const osc = createPleasantSineOscillator(context, 443);
    osc.gain.connect(context.destination);

    // await playNoteDuration(context, osc, 1);
    // await sleep(0.5);
    // await playNoteDuration(context, osc, 1);
    // await sleep(0.5);

}