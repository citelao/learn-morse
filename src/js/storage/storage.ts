import { ILearningState } from "./LearningStateInterfaces";

export function getDefaultLearningState(): ILearningState {
    const defaultLearningState: ILearningState = {
        currentLesson: 1,
        history: []
    };

    return defaultLearningState;
}

export function isFirstLesson(learningState: ILearningState): boolean {
    return learningState.currentLesson === 1;
}
