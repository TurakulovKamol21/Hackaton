package uz.startup.finance.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.startup.finance.dto.FinanceDtos.CurrencyTotal;
import uz.startup.finance.model.Account;
import uz.startup.finance.model.Entry;
import uz.startup.finance.model.TransactionType;
import uz.startup.finance.model.Transfer;
import uz.startup.finance.repo.AccountRepository;
import uz.startup.finance.repo.EntryRepository;
import uz.startup.finance.repo.TransferRepository;

@Service
public class BalanceService {

    private final AccountRepository accountRepository;
    private final EntryRepository entryRepository;
    private final TransferRepository transferRepository;

    public BalanceService(
            AccountRepository accountRepository,
            EntryRepository entryRepository,
            TransferRepository transferRepository
    ) {
        this.accountRepository = accountRepository;
        this.entryRepository = entryRepository;
        this.transferRepository = transferRepository;
    }

    @Transactional(readOnly = true)
    public Map<Long, BigDecimal> currentBalances() {
        List<Account> accounts = accountRepository.findAll();
        List<Entry> entries = entryRepository.findAll();
        List<Transfer> transfers = transferRepository.findAll();

        Map<Long, BigDecimal> balances = new HashMap<>();
        accounts.forEach(account -> balances.put(account.getId(), normalize(account.getInitialBalance())));

        for (Entry entry : entries) {
            BigDecimal signedAmount = entry.getType() == TransactionType.INCOME
                    ? entry.getAmount()
                    : entry.getAmount().negate();
            balances.compute(entry.getAccount().getId(), (key, value) -> normalize(zeroIfNull(value).add(signedAmount)));
        }

        for (Transfer transfer : transfers) {
            balances.compute(
                    transfer.getFromAccount().getId(),
                    (key, value) -> normalize(zeroIfNull(value).subtract(transfer.getFromAmount()))
            );
            balances.compute(
                    transfer.getToAccount().getId(),
                    (key, value) -> normalize(zeroIfNull(value).add(transfer.getToAmount()))
            );
        }

        return balances;
    }

    @Transactional(readOnly = true)
    public List<CurrencyTotal> totalBalancesByCurrency() {
        Map<Long, BigDecimal> balances = currentBalances();
        return accountRepository.findAll().stream()
                .collect(HashMap<String, BigDecimal>::new, (acc, account) -> acc.merge(
                        account.getCurrency(),
                        balances.getOrDefault(account.getId(), BigDecimal.ZERO),
                        BigDecimal::add
                ), HashMap::putAll)
                .entrySet()
                .stream()
                .map(entry -> new CurrencyTotal(entry.getKey(), normalize(entry.getValue())))
                .sorted((left, right) -> left.currency().compareToIgnoreCase(right.currency()))
                .toList();
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private BigDecimal normalize(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
