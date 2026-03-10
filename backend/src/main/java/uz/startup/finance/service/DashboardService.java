package uz.startup.finance.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.ChronoField;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.startup.finance.dto.FinanceDtos.BudgetComparison;
import uz.startup.finance.dto.FinanceDtos.CalendarItem;
import uz.startup.finance.dto.FinanceDtos.CategoryStat;
import uz.startup.finance.dto.FinanceDtos.CurrencyTotal;
import uz.startup.finance.dto.FinanceDtos.DashboardResponse;
import uz.startup.finance.dto.FinanceDtos.DebtSummary;
import uz.startup.finance.dto.FinanceDtos.PeriodStat;
import uz.startup.finance.domain.entity.Budget;
import uz.startup.finance.domain.entity.DebtRecord;
import uz.startup.finance.domain.entity.Entry;
import uz.startup.finance.domain.entity.Transfer;
import uz.startup.finance.domain.enums.BudgetType;
import uz.startup.finance.domain.enums.DebtStatus;
import uz.startup.finance.domain.enums.DebtType;
import uz.startup.finance.domain.enums.TransactionType;
import uz.startup.finance.domain.enums.TrendGranularity;
import uz.startup.finance.repo.BudgetRepository;
import uz.startup.finance.repo.DebtRecordRepository;
import uz.startup.finance.repo.EntryRepository;
import uz.startup.finance.repo.TransferRepository;
import uz.startup.finance.security.CurrentUserService;

@Service
public class DashboardService {

    private static final DateTimeFormatter CALENDAR_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final AccountService accountService;
    private final BalanceService balanceService;
    private final EntryRepository entryRepository;
    private final TransferRepository transferRepository;
    private final BudgetRepository budgetRepository;
    private final DebtRecordRepository debtRecordRepository;
    private final DashboardInsightService dashboardInsightService;
    private final CurrentUserService currentUserService;

