package uz.startup.finance.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import uz.startup.finance.model.Account;
import uz.startup.finance.model.AccountType;
import uz.startup.finance.model.Budget;
import uz.startup.finance.model.BudgetType;
import uz.startup.finance.model.Category;
import uz.startup.finance.model.DebtRecord;
import uz.startup.finance.model.DebtStatus;
import uz.startup.finance.model.DebtType;
import uz.startup.finance.model.Entry;
import uz.startup.finance.model.TransactionType;
import uz.startup.finance.model.Transfer;
import uz.startup.finance.repo.AccountRepository;
import uz.startup.finance.repo.BudgetRepository;
import uz.startup.finance.repo.CategoryRepository;
import uz.startup.finance.repo.DebtRecordRepository;
import uz.startup.finance.repo.EntryRepository;
import uz.startup.finance.repo.TransferRepository;

@Configuration
public class SeedDataConfig {

    @Bean
    CommandLineRunner seedData(
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            EntryRepository entryRepository,
            TransferRepository transferRepository,
            DebtRecordRepository debtRecordRepository,
            BudgetRepository budgetRepository
    ) {
        return args -> {
            if (accountRepository.count() > 0) {
                return;
            }

            Account visa = accountRepository.save(account("My Visa", AccountType.BANK_CARD, "UZS", "2500000.00"));
            Account cash = accountRepository.save(account("Cash Wallet", AccountType.CASH, "UZS", "450000.00"));
            Account usdSavings = accountRepository.save(account("USD Savings", AccountType.SAVINGS, "USD", "300.00"));

            Category salary = categoryRepository.save(category("Salary", TransactionType.INCOME));
            Category freelance = categoryRepository.save(category("Freelance", TransactionType.INCOME));
            Category cashback = categoryRepository.save(category("Cashback", TransactionType.INCOME));
            Category grocery = categoryRepository.save(category("Grocery", TransactionType.EXPENSE));
            Category transport = categoryRepository.save(category("Transport", TransactionType.EXPENSE));
            Category utilities = categoryRepository.save(category("Utilities", TransactionType.EXPENSE));
            Category dining = categoryRepository.save(category("Dining", TransactionType.EXPENSE));
            Category entertainment = categoryRepository.save(category("Entertainment", TransactionType.EXPENSE));

            LocalDate today = LocalDate.now();
            LocalDate currentMonth = YearMonth.from(today).atDay(1);
            LocalDate previousMonth = currentMonth.minusMonths(1);
            LocalDate twoMonthsAgo = currentMonth.minusMonths(2);

            entryRepository.saveAll(List.of(
                    entry(TransactionType.INCOME, "7000000.00", currentMonth.plusDays(1), "Oylik maosh", "Mart oyi maoshi", salary, visa),
                    entry(TransactionType.INCOME, "1200000.00", currentMonth.plusDays(6), "Website freelance", "Landing page project", freelance, visa),
                    entry(TransactionType.INCOME, "55000.00", currentMonth.plusDays(8), "Cashback", "Card cashback", cashback, visa),
                    entry(TransactionType.EXPENSE, "385000.00", currentMonth.plusDays(2), "Korzinka grocery", "Haftalik xarid", grocery, visa),
                    entry(TransactionType.EXPENSE, "95000.00", currentMonth.plusDays(3), "Yandex Go", "Office ride", transport, visa),
                    entry(TransactionType.EXPENSE, "210000.00", currentMonth.plusDays(4), "Electricity bill", "Kommunal to'lov", utilities, cash),
                    entry(TransactionType.EXPENSE, "155000.00", currentMonth.plusDays(7), "Dinner with family", "Weekend dinner", dining, visa),
                    entry(TransactionType.EXPENSE, "89000.00", currentMonth.plusDays(10), "Cinema", "Movie night", entertainment, cash),
                    entry(TransactionType.INCOME, "6800000.00", previousMonth.plusDays(2), "Oylik maosh", "Oldingi oy", salary, visa),
                    entry(TransactionType.EXPENSE, "410000.00", previousMonth.plusDays(4), "Grocery restock", "Oldingi oy", grocery, visa),
                    entry(TransactionType.EXPENSE, "140000.00", previousMonth.plusDays(11), "Gas & taxi", "Transport", transport, cash),
                    entry(TransactionType.INCOME, "6400000.00", twoMonthsAgo.plusDays(3), "Oylik maosh", "Ikki oy oldin", salary, visa),
                    entry(TransactionType.EXPENSE, "320000.00", twoMonthsAgo.plusDays(6), "Supermarket", "Ikki oy oldin", grocery, visa)
            ));

            transferRepository.save(transfer(
                    visa,
                    usdSavings,
                    "1280000.00",
                    "100.00",
                    "12800.000000",
                    currentMonth.plusDays(5),
                    "USD jamg'arma uchun konvertatsiya"
            ));

            debtRecordRepository.saveAll(List.of(
                    debt(DebtType.DEBT, "Aziz", "500000.00", "UZS", currentMonth.plusDays(2), currentMonth.plusDays(25), DebtStatus.OPEN, "Qisqa muddatli qarz"),
                    debt(DebtType.RECEIVABLE, "Sardor", "250000.00", "UZS", previousMonth.plusDays(8), previousMonth.plusDays(28), DebtStatus.CLOSED, "Qaytarilgan")
            ));

            String activeMonth = YearMonth.from(today).toString();
            budgetRepository.saveAll(List.of(
                    budget(activeMonth, BudgetType.INCOME_TARGET, "8000000.00", "UZS", null),
                    budget(activeMonth, BudgetType.EXPENSE_LIMIT, "1500000.00", "UZS", grocery),
                    budget(activeMonth, BudgetType.EXPENSE_LIMIT, "600000.00", "UZS", utilities),
                    budget(activeMonth, BudgetType.EXPENSE_LIMIT, "900000.00", "UZS", dining)
            ));
        };
    }

