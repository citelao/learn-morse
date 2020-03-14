import { ILearningState, ILessonState } from "./LearningState";

export default interface IStorage {
    /** Store the learning state with no conditions. */
    storeLearningState(learningState: ILearningState): void;

    /** Read the learning state, returning the default state if no state exists. */
    readLearningState(): ILearningState;

    /**
     * Do we have a stored state? Should return false if we're only on lesson
     * one, so we can restart.
     */
    hasStoredLearningState(): boolean;
}
