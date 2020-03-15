type NoteCallback = (currentTime: number) => void;

export interface INote {
    timeFromNowInSeconds: number;
    callback: NoteCallback;
    cancellationCallback?: NoteCallback;
}

interface IQueuedNote {
    callback: NoteCallback;
    cancellationCallback?: NoteCallback;
    startTime: number;
}

export default class Scheduler {
    private window: Window;
    private audioContext: AudioContext;
    private queuedNotes: IQueuedNote[] = [];

    public constructor(window: Window, context: AudioContext) {
        this.window = window;

        this.audioContext = context;
    }

    public start() {
        // Use `setTimeout` so the window works in the background:
        // this.window.requestAnimationFrame(this.handleAnimationFrame);
        setTimeout(this.handleAnimationFrame, 0);
    }

    public scheduleNotes(
        notes: INote[],
        options?: { shouldSortNotes?: boolean }
    ) {
        const shouldSortNotes = (options && options.shouldSortNotes) || true;
        const currentTime = this.audioContext.currentTime;

        // TODO: does not handle existing notes
        if (shouldSortNotes) {
            notes.sort(
                (a, b) => a.timeFromNowInSeconds - b.timeFromNowInSeconds
            );
        }

        notes.forEach(note => {
            const scheduledNote: IQueuedNote = {
                callback: note.callback,
                cancellationCallback: note.cancellationCallback,
                startTime: currentTime + note.timeFromNowInSeconds
            };
            this.queuedNotes.push(scheduledNote);
            // console.log(scheduledNote);
        });
    }

    public clear() {
        const frameTime = this.audioContext.currentTime;
        this.queuedNotes.forEach(note => {
            if (note.cancellationCallback) {
                note.cancellationCallback(frameTime);
            }
        });
        this.queuedNotes = [];
    }

    private handleAnimationFrame = () => {
        // See https://www.html5rocks.com/en/tutorials/audio/scheduling/
        const frameTime = this.audioContext.currentTime;
        let playedNotes = 0;
        while (
            this.queuedNotes.length > 0 &&
            this.queuedNotes[0].startTime < frameTime
        ) {
            const playedNote = this.queuedNotes.splice(0, 1)[0];
            playedNote.callback(frameTime);
            playedNotes++;
            // console.log(frameTime);
        }

        if (playedNotes) {
            console.log(`Played notes: ${playedNotes}`);
        }

        // this.window.requestAnimationFrame(this.handleAnimationFrame);
        setTimeout(this.handleAnimationFrame, 0);
    };
}
