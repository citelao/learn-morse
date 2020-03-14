import { ILearningState } from "./LearningStateInterfaces";
import IStorage from "./IStorage";

function getDefaultLearningState(): ILearningState {
    const defaultLearningState: ILearningState = {
        currentLesson: 1,
        history: []
    };

    return defaultLearningState;
}

function isFirstLesson(learningState: ILearningState): boolean {
    return learningState.currentLesson === 1;
}

export function getLearningState(storage: IStorage): {
    isDefault: boolean;
    learningState: ILearningState;
} {
    const learningState = storage.readLearningState();
    if (!learningState) {
        console.log("Using default learning state");
        return {
            isDefault: true,
            learningState: getDefaultLearningState()
        };
    }

    const shouldUseDefaultLearningState = isFirstLesson(learningState);
    if (shouldUseDefaultLearningState) {
        console.log(
            "Found cached learning state, but it's only lesson one, so let's use default."
        );
        return {
            isDefault: true,
            learningState: getDefaultLearningState()
        };
    }

    console.log("Using cached learning state", learningState);
    return {
        isDefault: false,
        learningState: learningState
    };
}
