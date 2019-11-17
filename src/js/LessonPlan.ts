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

export function getLettersForLesson(currentLesson: number): string[] {
    const availableLetters = LETTER_SERIES.slice(0, currentLesson);
    return availableLetters;
}

export function generateWordForLesson(currentLesson: number, options: {
    length: number
}
= {
    length: 5
}): string {
    const availableLetters = getLettersForLesson(currentLesson);

    let word = "";
    for(let i = 0; i < options.length; i++) {
        const randomIndex = Math.floor(Math.random() * (availableLetters.length));
        word += availableLetters[randomIndex];
    }

    return word;
}

function getNewWord(args: {
    quizMode: QuizMode,
    currentLesson: number
}) {
    const word = (args.quizMode === QuizMode.VisibleSingle || args.quizMode === QuizMode.InvisibleSingle)
        ? LETTER_SERIES[args.currentLesson - 1]
        : generateWordForLesson(args.currentLesson);

    return word;
}

interface IAction {
    newGuess?: string;
    begin?: boolean;
}

function getNextStatePartial(currentState: ILessonPlanState, action: IAction): Partial<ILessonPlanState> {    
    if (action.begin) {
        switch(currentState.quizMode) {
            case QuizMode.VisibleSingle:
            case QuizMode.InvisibleSingle:
            case QuizMode.InvisibleWord: {
                const newWord = getNewWord({
                    currentLesson: currentState.currentLesson,
                    quizMode: currentState.quizMode
                });

                return {
                    currentWord: newWord,
                    wordId: (currentState.wordId || 0) + 1,
                    currentGuess: "",
                };
            }
            case QuizMode.InvisiblePhrase: {
                // TODO: do this on user advance, too.
                const phrase: string[] = [];
                const PHRASE_LENGTH = 6;
                for (let index = 0; index < PHRASE_LENGTH; index++) {
                    phrase.push(getNewWord({
                        currentLesson: currentState.currentLesson,
                        quizMode: currentState.quizMode
                    }));
                }

                return {
                    currentWord: phrase[0],
                    wordId: (currentState.wordId || 0) + 1,
                    currentPhrase: phrase,
                    currentGuess: "",
                };
            }
        }
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
                            currentWord: newWord,
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
                    // TODO: grade successes & failures
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

// TODO: unused
export default class LessonPlan {
    private state: ILessonPlanState;
    private listeners: LessonPlanStateChangeListener[];

    public static create() {
        // Create a basic LessonPlan
        // return new LessonPlan({
        //     currentLesson: 1,
        //     quizMode: QuizMode.VisibleSingle,
        //     currentWord: null,
        //     wordId: null,
        //     currentPhrase: null,
        //     currentGuess: "",
        //     guessHistory: [],
        // });
        return new LessonPlan({
            currentLesson: 2,
            quizMode: QuizMode.InvisiblePhrase,
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

    public getCurrentPhrase(): string[] | null {
        return this.state.currentPhrase;
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