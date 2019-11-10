export enum QuizMode {
    VisibleSingle = 1,
    InvisibleSingle = 2,
    InvisibleWord = 3,
    InvisiblePhrase = 4,
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

    guessHistory: IGuess[],
}

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

function getNewWord(args: {
    quizMode: QuizMode,
    currentLesson: number
}): INewWord {
    const word = (args.quizMode === QuizMode.VisibleSingle || args.quizMode === QuizMode.InvisibleSingle)
        ? LETTER_SERIES[args.currentLesson - 1]
        : generateWordForLesson(args.currentLesson);
    
    const newWord: INewWord = {
        word: word,
    };
    return newWord;
}

/** Internal interface for generating words */
interface INewWord {
    word: string;
}

interface IAction {
    newGuess?: string;
    begin?: boolean;
}

function getNextStatePartial(currentState: ILessonPlanState, action: IAction): Partial<ILessonPlanState> {    
    if (action.begin) {
        const newWord = getNewWord({
            currentLesson: currentState.currentLesson,
            quizMode: currentState.quizMode
        });

        return {
            currentWord: newWord.word,
            wordId: (currentState.wordId || 0) + 1,
            currentGuess: "",
        };
    } else if (action.newGuess) {
        const isFullGuess = action.newGuess.length === currentState.currentWord?.length;
        if (isFullGuess) {
            const isCorrect = action.newGuess == currentState.currentWord;
            switch(currentState.quizMode) {
                case QuizMode.VisibleSingle:
                case QuizMode.InvisibleSingle:
                case QuizMode.InvisibleWord:
                    if (isCorrect) {
                        let partial: Partial<ILessonPlanState> = {};

                        // Update quiz mode & lesson number as necessary
                        switch(currentState.quizMode) {
                            case QuizMode.VisibleSingle:
                                // The first lesson is special-cased to introduce
                                // the next letter immediately.
                                if (currentState.currentLesson === 1) {
                                    partial.currentLesson = currentState.currentLesson + 1;
                                } else {
                                    partial.quizMode = QuizMode.InvisibleSingle;
                                }
                                break;
                            case QuizMode.InvisibleSingle:
                                partial.quizMode = QuizMode.InvisibleWord;
                                break;
                            case QuizMode.InvisibleWord:
                            default:
                                // no-op
                        }

                        // Generate a new word.
                        const newWord = getNewWord({
                            currentLesson: partial.currentLesson || currentState.currentLesson,
                            quizMode: partial.quizMode || currentState.quizMode
                        });

                        return Object.assign(partial, {
                            currentWord: newWord.word,
                            wordId: (currentState.wordId || 0) + 1,
                            currentGuess: "",
                            guessHistory: [
                                ...currentState.guessHistory,
                                {
                                    guess: action.newGuess
                                }
                            ]
                        });
                    } else {
                        // Oh no! a failed guess.
                        return {
                            currentGuess: "",
                            guessHistory: [
                                ...currentState.guessHistory,
                                {
                                    guess: action.newGuess
                                }
                            ]
                        };
                    }
                case QuizMode.InvisiblePhrase:
                    throw new Error("Koch mode not impl");
            }
        } else {
            return {
                currentGuess: action.newGuess
            };
        }
    }

    return {};
}

function getNextState(currentState: ILessonPlanState, action: IAction): ILessonPlanState {
    const updates = getNextStatePartial(currentState, action);
    const newState = Object.assign({}, currentState, updates);
    console.log(newState);
    return newState;
}

export type LessonPlanStateChangeListener = () => void;

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
        this.state = getNextState(this.state, { begin: true});
        this.updateListeners();
    }

    public handleGuess(guess: string) {
        this.state = getNextState(this.state, { newGuess: guess });
        this.updateListeners();
    }

    private updateListeners() {
        this.listeners.forEach((listener) => {
            listener();
        })
    }
}