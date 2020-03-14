import IStorage from "./IStorage";
import { getLearningState } from "./Storage";
import { ILearningState } from "./LearningStateInterfaces";

describe("getLearningState()", () => {
    it("should return default state when no state exists", () => {
        class MockStorage implements IStorage {
            storeLearningState(learningState: ILearningState): void {
                throw new Error("Method not implemented.");
            }
            readLearningState(): ILearningState | null {
                return null;
            }
        }

        const result = getLearningState(new MockStorage());
        expect(result.isDefault).toBe(true);
    });

    it("should return state when it exists", () => {
        const state: ILearningState = {
            currentLesson: 5,
            history: []
        };
        class MockStorage implements IStorage {
            storeLearningState(learningState: ILearningState): void {
                throw new Error("Method not implemented.");
            }
            readLearningState(): ILearningState | null {
                return state;
            }
        }

        const result = getLearningState(new MockStorage());
        expect(result.isDefault).toBe(false);
        expect(result.learningState).toBe(state);
    });

    it("should return default state when we are on lesson 1", () => {
        const state: ILearningState = {
            currentLesson: 1,
            history: []
        };
        class MockStorage implements IStorage {
            storeLearningState(learningState: ILearningState): void {
                throw new Error("Method not implemented.");
            }
            readLearningState(): ILearningState | null {
                return state;
            }
        }

        const result = getLearningState(new MockStorage());
        expect(result.isDefault).toBe(true);
    });
});
