type NoteCallback = (currentTime: number) => void;

export interface INote {
    timeFromNowInSeconds: number;
    callback: NoteCallback;
}

interface IQueuedNote {
    callback: NoteCallback;
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

    public scheduleNotes(notes: INote[], options?: { shouldSortNotes?: boolean}) {
        const shouldSortNotes = (options && options.shouldSortNotes) || true;
        const currentTime = this.audioContext.currentTime;

        // TODO: does not handle existing notes
        if (shouldSortNotes) {
            notes.sort((a, b) => a.timeFromNowInSeconds - b.timeFromNowInSeconds);
        }

        notes.forEach((note) => {
            const scheduledNote: IQueuedNote = {
                callback: note.callback,
                startTime: currentTime + note.timeFromNowInSeconds
            };
            this.queuedNotes.push(scheduledNote);
            console.log(scheduledNote);
        });
    }

    private handleAnimationFrame = () => {
        // See https://www.html5rocks.com/en/tutorials/audio/scheduling/
        const frameTime = this.audioContext.currentTime;
        while (this.queuedNotes.length > 0 && this.queuedNotes[0].startTime < frameTime) {
            const playedNote = this.queuedNotes.splice(0, 1)[0];
            playedNote.callback(frameTime);
            console.log(frameTime);
        }

        // this.window.requestAnimationFrame(this.handleAnimationFrame);
        setTimeout(this.handleAnimationFrame, 0);
    }
}