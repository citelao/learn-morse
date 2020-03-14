import IStorage from "./IStorage";
import { getLearningState } from "./Storage";

describe("getLearningState()", () => {
    it("should return default state when no state exists", () => {
        const mockStorage: IStorage = {
            hasStoredLearningState() {
                return false;
            },
            readLearningState() {
                throw new Error("Not implemented");
            },
            storeLearningState() {
                throw new Error("Not implemented");
            }
        };

        const result = getLearningState(mockStorage);
        expect(result.isDefault).toBe(true);
    });
});
