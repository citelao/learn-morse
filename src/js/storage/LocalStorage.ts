import IStorage from "./IStorage";
import { ILearningState } from "./LearningStateInterfaces";

const localStorage = window.localStorage;

const KEY = "learningState";

export default class LocalStorage implements IStorage {
    storeLearningState(learningState: ILearningState): void {
        const stringified_state = JSON.stringify(learningState);
        console.log("Storing learning state (LocalStorage)", stringified_state);
        localStorage.setItem(KEY, stringified_state);
    }

    readLearningState(): ILearningState | null {
        const storage = localStorage.getItem(KEY);
        if (!storage) {
            return null;
        }

        const storageJson: ILearningState = JSON.parse(storage);
        return storageJson;
    }
}