package uz.startup.finance.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.startup.finance.dto.FinanceDtos.AccountResponse;
import uz.startup.finance.dto.FinanceDtos.CreateAccountRequest;
import uz.startup.finance.model.Account;
import uz.startup.finance.repo.AccountRepository;
import uz.startup.finance.repo.EntryRepository;
import uz.startup.finance.repo.TransferRepository;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final BalanceService balanceService;
    private final EntryRepository entryRepository;
    private final TransferRepository transferRepository;

    public AccountService(
            AccountRepository accountRepository,
            BalanceService balanceService,
            EntryRepository entryRepository,
            TransferRepository transferRepository
    ) {
        this.accountRepository = accountRepository;
        this.balanceService = balanceService;
        this.entryRepository = entryRepository;
        this.transferRepository = transferRepository;
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> listAccounts() {
        Map<Long, BigDecimal> balances = balanceService.currentBalances();
        return accountRepository.findAll().stream()
                .sorted(Comparator.comparing(Account::getName, String.CASE_INSENSITIVE_ORDER))
                .map(account -> FinanceMapper.toAccountResponse(account, balances.getOrDefault(account.getId(), account.getInitialBalance())))
                .toList();
    }

    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        Account account = new Account();
        applyAccountUpdate(account, request, false);
        Account saved = accountRepository.saveAndFlush(account);
        return FinanceMapper.toAccountResponse(saved, saved.getInitialBalance());
    }

    @Transactional
    public AccountResponse updateAccount(Long id, CreateAccountRequest request) {
        Account account = requireAccount(id);
        applyAccountUpdate(account, request, true);
        Account saved = accountRepository.saveAndFlush(account);
        BigDecimal currentBalance = balanceService.currentBalances().getOrDefault(saved.getId(), saved.getInitialBalance());
        return FinanceMapper.toAccountResponse(saved, currentBalance);
    }

    @Transactional
    public void deleteAccount(Long id) {
        Account account = requireAccount(id);
        if (hasActivity(id)) {
            throw new BadRequestException("Active transactions or transfers are linked to this account");
        }
        accountRepository.delete(account);
    }

    @Transactional(readOnly = true)
    public Account requireAccount(Long id) {
        return accountRepository.findById(id).orElseThrow(() -> new NotFoundException("Account not found: " + id));
    }

    private void applyAccountUpdate(Account account, CreateAccountRequest request, boolean existingAccount) {
        String nextCurrency = request.currency().trim().toUpperCase(Locale.ROOT);
        if (existingAccount
                && !account.getCurrency().equalsIgnoreCase(nextCurrency)
                && hasActivity(account.getId())) {
            throw new BadRequestException("Account currency cannot be changed after transactions or transfers exist");
        }

        account.setName(request.name().trim());
        account.setType(request.type());
        account.setCurrency(nextCurrency);
        account.setInitialBalance(request.initialBalance());
    }

    private boolean hasActivity(Long accountId) {
        return entryRepository.existsByAccountId(accountId)
                || transferRepository.existsByFromAccountIdOrToAccountId(accountId, accountId);
    }
}
