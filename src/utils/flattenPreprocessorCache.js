export function extractArrays(data) {
    const stakeholders = [];
    const stockClasses = [];
    const quantities = [];
    const securityIds = [];
    const sharePrices = [];
    const timestamps = [];

    for (const stakeholderId in data.activePositions) {
        const securities = data.activePositions[stakeholderId];
        for (const securityId in securities) {
            const security = securities[securityId];
            stakeholders.push(stakeholderId);
            stockClasses.push(security.stock_class_id);
            quantities.push(security.quantity);
            securityIds.push(securityId);
            sharePrices.push(security.share_price.amount);
            timestamps.push(security.timestamp);
        }
    }

    return {
        stakeholders,
        stockClasses,
        quantities,
        securityIds,
        sharePrices,
        timestamps,
    };
}
