export default function assert(condition: unknown, message?: string): asserts condition {
    if (!condition) {
        const message_string = (message)
            ? ` (${message})`
            : "";
        throw new Error(`Assertion failed: ${condition}${message_string}`);
    }
}
