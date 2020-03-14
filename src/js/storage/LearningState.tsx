export interface ILessonResult {
    lesson: number;
    accuracy: number;
}

export interface ILearningState {
    currentLesson: number;
    history: ILessonResult[];
}
