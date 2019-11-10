/** LessonPlan is designed to be trivially serializable to JSON. */
export interface ILessonPlanState {
    currentLesson: number,

    isIntroducing: boolean,
    isSoftlyIntroducing: boolean,

    currentWord: string | null,
    wordId: number | null,
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
            currentLesson: 2,
            isIntroducing: false,
            isSoftlyIntroducing: false,
            currentWord: null,
            wordId: null,
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

    public getWordId(): number | null {
        return this.state.wordId
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
        this.state.wordId = 0;
        this.state.shouldShowWord = newWord.shouldShowWord;
        this.updateListeners();
    }

    public handleGuess(char: string) {
        this.state.currentGuess += char;
        if(this.state.currentGuess.length === this.state.currentWord?.length) {
            if (this.state.currentGuess == this.state.currentWord) {
                // On success:
                if (this.state.isIntroducing && !this.state.isSoftlyIntroducing) {
                    this.state.isSoftlyIntroducing = true;
                } else if(this.state.isIntroducing) {
                    this.state.isIntroducing = false;
                }

                const newWord = this.getNewWord();
                this.state.currentWord = newWord.word;
                this.state.shouldShowWord = newWord.shouldShowWord;
                this.state.wordId = this.state.wordId! + 1;
                this.state.currentGuess = "";
            } else {
                // Oh no! a failed guess.
                this.state.currentGuess = "";
            }
        } else {
            // TODO: queue word grading
        }

        this.updateListeners();
    }

    private getNewWord(): INewWord {
        const word = (this.state.isIntroducing)
            ? LETTER_SERIES[this.state.currentLesson - 1]
            : generateWordForLesson(this.state.currentLesson);
        
        const newWord: INewWord = {
            word: word,
            shouldShowWord: (this.state.isIntroducing && !this.state.isSoftlyIntroducing)
        };
        return newWord;
    }

    private updateListeners() {
        this.listeners.forEach((listener) => {
            listener();
        })
    }
}