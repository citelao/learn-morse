import IStorage from "./IStorage";
import { ILearningState, ILessonState } from "./LearningStateInterfaces";
import { generateWordForLesson } from "../LessonPlan";
import Cookie from "js-cookie";

export default class CookieStorage implements IStorage {
    public storeLearningState(learningState: ILearningState) {
        const stringified_state = JSON.stringify(learningState);
        console.log("Storing learning state", stringified_state);
        Cookie.set("learningState", stringified_state, {
            expires: 365
        });
    }

    public readLearningState(): ILearningState | null {
        if (!this.hasStoredLearningState()) {
            return null;
        }

        // Cookie definitely exists at this point.
        const cookie = Cookie.get("learningState");
        const cookieJson: ILearningState = JSON.parse(cookie!);
        return cookieJson;
    }

    public hasStoredLearningState(): boolean {
        const cookie = Cookie.get("learningState");

        if (!cookie) {
            return false;
        }

        return true;
    }
}
