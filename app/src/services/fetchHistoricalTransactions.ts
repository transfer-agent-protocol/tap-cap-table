export interface HistoricalTransaction {
  transactionType: string;
  issuer: string;
  transaction: any; // the populated transaction object
}

export async function fetchHistoricalTransactions(issuerId: string): Promise<HistoricalTransaction[]> {
  if (!issuerId) return [];

  const res = await fetch(`/api/historical-transactions/issuer-id/${encodeURIComponent(issuerId)}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch historical transactions (${res.status})`);
  }

  return res.json();
}
