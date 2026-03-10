package uz.startup.finance.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.startup.finance.dto.FinanceDtos.CurrencyTotal;
import uz.startup.finance.domain.entity.Account;
import uz.startup.finance.domain.entity.Entry;
import uz.startup.finance.domain.enums.TransactionType;
import uz.startup.finance.domain.entity.Transfer;
import uz.startup.finance.repo.AccountRepository;
import uz.startup.finance.repo.EntryRepository;
import uz.startup.finance.repo.TransferRepository;
import uz.startup.finance.security.CurrentUserService;

@Service
public class BalanceService {

    private final AccountRepository accountRepository;
    private final EntryRepository entryRepository;
    private final TransferRepository transferRepository;
    private final CurrentUserService currentUserService;

    public BalanceService(
            AccountRepository accountRepository,
            EntryRepository entryRepository,
            TransferRepository transferRepository,
            CurrentUserService currentUserService
    ) {
        this.accountRepository = accountRepository;
        this.entryRepository = entryRepository;
        this.transferRepository = transferRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public Map<Long, BigDecimal> currentBalances() {
        Long ownerId = currentUserService.currentUserId();
        List<Account> accounts = accountRepository.findAllByOwnerIdOrderByNameAsc(ownerId);
        List<Entry> entries = entryRepository.findAllByOwnerIdOrderByTransactionDateDescIdDesc(ownerId);
        List<Transfer> transfers = transferRepository.findAllByOwnerIdOrderByTransferDateDescIdDesc(ownerId);

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
        Long ownerId = currentUserService.currentUserId();
        Map<Long, BigDecimal> balances = currentBalances();
        return accountRepository.findAllByOwnerIdOrderByNameAsc(ownerId).stream()
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
