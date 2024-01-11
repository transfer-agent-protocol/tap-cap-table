import { trimEvents } from "../../chain-operations/transactionPoller";

// TODO: if starts failing again: yarn add --dev jest-esm-transformer

const myEvents = [5, 6, 6, 6, 7].map((x, i) => { return {blockNumber: x, i}; });

test('trimEvents partial', () => {
    const [events, block] = trimEvents(myEvents, 2, 10);
    expect(events.length).toBe(4);
    expect(events).toStrictEqual(myEvents.slice(0, 4));
    expect(block).toBe(6);
});

test('trimEvents full', () => {
    for (const max of [5, 6, 15]) {
        const [events, block] = trimEvents(myEvents, max, 10);
        expect(events.length).toBe(myEvents.length);
        expect(events).toStrictEqual(myEvents);
        expect(block).toBe(10);
    }
});
