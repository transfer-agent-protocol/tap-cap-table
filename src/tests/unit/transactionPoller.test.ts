import { trimEvents } from "../../chain-operations/transactionPoller";

// TODO: if starts failing again: yarn add --dev jest-esm-transformer

const myEvents = [5, 6, 6, 6, 7].map((x, i) => { return {blockNumber: x, i}; });

test('trimEvents partial', () => {
    const [events, block] = trimEvents(myEvents, 2, 10);
    expect(events.length).toBe(4);
    expect(events).toBe(myEvents.slice(0, 4));
    expect(block).toBe(6);
});

test('trimEvents full', () => {
    const [events, block] = trimEvents(myEvents, 2, 10);
    expect(events.length).toBe(myEvents.length);
    expect(events).toBe(myEvents);
    expect(block).toBe(10);
});
