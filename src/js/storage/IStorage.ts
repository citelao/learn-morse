import { ILearningState, ILessonState } from "./LearningState";

export default interface IStorage {
    generateLessonState(learningState: ILearningState): ILessonState;
    storeLearningState(learningState: ILearningState): void;
    readLearningState(): ILearningState;
    hasStoredLearningState(): boolean;
}
