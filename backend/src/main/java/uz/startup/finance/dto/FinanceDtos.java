package uz.startup.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import uz.startup.finance.domain.enums.AccountType;
import uz.startup.finance.domain.enums.BudgetType;
import uz.startup.finance.domain.enums.DebtStatus;
import uz.startup.finance.domain.enums.DebtType;
import uz.startup.finance.domain.enums.TransactionType;

public final class FinanceDtos {

    private FinanceDtos() {
    }

    public record CreateAccountRequest(
            @NotBlank String name,
            @NotNull AccountType type,
            @NotBlank String currency,
            @NotNull @DecimalMin(value = "0.00") BigDecimal initialBalance
    ) {
    }

    public record AccountResponse(
            Long id,
            String name,
            AccountType type,
            String currency,
            BigDecimal initialBalance,
            BigDecimal currentBalance
    ) {
    }

    public record CategoryResponse(
            Long id,
            String name,
            TransactionType type
    ) {
    }

    public record UpsertEntryRequest(
            @NotNull TransactionType type,
            @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
            @NotNull LocalDate transactionDate,
            @NotBlank String title,
            String note,
            @NotNull Long categoryId,
            @NotNull Long accountId
    ) {
    }

    public record EntryResponse(
            Long id,
            TransactionType type,
            BigDecimal amount,
            LocalDate transactionDate,
            String title,
            String note,
            Long categoryId,
            String categoryName,
            Long accountId,
            String accountName,
            String currency
    ) {
    }

    public record CreateTransferRequest(
            @NotNull Long fromAccountId,
            @NotNull Long toAccountId,
            @NotNull @DecimalMin(value = "0.01") BigDecimal fromAmount,
            @NotNull @DecimalMin(value = "0.01") BigDecimal toAmount,
            @NotNull @DecimalMin(value = "0.000001") BigDecimal rate,
            @NotNull LocalDate transferDate,
            String note
    ) {
    }

    public record TransferResponse(
            Long id,
            Long fromAccountId,
            String fromAccountName,
            String fromCurrency,
            BigDecimal fromAmount,
            Long toAccountId,
            String toAccountName,
            String toCurrency,
            BigDecimal toAmount,
            BigDecimal rate,
            LocalDate transferDate,
            String note
    ) {
    }

    public record UpsertDebtRequest(
            @NotNull DebtType type,
            @NotBlank String counterparty,
            @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
            @NotBlank String currency,
            @NotNull LocalDate openedOn,
            LocalDate dueDate,
            @NotNull DebtStatus status,
            String note
    ) {
    }

    public record DebtResponse(
            Long id,
            DebtType type,
            String counterparty,
            BigDecimal amount,
            String currency,
            LocalDate openedOn,
            LocalDate dueDate,
            DebtStatus status,
            String note
    ) {
    }

    public record UpsertBudgetRequest(
            @NotBlank String month,
            @NotNull BudgetType type,
            @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
            @NotBlank String currency,
            Long categoryId
    ) {
    }

    public record BudgetResponse(
            Long id,
            String month,
            BudgetType type,
            BigDecimal amount,
            String currency,
            Long categoryId,
            String categoryName
    ) {
    }

    public record CurrencyTotal(
            String currency,
            BigDecimal amount
    ) {
    }

    public record BudgetComparison(
            String label,
            BudgetType type,
            String currency,
            BigDecimal budgeted,
            BigDecimal actual,
            BigDecimal delta
    ) {
    }

    public record CategoryStat(
            String category,
            TransactionType type,
            String currency,
            BigDecimal total
    ) {
    }

    public record PeriodStat(
            String periodLabel,
            String currency,
            BigDecimal income,
            BigDecimal expense,
            BigDecimal net
    ) {
    }

    public record CalendarItem(
            String date,
            String kind,
            String title,
            String currency,
            BigDecimal amount,
            String meta
    ) {
    }

    public record DebtSummary(
            String currency,
            BigDecimal debt,
            BigDecimal receivable
    ) {
    }

    public record InsightResponse(
            String level,
            String title,
            String message
    ) {
    }

    public record DashboardResponse(
            String month,
            List<AccountResponse> accounts,
            List<CurrencyTotal> balanceTotals,
            List<CurrencyTotal> incomeTotals,
            List<CurrencyTotal> expenseTotals,
            List<BudgetComparison> budgetComparisons,
            List<CategoryStat> categoryStats,
            List<PeriodStat> trends,
            List<CalendarItem> calendarItems,
            List<DebtSummary> debtSummaries,
            List<InsightResponse> insights
    ) {
    }

    public record ReferenceResponse(
            List<AccountResponse> accounts,
            List<CategoryResponse> categories
    ) {
    }
}
