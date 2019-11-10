/** LessonPlan is designed to be trivially serializable to JSON. */
export interface ILessonPlanState {
    currentLesson: number,
    isIntroducing: boolean,

    currentWord: string | null,
    shouldShowWord: boolean,
    currentGuess: string,
}

export type LessonPlanStateChangeListener = () => void;

const LETTER_SERIES = [
    "k",
    "m",
    "u"
];

function generateWordForLesson(currentLesson: number): string {
    const availableLetters = LETTER_SERIES.slice(0, currentLesson);

    const LENGTH = 5;
    let word = "";
    for(let i = 0; i < LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * (availableLetters.length));
        word += availableLetters[randomIndex];
    }

    return word;
}

/** Internal interface for generating words */
interface INewWord {
    word: string;
    shouldShowWord: boolean;
}

export default class LessonPlan {
    private state: ILessonPlanState;
    private listeners: LessonPlanStateChangeListener[];

    public static create() {
        // Create a basic LessonPlan
        return new LessonPlan({
            currentLesson: 1,
            isIntroducing: true,
            currentWord: null,
            shouldShowWord: false,
            currentGuess: "",
        });
    }

    public constructor(state: ILessonPlanState) {
        this.state = state;
        this.listeners = [];
    }

    public getCurrentWord(): string | null {
        return this.state.currentWord;
    }

    public getShouldShowCurrentWord(): boolean {
        return this.state.shouldShowWord;
    }

    public registerListener(callback: LessonPlanStateChangeListener) {
        this.listeners.push(callback);
    }

    public begin() {
        const newWord = this.getNewWord();
        this.state.currentWord = newWord.word;
        this.state.shouldShowWord = newWord.shouldShowWord;
        this.updateListeners();
    }

    public handleGuess(char: string) {
        
    }

    private getNewWord(): INewWord {
        const word = (this.state.isIntroducing)
            ? LETTER_SERIES[this.state.currentLesson - 1]
            : generateWordForLesson(this.state.currentLesson);
        
        const newWord: INewWord = {
            word: word,
            shouldShowWord: true
        };
        return newWord;
    }

    private updateListeners() {
        this.listeners.forEach((listener) => {
            listener();
        })
    }
}