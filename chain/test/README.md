# Test Suite

## Test Categories

| File | Type | Purpose |
|------|------|---------|
| `CapTable.t.sol` | Base | Test helpers/fixtures |
| `StockIssuance.t.sol` | Unit | Issuance logic, error cases |
| `StockTransfer.t.sol` | Unit | Transfer mechanics, edge cases |
| `StockCancellation.t.sol` | Unit | Cancel/partial cancel flows |
| `StockRepurchase.t.sol` | Unit | Repurchase flows |
| `StockReissuance.t.sol` | Unit | Reissuance mechanics |
| `StockRetraction.t.sol` | Unit | Retraction flow |
| `StockAcceptance.t.sol` | Unit | Acceptance flow |
| `Adjustment.t.sol` | Unit | Share adjustment constraints |
| `AccessControl.t.sol` | Unit | Role-based access |
| `Issuer.t.sol` | Unit | Issuer initialization |
| `Stakeholder.t.sol` | Unit | CRUD + duplicates |
| `StockClass.t.sol` | Unit | CRUD + duplicates |
| `Wallet.t.sol` | Unit | Wallet mapping |
| `Minting.t.sol` | Unit | Batch minting |
| `CapTableFactory.sol` | Unit | Factory + upgrades |
| `invariants/` | Invariant | Stateful fuzzing for accounting rules |

## Why Both Unit & Invariant Tests

**Unit tests** verify:
- Specific function behavior with known inputs
- Error messages and revert conditions
- Individual transaction flows (issue → cancel, issue → transfer, etc.)
- Access control per function

**Invariant tests** verify:
- Properties hold across *randomized sequences* of operations
- No combination of valid calls can break accounting (`shares_issued <= shares_authorized`)
- Index consistency survives arbitrary state mutations

## Commands

```bash
# Run all tests
make test

# Run only unit tests
forge test --no-match-contract Invariant

# Run only invariant tests
make test-invariant

# Run deep invariant tests (2000 runs, 100 depth)
make test-invariant-deep

# Run specific test
forge test --match-test testStockIssuance -vvv
```
