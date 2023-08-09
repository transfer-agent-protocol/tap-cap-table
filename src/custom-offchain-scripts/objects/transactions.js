
const transactionTests = async (inputTransactions, prisma) => {
    if (inputTransactions.file_type === "OCF_TRANSACTIONS_FILE") {
        for (const inputTransaction of inputTransactions.items) {
            // ACCEPTANCE TRANSACTIONS
            if (inputTransaction.object_type === "TX_CONVERTIBLE_ACCEPTANCE") {
                const acceptanceTransaction = await prisma.convertibleAcceptance.create({
                    data: inputTransaction,
                });
                console.log("Acceptance transaction added ", acceptanceTransaction);
            } else if (inputTransaction.object_type === "TX_EQUITY_COMPENSATION_ACCEPTANCE") {
                const acceptanceTransaction = await prisma.equityCompensationAcceptance.create({
                    data: inputTransaction,
                });
                console.log("Acceptance transaction added ", acceptanceTransaction);
            } else if (inputTransaction.object_type === "TX_PLAN_SECURITY_ACCEPTANCE") {
                const acceptanceTransaction = await prisma.planSecurityAcceptance.create({
                    data: inputTransaction,
                });
                console.log("Acceptance transaction added ", acceptanceTransaction);
            } else if (inputTransaction.object_type === "TX_STOCK_ACCEPTANCE") {
                const acceptanceTransaction = await prisma.stockAcceptance.create({
                    data: inputTransaction,
                });
                console.log("Acceptance transaction added ", acceptanceTransaction);
            } else if (inputTransaction.object_type === "TX_WARRANT_ACCEPTANCE") {
                const acceptanceTransaction = await prisma.warrantAcceptance.create({
                    data: inputTransaction,
                });
                console.log("Acceptance transaction added ", acceptanceTransaction);
            }

            // ISSUANCE TRANSACTIONS
            else if (inputTransaction.object_type === "TX_CONVERTIBLE_ISSUANCE") {
                const issuanceTransaction = await prisma.convertibleIssuance.create({
                    data: inputTransaction,
                });
                console.log("Issuance transaction added ", issuanceTransaction);
            } else if (inputTransaction.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE") {
                const issuanceTransaction = await prisma.equityCompensationIssuance.create({
                    data: inputTransaction,
                });
                console.log("Issuance transaction added ", issuanceTransaction);
            } else if (inputTransaction.object_type === "TX_PLAN_SECURITY_ISSUANCE") {
                const issuanceTransaction = await prisma.planSecurityIssuance.create({
                    data: inputTransaction,
                });
                console.log("Issuance transaction added ", issuanceTransaction);
            } else if (inputTransaction.object_type === "TX_STOCK_ISSUANCE") {
                const issuanceTransaction = await prisma.stockIssuance.create({
                    data: inputTransaction,
                });
                console.log("Issuance transaction added ", issuanceTransaction);
            } else if (inputTransaction.object_type === "TX_WARRANT_ISSUANCE") {
                const issuanceTransaction = await prisma.warrantIssuance.create({
                    data: inputTransaction,
                });
                console.log("Issuance transaction added ", issuanceTransaction);
            }

            // CONVERSION TRANSACTIONS
            else if (inputTransaction.object_type === "TX_CONVERTIBLE_CONVERSION") {
                const conversionTransaction = await prisma.convertibleConversion.create({
                    data: inputTransaction,
                });
                console.log("Conversion transaction added ", conversionTransaction);
            } else if (inputTransaction.object_type === "TX_STOCK_CONVERSION") {
                const conversionTransaction = await prisma.stockConversion.create({
                    data: inputTransaction,
                });
                console.log("Conversion transaction added ", conversionTransaction);
            }

            // VESTING TRANSACTIONS
            else if (inputTransaction.object_type === "TX_VESTING_EVENT") {
                const vestingTransaction = await prisma.vestingEvent.create({
                    data: inputTransaction,
                });
                console.log("Vesting transaction added ", vestingTransaction);
            } else if (inputTransaction.object_type === "TX_VESTING_START") {
                const vestingTransaction = await prisma.vestingStart.create({
                    data: inputTransaction,
                });
                console.log("Vesting transaction added ", vestingTransaction);
            } else if (inputTransaction.object_type === "TX_VESTING_ACCELERATION") {
                const vestingTransaction = await prisma.vestingAcceleration.create({
                    data: inputTransaction,
                });
                console.log("Vesting transaction added ", vestingTransaction);
            }

            // CANCELLATION TRANSACTIONS
            else if (inputTransaction.object_type === "TX_CONVERTIBLE_CANCELLATION") {
                const cancellationTransaction = await prisma.convertibleCancellation.create({
                    data: inputTransaction,
                });
                console.log("Cancellation transaction added ", cancellationTransaction);
            } else if (inputTransaction.object_type === "TX_EQUITY_COMPENSATION_CANCELLATION") {
                const cancellationTransaction = await prisma.equityCompensationCancellation.create({
                    data: inputTransaction,
                });
                console.log("Cancellation transaction added ", cancellationTransaction);
            } else if (inputTransaction.object_type === "TX_PLAN_SECURITY_CANCELLATION") {
                const cancellationTransaction = await prisma.planSecurityCancellation.create({
                    data: inputTransaction,
                });
                console.log("Cancellation transaction added ", cancellationTransaction);
            } else if (inputTransaction.object_type === "TX_STOCK_CANCELLATION") {
                const cancellationTransaction = await prisma.stockCancellation.create({
                    data: inputTransaction,
                });
                console.log("Cancellation transaction added ", cancellationTransaction);
            } else if (inputTransaction.object_type === "TX_WARRANT_CANCELLATION") {
                const cancellationTransaction = await prisma.warrantCancellation.create({
                    data: inputTransaction,
                });
                console.log("Cancellation transaction added ", cancellationTransaction);

                // TRANSFER TRANSACTIONS
            } else if (inputTransaction.object_type === "TX_CONVERTIBLE_TRANSFER") {
                const transferTransaction = await prisma.convertibleTransfer.create({
                    data: inputTransaction,
                });
                console.log("Transfer transaction added ", transferTransaction);
            } else if (inputTransaction.object_type === "TX_EQUITY_COMPENSATION_TRANSFER") {
                const transferTransaction = await prisma.equityCompensationTransfer.create({
                    data: inputTransaction,
                });
                console.log("Transfer transaction added ", transferTransaction);
            } else if (inputTransaction.object_type === "TX_PLAN_SECURITY_TRANSFER") {
                const transferTransaction = await prisma.planSecurityTransfer.create({
                    data: inputTransaction,
                });
                console.log("Transfer transaction added ", transferTransaction);
            } else if (inputTransaction.object_type === "TX_STOCK_TRANSFER") {
                const transferTransaction = await prisma.stockTransfer.create({
                    data: inputTransaction,
                });
                console.log("Transfer transaction added ", transferTransaction);
            } else if (inputTransaction.object_type === "TX_WARRANT_TRANSFER") {
                const transferTransaction = await prisma.warrantTransfer.create({
                    data: inputTransaction,
                });
                console.log("Transfer transaction added ", transferTransaction);

                // RELEASE TRANSACTIONS
            } else if (inputTransaction.object_type === "TX_EQUITY_COMPENSATION_RELEASE") {
                const releaseTransaction = await prisma.equityCompensationRelease.create({
                    data: inputTransaction,
                });
                console.log("Release transaction added ", releaseTransaction);
            } else if (inputTransaction.object_type === "TX_PLAN_SECURITY_RELEASE") {
                const releaseTransaction = await prisma.planSecurityRelease.create({
                    data: inputTransaction,
                });
                console.log("Release transaction added ", releaseTransaction);

                // EXERCISE TRANSACTIONS
            } else if (inputTransaction.object_type === "TX_EQUITY_COMPENSATION_EXERCISE") {
                const exerciseTransaction = await prisma.equityCompensationExercise.create({
                    data: inputTransaction,
                });
                console.log("Exercise transaction added ", exerciseTransaction);
            } else if (inputTransaction.object_type === "TX_PLAN_SECURITY_EXERCISE") {
                const exerciseTransaction = await prisma.planSecurityExercise.create({
                    data: inputTransaction,
                });
                console.log("Exercise transaction added ", exerciseTransaction);
            } else if (inputTransaction.object_type === "TX_WARRANT_EXERCISE") {
                const exerciseTransaction = await prisma.warrantExercise.create({
                    data: inputTransaction,
                });
                console.log("Exercise transaction added ", exerciseTransaction);

                // REISSUANCE TRANSACTIONS
            } else if (inputTransaction.object_type === "TX_STOCK_REISSUANCE") {
                const reissuanceTransaction = await prisma.stockReissuance.create({
                    data: inputTransaction,
                });
                console.log("Reissuance transaction added ", reissuanceTransaction);
            }

            // REPURCHASE TRANSACTIONS
            else if (inputTransaction.object_type === "TX_STOCK_REPURCHASE") {
                const repurchaseTransaction = await prisma.stockRepurchase.create({
                    data: inputTransaction,
                });
                console.log("Repurchase transaction added ", repurchaseTransaction);
            }

            // RETURN TO POOL TRANSACTIONS
            else if (inputTransaction.object_type === "TX_STOCK_PLAN_RETURN_TO_POOL") {
                const returnToPoolTransaction = await prisma.stockPlanReturnToPool.create({
                    data: inputTransaction,
                });
                console.log("Return to pool transaction added ", returnToPoolTransaction);
            }

            // SPLIT TRANSACTIONS
            else if (inputTransaction.object_type === "TX_STOCK_CLASS_SPLIT") {
                const splitTransaction = await prisma.stockClassSplit.create({
                    data: inputTransaction,
                });
                console.log("Split transaction added ", splitTransaction);
            }

            // RETRACTION TRANSACTIONS
            else if (inputTransaction.object_type === "TX_CONVERTIBLE_RETRACTION") {
                const retractionTransaction = await prisma.convertibleRetraction.create({
                    data: inputTransaction,
                });
                console.log("Retraction transaction added ", retractionTransaction);
            } else if (inputTransaction.object_type === "TX_EQUITY_COMPENSATION_RETRACTION") {
                const retractionTransaction = await prisma.equityCompensationRetraction.create({
                    data: inputTransaction,
                });
                console.log("Retraction transaction added ", retractionTransaction);
            } else if (inputTransaction.object_type === "TX_PLAN_SECURITY_RETRACTION") {
                const retractionTransaction = await prisma.planSecurityRetraction.create({
                    data: inputTransaction,
                });
                console.log("Retraction transaction added ", retractionTransaction);
            } else if (inputTransaction.object_type === "TX_STOCK_RETRACTION") {
                const retractionTransaction = await prisma.stockRetraction.create({
                    data: inputTransaction,
                });
                console.log("Retraction transaction added ", retractionTransaction);
            } else if (inputTransaction.object_type === "TX_WARRANT_RETRACTION") {
                const retractionTransaction = await prisma.warrantRetraction.create({
                    data: inputTransaction,
                });
                console.log("Retraction transaction added ", retractionTransaction);
            }

            // ADJUSTMENT TRANSACTIONS
            else if (inputTransaction.object_type === "TX_ISSUER_AUTHORIZED_SHARES_ADJUSTMENT") {
                const adjustmentTransaction = await prisma.issuerAuthorizedSharesAdjustment.create({
                    data: inputTransaction,
                });
                console.log("Adjustment transaction added ", adjustmentTransaction);
            } else if (inputTransaction.object_type === "TX_STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT") {
                const adjustmentTransaction = await prisma.stockClassAuthorizedSharesAdjustment.create({
                    data: inputTransaction,
                });
                console.log("Adjustment transaction added ", adjustmentTransaction);
            } else if (inputTransaction.object_type === "TX_STOCK_CLASS_CONVERSION_RATIO_ADJUSTMENT") {
                const adjustmentTransaction = await prisma.stockClassConversionRatioAdjustment.create({
                    data: inputTransaction,
                });
                console.log("Adjustment transaction added ", adjustmentTransaction);
            } else if (inputTransaction.object_type === "TX_STOCK_PLAN_POOL_ADJUSTMENT") {
                const adjustmentTransaction = await prisma.stockPlanPoolAdjustment.create({
                    data: inputTransaction,
                });
                console.log("Adjustment transaction added ", adjustmentTransaction);
            } else {
                console.log("Unknown object type");
            }
        }
    }
};

export default transactionTests;
