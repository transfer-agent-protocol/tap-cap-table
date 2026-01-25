# TAP Cap Table - Development Makefile
# Run `make help` to see available targets

.PHONY: help test test-v test-invariant test-invariant-deep build aderyn slither security clean

help:
	@echo "TAP Cap Table - Available targets:"
	@echo ""
	@echo "  Testing:"
	@echo "    make test              - Run all Foundry tests"
	@echo "    make test-v            - Run all tests with verbose output"
	@echo "    make test-invariant    - Run invariant tests (256 runs, 50 depth)"
	@echo "    make test-invariant-deep - Run deep invariant tests (2000 runs, 100 depth)"
	@echo ""
	@echo "  Security Analysis:"
	@echo "    make aderyn            - Run Aderyn static analysis (outputs to report.md)"
	@echo "    make slither           - Run Slither static analysis (outputs to chain/slither-report.md)"
	@echo "    make security          - Run both Aderyn and Slither"
	@echo ""
	@echo "  Other:"
	@echo "    make build             - Build contracts with Foundry"
	@echo "    make clean             - Clean build artifacts"

# =============================================================================
# Testing
# =============================================================================

test:
	cd chain && forge test

test-v:
	cd chain && forge test -vvv

test-invariant:
	cd chain && forge test --mt invariant -vvv

test-invariant-deep:
	cd chain && forge test --mt invariant --invariant-runs 2000 --invariant-depth 100 -vvv

# =============================================================================
# Security Analysis
# =============================================================================

aderyn:
	aderyn .

slither:
	@echo "Running Slither analysis..."
	@echo "Note: Requires Python 3.10+ and slither-analyzer installed"
	@echo "Install with: pip install slither-analyzer"
	cd chain && slither . --config-file ../slither.config.json 2>&1 | tee slither-report.md
	@echo ""
	@echo "Slither report saved to chain/slither-report.md"

security: aderyn slither
	@echo ""
	@echo "Security analysis complete."
	@echo "  - Aderyn report: report.md"
	@echo "  - Slither report: chain/slither-report.md"

# =============================================================================
# Build & Clean
# =============================================================================

build:
	cd chain && forge build

clean:
	cd chain && forge clean
	rm -rf chain/crytic-export
	rm -rf chain/invariant-corpus
