import { trimEvents } from "../../chain-operations/transactionPoller";

// TODO: if starts failing again: yarn add --dev jest-esm-transformer

const myEvents = [5, 6, 6, 6, 7, 7, 7].map((x, i) => { return {blockNumber: x, i}; });

test('trimEvents partial', () => {
    const [events, block] = trimEvents(myEvents, 2, 10);
    expect(events.length).toBe(4);
    expect(events).toStrictEqual(myEvents.slice(0, 4));
    expect(block).toBe(6);
});

test('trimEvents full', () => {
    // We allow more than maxEvents in order to include all events of the last block
    for (const maxEvents of [5, 6, 7, 15]) {
        const [events, block] = trimEvents(myEvents, maxEvents, 10);
        expect(events.length).toBe(myEvents.length);
        expect(events).toStrictEqual(myEvents);
        expect(block).toBe(10);
    }
});
