import { ILearningState, ILessonState } from "./LearningStateInterfaces";

export default interface IStorage {
    /** Store the learning state with no conditions. */
    storeLearningState(learningState: ILearningState): void;

    /** Read the learning state, returning null if no state exists. */
    readLearningState(): ILearningState | null;

    /**
     * Do we have a stored state? Should return false if we're only on lesson
     * one, so we can restart.
     */
    hasStoredLearningState(): boolean;
}