    public DashboardService(
            AccountService accountService,
            BalanceService balanceService,
            EntryRepository entryRepository,
            TransferRepository transferRepository,
            BudgetRepository budgetRepository,
            DebtRecordRepository debtRecordRepository,
            DashboardInsightService dashboardInsightService,
            CurrentUserService currentUserService
    ) {
        this.accountService = accountService;
        this.balanceService = balanceService;
        this.entryRepository = entryRepository;
        this.transferRepository = transferRepository;
        this.budgetRepository = budgetRepository;
        this.debtRecordRepository = debtRecordRepository;
        this.dashboardInsightService = dashboardInsightService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse buildDashboard(String monthValue, String granularityValue) {
        YearMonth month = monthValue == null || monthValue.isBlank() ? YearMonth.now() : YearMonth.parse(monthValue);
        TrendGranularity granularity = TrendGranularity.from(granularityValue);
        Long ownerId = currentUserService.currentUserId();

        List<Entry> allEntries = entryRepository.findAllByOwnerIdOrderByTransactionDateDescIdDesc(ownerId);
        List<Entry> monthEntries = allEntries.stream()
                .filter(entry -> YearMonth.from(entry.getTransactionDate()).equals(month))
                .toList();
        List<Transfer> monthTransfers = transferRepository
                .findByOwnerIdAndTransferDateBetweenOrderByTransferDateDescIdDesc(ownerId, month.atDay(1), month.atEndOfMonth());
        List<Budget> budgets = budgetRepository.findByOwnerIdAndMonthOrderByTypeAscIdAsc(ownerId, month.toString());
        List<DebtRecord> debts = debtRecordRepository.findAllByOwnerIdOrderByStatusAscOpenedOnDescIdDesc(ownerId);
        List<CurrencyTotal> incomeTotals = sumByCurrency(monthEntries, TransactionType.INCOME);
        List<CurrencyTotal> expenseTotals = sumByCurrency(monthEntries, TransactionType.EXPENSE);
        List<BudgetComparison> budgetComparisons = buildBudgetComparisons(budgets, monthEntries);
        List<DebtSummary> debtSummaries = buildDebtSummaries(debts);

        return new DashboardResponse(
                month.toString(),
                accountService.listAccounts(),
                balanceService.totalBalancesByCurrency(),
                incomeTotals,
                expenseTotals,
                budgetComparisons,
                buildCategoryStats(monthEntries),
                buildTrend(allEntries, month, granularity),
                buildCalendarItems(monthEntries, monthTransfers),
                debtSummaries,
                dashboardInsightService.buildInsights(month, incomeTotals, expenseTotals, budgetComparisons, debts)
        );
    }

    private List<CurrencyTotal> sumByCurrency(List<Entry> entries, TransactionType type) {
        return entries.stream()
                .filter(entry -> entry.getType() == type)
                .collect(HashMap<String, BigDecimal>::new,
                        (acc, entry) -> acc.merge(entry.getAccount().getCurrency(), entry.getAmount(), BigDecimal::add),
                        HashMap::putAll)
                .entrySet()
                .stream()
                .map(entry -> new CurrencyTotal(entry.getKey(), normalize(entry.getValue())))
                .sorted(Comparator.comparing(CurrencyTotal::currency, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private List<BudgetComparison> buildBudgetComparisons(List<Budget> budgets, List<Entry> monthEntries) {
        return budgets.stream()
                .map(budget -> {
                    BigDecimal actual = monthEntries.stream()
                            .filter(entry -> entry.getAccount().getCurrency().equalsIgnoreCase(budget.getCurrency()))
                            .filter(entry -> budget.getType() == BudgetType.INCOME_TARGET
                                    ? entry.getType() == TransactionType.INCOME
                                    : entry.getType() == TransactionType.EXPENSE)
                            .filter(entry -> budget.getCategory() == null
                                    || entry.getCategory().getId().equals(budget.getCategory().getId()))
                            .map(Entry::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    String label = budget.getType() == BudgetType.INCOME_TARGET
                            ? "Monthly income target"
                            : budget.getCategory().getName();
                    return new BudgetComparison(
                            label,
                            budget.getType(),
                            budget.getCurrency(),
                            normalize(budget.getAmount()),
                            normalize(actual),
                            normalize(actual.subtract(budget.getAmount()))
                    );
                })
                .toList();
    }

    private List<CategoryStat> buildCategoryStats(List<Entry> monthEntries) {
        Map<CategoryKey, BigDecimal> totals = new HashMap<>();
        for (Entry entry : monthEntries) {
            CategoryKey key = new CategoryKey(
                    entry.getCategory().getName(),
                    entry.getType(),
                    entry.getAccount().getCurrency()
            );
            totals.merge(key, entry.getAmount(), BigDecimal::add);
        }

        return totals.entrySet().stream()
                .map(entry -> new CategoryStat(
                        entry.getKey().category(),
                        entry.getKey().type(),
                        entry.getKey().currency(),
                        normalize(entry.getValue())
                ))
                .sorted(Comparator.comparing(CategoryStat::type)
                        .thenComparing(CategoryStat::total, Comparator.reverseOrder()))
                .toList();
    }

    private List<PeriodStat> buildTrend(List<Entry> allEntries, YearMonth selectedMonth, TrendGranularity granularity) {
        Map<TrendKey, TrendBucket> buckets = new HashMap<>();
        for (Entry entry : allEntries) {
            TrendKey key = resolveTrendKey(entry, selectedMonth, granularity);
            if (key == null) {
                continue;
            }
            TrendBucket bucket = buckets.computeIfAbsent(key, ignored -> new TrendBucket());
            if (entry.getType() == TransactionType.INCOME) {
                bucket.income = bucket.income.add(entry.getAmount());
            } else {
                bucket.expense = bucket.expense.add(entry.getAmount());
            }
        }

        return buckets.entrySet().stream()
                .sorted(Map.Entry.<TrendKey, TrendBucket>comparingByKey())
                .map(entry -> new PeriodStat(
                        entry.getKey().label(),
                        entry.getKey().currency(),
                        normalize(entry.getValue().income),
                        normalize(entry.getValue().expense),
                        normalize(entry.getValue().income.subtract(entry.getValue().expense))
                ))
                .toList();
    }

    private TrendKey resolveTrendKey(Entry entry, YearMonth selectedMonth, TrendGranularity granularity) {
        LocalDate date = entry.getTransactionDate();
        String currency = entry.getAccount().getCurrency();

        return switch (granularity) {
            case DAILY -> {
                if (!YearMonth.from(date).equals(selectedMonth)) {
                    yield null;
                }
                yield new TrendKey(date.getDayOfMonth(), date.format(DateTimeFormatter.ofPattern("dd MMM", Locale.ENGLISH)), currency);
            }
            case WEEKLY -> {
                if (!YearMonth.from(date).equals(selectedMonth)) {
                    yield null;
                }
                int week = date.get(ChronoField.ALIGNED_WEEK_OF_MONTH);
                yield new TrendKey(week, "Week " + week, currency);
            }
            case MONTHLY -> {
                if (date.getYear() != selectedMonth.getYear()) {
                    yield null;
                }
                int monthOrder = date.getMonthValue();
                String label = date.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                yield new TrendKey(monthOrder, label, currency);
            }
            case YEARLY -> new TrendKey(date.getYear(), String.valueOf(date.getYear()), currency);
        };
    }

    private List<CalendarItem> buildCalendarItems(List<Entry> monthEntries, List<Transfer> monthTransfers) {
        List<CalendarItem> items = new ArrayList<>();
        for (Entry entry : monthEntries) {
            items.add(new CalendarItem(
                    entry.getTransactionDate().format(CALENDAR_FORMAT),
                    entry.getType().name(),
                    entry.getTitle(),
                    entry.getAccount().getCurrency(),
                    normalize(entry.getAmount()),
                    entry.getCategory().getName() + " • " + entry.getAccount().getName()
            ));
        }
        for (Transfer transfer : monthTransfers) {
            items.add(new CalendarItem(
                    transfer.getTransferDate().format(CALENDAR_FORMAT),
                    "TRANSFER",
                    transfer.getFromAccount().getName() + " -> " + transfer.getToAccount().getName(),
                    transfer.getFromAccount().getCurrency() + " -> " + transfer.getToAccount().getCurrency(),
                    normalize(transfer.getFromAmount()),
                    normalize(transfer.getToAmount()) + " received"
            ));
        }

        return items.stream()
                .sorted(Comparator.comparing(CalendarItem::date).reversed())
                .toList();
    }

    private List<DebtSummary> buildDebtSummaries(List<DebtRecord> debts) {
        Map<String, DebtBucket> buckets = new HashMap<>();
        debts.stream()
                .filter(debt -> debt.getStatus() == DebtStatus.OPEN)
                .forEach(debt -> {
                    DebtBucket bucket = buckets.computeIfAbsent(debt.getCurrency(), ignored -> new DebtBucket());
                    if (debt.getType() == DebtType.DEBT) {
                        bucket.debt = bucket.debt.add(debt.getAmount());
                    } else {
                        bucket.receivable = bucket.receivable.add(debt.getAmount());
                    }
                });

        return buckets.entrySet().stream()
                .map(entry -> new DebtSummary(
                        entry.getKey(),
                        normalize(entry.getValue().debt),
                        normalize(entry.getValue().receivable)
                ))
                .sorted(Comparator.comparing(DebtSummary::currency, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private BigDecimal normalize(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private record CategoryKey(String category, TransactionType type, String currency) {
    }

    private record TrendKey(Integer order, String label, String currency) implements Comparable<TrendKey> {

        @Override
        public int compareTo(TrendKey other) {
            int byOrder = this.order.compareTo(other.order);
            if (byOrder != 0) {
                return byOrder;
            }
            return this.currency.compareToIgnoreCase(other.currency);
        }
    }

    private static final class TrendBucket {
        private BigDecimal income = BigDecimal.ZERO;
        private BigDecimal expense = BigDecimal.ZERO;
    }

    private static final class DebtBucket {
        private BigDecimal debt = BigDecimal.ZERO;
        private BigDecimal receivable = BigDecimal.ZERO;
    }
}
