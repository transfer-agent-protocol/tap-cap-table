import { trimEvents, txFuncs, txTypes } from "../../chain-operations/transactionPoller";

// TODO: if starts failing again run: yarn add --dev jest-esm-transformer
// https://jestjs.io/docs/using-matchers for more docs on `expect`

const myEvents = [5, 6, 6, 6, 7, 7, 7].map((x, i) => { return {i, o: {blockNumber: x}}; });

test('trimEvents partial', () => {
    // @ts-ignore
    const [events, block] = trimEvents(myEvents, 2, 10);
    expect(events.length).toBe(4);
    expect(events).toStrictEqual(myEvents.slice(0, 4));
    expect(block).toBe(6);
});

test('trimEvents full', () => {
    // We allow more than maxEvents in order to include all events of the last block
    for (const maxEvents of [5, 6, 7, 15]) {
        // @ts-ignore
        const [events, block] = trimEvents(myEvents, maxEvents, 10);
        expect(events.length).toBe(myEvents.length);
        expect(events).toStrictEqual(myEvents);
        expect(block).toBe(10);
    }
});

test('txMapper to maps', () => {
    // @ts-ignore
    expect(txTypes[3n]).toBe("StockAcceptance");
    expect(txFuncs["StockAcceptance"].name).toBe("handleStockAcceptance");
});
