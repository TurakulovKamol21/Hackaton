package uz.startup.finance.service;

import java.math.BigDecimal;
import uz.startup.finance.dto.FinanceDtos.AccountResponse;
import uz.startup.finance.dto.FinanceDtos.BudgetResponse;
import uz.startup.finance.dto.FinanceDtos.CategoryResponse;
import uz.startup.finance.dto.FinanceDtos.DebtResponse;
import uz.startup.finance.dto.FinanceDtos.EntryResponse;
import uz.startup.finance.dto.FinanceDtos.TransferResponse;
import uz.startup.finance.model.Account;
import uz.startup.finance.model.Budget;
import uz.startup.finance.model.Category;
import uz.startup.finance.model.DebtRecord;
import uz.startup.finance.model.Entry;
import uz.startup.finance.model.Transfer;

public final class FinanceMapper {

    private FinanceMapper() {
    }

    public static AccountResponse toAccountResponse(Account account, BigDecimal currentBalance) {
        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getType(),
                account.getCurrency(),
                account.getInitialBalance(),
                currentBalance
        );
    }

    public static CategoryResponse toCategoryResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getType());
    }

    public static EntryResponse toEntryResponse(Entry entry) {
        return new EntryResponse(
                entry.getId(),
                entry.getType(),
                entry.getAmount(),
                entry.getTransactionDate(),
                entry.getTitle(),
                entry.getNote(),
                entry.getCategory().getId(),
                entry.getCategory().getName(),
                entry.getAccount().getId(),
                entry.getAccount().getName(),
                entry.getAccount().getCurrency()
        );
    }

    public static TransferResponse toTransferResponse(Transfer transfer) {
        return new TransferResponse(
                transfer.getId(),
                transfer.getFromAccount().getId(),
                transfer.getFromAccount().getName(),
                transfer.getFromAccount().getCurrency(),
                transfer.getFromAmount(),
                transfer.getToAccount().getId(),
                transfer.getToAccount().getName(),
                transfer.getToAccount().getCurrency(),
                transfer.getToAmount(),
                transfer.getRate(),
                transfer.getTransferDate(),
                transfer.getNote()
        );
    }

    public static DebtResponse toDebtResponse(DebtRecord debtRecord) {
        return new DebtResponse(
                debtRecord.getId(),
                debtRecord.getType(),
                debtRecord.getCounterparty(),
                debtRecord.getAmount(),
                debtRecord.getCurrency(),
                debtRecord.getOpenedOn(),
                debtRecord.getDueDate(),
                debtRecord.getStatus(),
                debtRecord.getNote()
        );
    }

    public static BudgetResponse toBudgetResponse(Budget budget) {
        return new BudgetResponse(
                budget.getId(),
                budget.getMonth(),
                budget.getType(),
                budget.getAmount(),
                budget.getCurrency(),
                budget.getCategory() == null ? null : budget.getCategory().getId(),
                budget.getCategory() == null ? null : budget.getCategory().getName()
        );
    }
}