    private Account account(String name, AccountType type, String currency, String initialBalance) {
        Account account = new Account();
        account.setName(name);
        account.setType(type);
        account.setCurrency(currency);
        account.setInitialBalance(new BigDecimal(initialBalance));
        return account;
    }

    private Category category(String name, TransactionType type) {
        Category category = new Category();
        category.setName(name);
        category.setType(type);
        return category;
    }

    private Entry entry(
            TransactionType type,
            String amount,
            LocalDate transactionDate,
            String title,
            String note,
            Category category,
            Account account
    ) {
        Entry entry = new Entry();
        entry.setType(type);
        entry.setAmount(new BigDecimal(amount));
        entry.setTransactionDate(transactionDate);
        entry.setTitle(title);
        entry.setNote(note);
        entry.setCategory(category);
        entry.setAccount(account);
        return entry;
    }

    private Transfer transfer(
            Account fromAccount,
            Account toAccount,
            String fromAmount,
            String toAmount,
            String rate,
            LocalDate transferDate,
            String note
    ) {
        Transfer transfer = new Transfer();
        transfer.setFromAccount(fromAccount);
        transfer.setToAccount(toAccount);
        transfer.setFromAmount(new BigDecimal(fromAmount));
        transfer.setToAmount(new BigDecimal(toAmount));
        transfer.setRate(new BigDecimal(rate));
        transfer.setTransferDate(transferDate);
        transfer.setNote(note);
        return transfer;
    }

    private DebtRecord debt(
            DebtType type,
            String counterparty,
            String amount,
            String currency,
            LocalDate openedOn,
            LocalDate dueDate,
            DebtStatus status,
            String note
    ) {
        DebtRecord debtRecord = new DebtRecord();
        debtRecord.setType(type);
        debtRecord.setCounterparty(counterparty);
        debtRecord.setAmount(new BigDecimal(amount));
        debtRecord.setCurrency(currency);
        debtRecord.setOpenedOn(openedOn);
        debtRecord.setDueDate(dueDate);
        debtRecord.setStatus(status);
        debtRecord.setNote(note);
        return debtRecord;
    }

    private Budget budget(String month, BudgetType type, String amount, String currency, Category category) {
        Budget budget = new Budget();
        budget.setMonth(month);
        budget.setType(type);
        budget.setAmount(new BigDecimal(amount));
        budget.setCurrency(currency);
        budget.setCategory(category);
        return budget;
    }
}
