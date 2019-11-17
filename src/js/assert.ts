export default function assert(condition: unknown): asserts condition {
    if (!condition) {
        throw new Error(`Assertion failed: ${condition}`);
    }
}
