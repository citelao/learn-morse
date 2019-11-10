export enum QuizMode {
    VisibleSingle = 1,
    InvisibleSingle = 2,
    InvisibleWords = 3,
}

export interface IGuess {
    guess: string;
}

/** LessonPlan is designed to be trivially serializable to JSON. */
export interface ILessonPlanState {
    currentLesson: number,

    quizMode: QuizMode,

    currentWord: string | null,
    currentPhrase: string[] | null,
    wordId: number | null,
    currentGuess: string,

    guessHistory: IGuess[]
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
}

export default class LessonPlan {
    private state: ILessonPlanState;
    private listeners: LessonPlanStateChangeListener[];

    public static create() {
        // Create a basic LessonPlan
        return new LessonPlan({
            currentLesson: 1,
            quizMode: QuizMode.VisibleSingle,
            currentWord: null,
            wordId: null,
            currentPhrase: null,
            currentGuess: "",
            guessHistory: [],
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

    public getCurrentGuess(): string {
        return this.state.currentGuess;
    }

    public getQuizMode(): QuizMode {
        return this.state.quizMode;
    }

    public getGuessHistory(): IGuess[] {
        return this.state.guessHistory;
    }

    public registerListener(callback: LessonPlanStateChangeListener) {
        this.listeners.push(callback);
    }

    public begin() {
        const newWord = this.getNewWord();
        this.state.currentWord = newWord.word;
        this.state.wordId = 0;
        this.updateListeners();
    }

    public handleGuess(guess: string) {
        this.state.currentGuess = guess;
        if(this.state.currentGuess.length === this.state.currentWord?.length) {
            this.state.guessHistory.push({
                guess: this.state.currentGuess
            });

            if (this.state.currentGuess == this.state.currentWord) {
                // On success.

                // Update the state:
                if (this.state.quizMode === QuizMode.VisibleSingle) {
                    // Special-case the first letter, since we already just learned it.
                    if (this.state.currentLesson === 1) {
                        this.state.currentLesson += 1;
                        this.state.quizMode = QuizMode.VisibleSingle;
                    } else {
                        this.state.quizMode = QuizMode.InvisibleSingle;
                    }
                } else if(this.state.quizMode === QuizMode.InvisibleSingle) {
                    this.state.quizMode = QuizMode.InvisibleWords;
                }

                // Generate a new word:
                const newWord = this.getNewWord();
                this.state.currentWord = newWord.word;
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
        const word = (this.state.quizMode === QuizMode.VisibleSingle || this.state.quizMode === QuizMode.InvisibleSingle)
            ? LETTER_SERIES[this.state.currentLesson - 1]
            : generateWordForLesson(this.state.currentLesson);
        
        const newWord: INewWord = {
            word: word,
        };
        return newWord;
    }

    private updateListeners() {
        this.listeners.forEach((listener) => {
            listener();
        })
    }
}