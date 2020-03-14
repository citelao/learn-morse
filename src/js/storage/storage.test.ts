import IStorage from "./IStorage";
import { getLearningState, migrateStorage } from "./storage";
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

describe("migrateStorage()", () => {
    class MockStorage implements IStorage {
        storeLearningState(learningState: ILearningState): void {
            throw new Error("Method not implemented.");
        }
        readLearningState(): ILearningState | null {
            throw new Error("Method not implemented.");
        }
    }

    it("should transfer state from old to new", () => {
        const oldStorage = new MockStorage();
        const newStorage = new MockStorage();
        const readSpy = jest.spyOn(oldStorage, "readLearningState");
        const writeSpy = jest.spyOn(newStorage, "storeLearningState");
        const newReadSpy = jest.spyOn(newStorage, "readLearningState");
        const sharedState: ILearningState = {
            currentLesson: 5,
            history: [
                {
                    accuracy: 0.5,
                    lesson: 4
                }
            ]
        };
        readSpy.mockImplementationOnce(() => sharedState);
        writeSpy.mockImplementationOnce(() => {});
        newReadSpy.mockImplementationOnce(() => null);

        migrateStorage(oldStorage, newStorage);
        expect(writeSpy).toHaveBeenCalledWith(sharedState);
    });

    it("should NOT transfer state if new has data", () => {
        const oldStorage = new MockStorage();
        const newStorage = new MockStorage();
        const readSpy = jest.spyOn(oldStorage, "readLearningState");
        const writeSpy = jest.spyOn(newStorage, "storeLearningState");
        const newReadSpy = jest.spyOn(newStorage, "readLearningState");
        const sharedState: ILearningState = {
            currentLesson: 5,
            history: [
                {
                    accuracy: 0.5,
                    lesson: 4
                }
            ]
        };
        readSpy.mockImplementationOnce(() => sharedState);
        writeSpy.mockImplementationOnce(() => {});
        newReadSpy.mockImplementationOnce(() => {
            return {
                currentLesson: 4,
                history: []
            };
        });

        migrateStorage(oldStorage, newStorage);
        expect(writeSpy).not.toHaveBeenCalled();
    });

    it("should NOT transfer state if old has no data", () => {
        const oldStorage = new MockStorage();
        const newStorage = new MockStorage();
        const readSpy = jest.spyOn(oldStorage, "readLearningState");
        const writeSpy = jest.spyOn(newStorage, "storeLearningState");
        const newReadSpy = jest.spyOn(newStorage, "readLearningState");
        readSpy.mockImplementationOnce(() => null);
        writeSpy.mockImplementationOnce(() => {});
        newReadSpy.mockImplementationOnce(() => null);

        migrateStorage(oldStorage, newStorage);
        expect(writeSpy).not.toHaveBeenCalled();
    });
});