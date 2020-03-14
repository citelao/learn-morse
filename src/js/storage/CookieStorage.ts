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

    public readLearningState(): ILearningState {
        const defaultLearningState: ILearningState = {
            currentLesson: 1,
            history: []
        };

        if (!this.hasStoredLearningState()) {
            console.log("Using default learning state");
            return defaultLearningState;
        }

        // Cookie definitely exists at this point.
        const cookie = Cookie.get("learningState");
        const cookieJson: ILearningState = JSON.parse(cookie!);

        console.log("Using cached learning state", cookieJson);
        return cookieJson;
    }

    public hasStoredLearningState(): boolean {
        const cookie = Cookie.get("learningState");

        if (!cookie) {
            return false;
        }

        const cookieJson: ILearningState = JSON.parse(cookie);

        // Special case the first lesson, since it's not interesting to test long
        // strings of just the first letter:
        if (cookieJson.currentLesson === 1) {
            console.log(
                "Found cached learning state, but it's only lesson one, so let's use default."
            );
            return false;
        }

        return true;
    }
}
