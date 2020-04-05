import LiveRegionAnnouncer from "./LiveRegionAnnouncer";

export default class Announcer {
    private static instance: Announcer | null = null;

    static getInstance(): Announcer {
        if (!Announcer.instance) {
            Announcer.instance = new Announcer();
        }

        return Announcer.instance;
    }

    // Use the `getInstance` static method!
    private constructor() {}

    announce(message: string): void {
        throw new Error("Not implemented");
    }

    register(liveRegionAnnouncer: LiveRegionAnnouncer): void {
        throw new Error("Not implemented");
    }
}