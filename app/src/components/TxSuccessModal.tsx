import { Modal } from "./Modal";

interface TxSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  txHash?: string;
  message?: string;
}

export function TxSuccessModal({ isOpen, onClose, title, txHash, message }: TxSuccessModalProps) {
  const explorerUrl = txHash ? `https://explorer.plume.org/tx/${txHash}` : undefined;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {message && <p style={{ margin: 0, color: "#374151" }}>{message}</p>}

        {txHash ? (
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
              Transaction Hash
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.85rem",
                wordBreak: "break-all",
                background: "#f3f4f6",
                padding: "8px 10px",
                borderRadius: "4px",
                marginBottom: "12px",
              }}
            >
              {txHash}
            </div>

            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  background: "#0C0B0C",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                View on Plume Explorer →
              </a>
            )}
          </div>
        ) : (
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            Transaction submitted. Check your wallet for confirmation.
          </p>
        )}

        <div style={{ marginTop: "8px", textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #d1d5db",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
