package uz.startup.finance.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import uz.startup.finance.dto.FinanceDtos.BudgetComparison;
import uz.startup.finance.dto.FinanceDtos.CurrencyTotal;
import uz.startup.finance.dto.FinanceDtos.InsightResponse;
import uz.startup.finance.domain.entity.DebtRecord;
import uz.startup.finance.domain.enums.BudgetType;
import uz.startup.finance.domain.enums.DebtStatus;
import uz.startup.finance.domain.enums.DebtType;
import org.springframework.stereotype.Service;

@Service
public class DashboardInsightService {

    public List<InsightResponse> buildInsights(
            YearMonth selectedMonth,
            List<CurrencyTotal> incomeTotals,
            List<CurrencyTotal> expenseTotals,
            List<BudgetComparison> budgetComparisons,
            List<DebtRecord> debts
    ) {
        List<InsightResponse> insights = new ArrayList<>();
        addBudgetInsights(insights, budgetComparisons);
        addIncomeInsights(insights, selectedMonth, budgetComparisons);
        addCashflowInsights(insights, incomeTotals, expenseTotals);
        addDebtInsights(insights, debts);

        return insights.stream()
                .sorted(Comparator.comparing(DashboardInsightService::priorityOf))
                .limit(6)
                .toList();
    }

    private void addBudgetInsights(List<InsightResponse> insights, List<BudgetComparison> budgetComparisons) {
        budgetComparisons.stream()
                .filter(item -> item.type() == BudgetType.EXPENSE_LIMIT)
                .filter(item -> item.delta().compareTo(BigDecimal.ZERO) > 0)
                .sorted(Comparator.comparing(BudgetComparison::delta, Comparator.reverseOrder()))
                .limit(2)
                .forEach(item -> insights.add(new InsightResponse(
                        "WARNING",
                        "Byudjetdan oshish",
                        "%s bo'yicha xarajat limiti %s ga oshib ketdi".formatted(item.label(), item.currency())
                )));
    }

    private void addIncomeInsights(
            List<InsightResponse> insights,
            YearMonth selectedMonth,
            List<BudgetComparison> budgetComparisons
    ) {
        budgetComparisons.stream()
                .filter(item -> item.type() == BudgetType.INCOME_TARGET)
                .findFirst()
                .ifPresent(item -> {
                    BigDecimal budgeted = item.budgeted();
                    BigDecimal actual = item.actual();

                    if (actual.compareTo(budgeted) >= 0) {
                        insights.add(new InsightResponse(
                                "SUCCESS",
                                "Daromad maqsadi bajarildi",
                                "Tanlangan oy uchun income target to'liq yopildi"
                        ));
                        return;
                    }

                    YearMonth currentMonth = YearMonth.now();
                    int dayOfMonth = selectedMonth.isBefore(currentMonth)
                            ? selectedMonth.lengthOfMonth()
                            : selectedMonth.isAfter(currentMonth) ? 1 : LocalDate.now().getDayOfMonth();
                    BigDecimal monthProgress = BigDecimal.valueOf(dayOfMonth)
                            .divide(BigDecimal.valueOf(selectedMonth.lengthOfMonth()), 4, java.math.RoundingMode.HALF_UP);
                    BigDecimal expectedProgress = budgeted.multiply(monthProgress);
                    if (actual.compareTo(expectedProgress.multiply(BigDecimal.valueOf(0.85))) < 0) {
                        insights.add(new InsightResponse(
                                "INFO",
                                "Daromad rejasi ortda qolmoqda",
                                "Income target joriy oy tempiga nisbatan sust ketmoqda"
                        ));
                    }
                });
    }

    private void addCashflowInsights(
            List<InsightResponse> insights,
            List<CurrencyTotal> incomeTotals,
            List<CurrencyTotal> expenseTotals
    ) {
        expenseTotals.forEach(expense -> {
            BigDecimal income = incomeTotals.stream()
                    .filter(item -> item.currency().equalsIgnoreCase(expense.currency()))
                    .map(CurrencyTotal::amount)
                    .findFirst()
                    .orElse(BigDecimal.ZERO);

            if (expense.amount().compareTo(income) > 0) {
                insights.add(new InsightResponse(
                        "WARNING",
                        "Cashflow manfiy zonada",
                        "%s bo'yicha bu oy xarajat tushumdan yuqori".formatted(expense.currency())
                ));
            }
        });
    }

    private void addDebtInsights(List<InsightResponse> insights, List<DebtRecord> debts) {
        LocalDate today = LocalDate.now();
        debts.stream()
                .filter(item -> item.getStatus() == DebtStatus.OPEN)
                .filter(item -> item.getDueDate() != null)
                .filter(item -> !item.getDueDate().isBefore(today))
                .filter(item -> ChronoUnit.DAYS.between(today, item.getDueDate()) <= 3)
                .sorted(Comparator.comparing(DebtRecord::getDueDate))
                .findFirst()
                .ifPresent(item -> insights.add(new InsightResponse(
                        item.getType() == DebtType.DEBT ? "WARNING" : "INFO",
                        "Qarz muddati yaqin",
                        "%s bilan yozuvning muddati %s kuni tugaydi".formatted(
                                item.getCounterparty(),
                                item.getDueDate()
                        )
                )));
    }

    private static int priorityOf(InsightResponse insight) {
        return switch (insight.level()) {
            case "WARNING" -> 0;
            case "INFO" -> 1;
            case "SUCCESS" -> 2;
            default -> 3;
        };
    }
}
