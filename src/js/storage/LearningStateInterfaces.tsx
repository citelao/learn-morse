interface ILessonResult {
    lesson: number;
    accuracy: number;
}

export interface ILearningState {
    currentLesson: number;
    history: ILessonResult[];
}

export interface ILessonState {
    currentPhrase: string[];
}
