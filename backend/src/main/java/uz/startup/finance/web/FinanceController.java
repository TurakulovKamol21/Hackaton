package uz.startup.finance.web;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import uz.startup.finance.dto.FinanceDtos.AccountResponse;
import uz.startup.finance.dto.FinanceDtos.BudgetResponse;
import uz.startup.finance.dto.FinanceDtos.CreateAccountRequest;
import uz.startup.finance.dto.FinanceDtos.CreateTransferRequest;
import uz.startup.finance.dto.FinanceDtos.DashboardResponse;
import uz.startup.finance.dto.FinanceDtos.DebtResponse;
import uz.startup.finance.dto.FinanceDtos.EntryResponse;
import uz.startup.finance.dto.FinanceDtos.ReferenceResponse;
import uz.startup.finance.dto.FinanceDtos.TransferResponse;
import uz.startup.finance.dto.FinanceDtos.UpsertBudgetRequest;
import uz.startup.finance.dto.FinanceDtos.UpsertDebtRequest;
import uz.startup.finance.dto.FinanceDtos.UpsertEntryRequest;
import uz.startup.finance.model.TransactionType;
import uz.startup.finance.service.AccountService;
import uz.startup.finance.service.BudgetService;
import uz.startup.finance.service.CategoryService;
import uz.startup.finance.service.DashboardService;
import uz.startup.finance.service.DebtService;
import uz.startup.finance.service.EntryService;
import uz.startup.finance.service.TransferService;

@RestController
@RequestMapping("/api")
public class FinanceController {

    private final AccountService accountService;
    private final CategoryService categoryService;
    private final EntryService entryService;
    private final TransferService transferService;
    private final DebtService debtService;
    private final BudgetService budgetService;
    private final DashboardService dashboardService;

    public FinanceController(
            AccountService accountService,
            CategoryService categoryService,
            EntryService entryService,
            TransferService transferService,
            DebtService debtService,
            BudgetService budgetService,
            DashboardService dashboardService
    ) {
        this.accountService = accountService;
        this.categoryService = categoryService;
        this.entryService = entryService;
        this.transferService = transferService;
        this.debtService = debtService;
        this.budgetService = budgetService;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/reference")
    public ReferenceResponse reference() {
        return new ReferenceResponse(accountService.listAccounts(), categoryService.listCategories());
    }

    @GetMapping("/accounts")
    public List<AccountResponse> accounts() {
        return accountService.listAccounts();
    }

    @PostMapping("/accounts")
    @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse createAccount(@Valid @RequestBody CreateAccountRequest request) {
        return accountService.createAccount(request);
    }

    @PutMapping("/accounts/{id}")
    public AccountResponse updateAccount(@PathVariable Long id, @Valid @RequestBody CreateAccountRequest request) {
        return accountService.updateAccount(id, request);
    }

    @DeleteMapping("/accounts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
    }

    @GetMapping("/entries")
    public List<EntryResponse> entries(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to
    ) {
        return entryService.listEntries(type, from, to);
    }

    @PostMapping("/entries")
    @ResponseStatus(HttpStatus.CREATED)
    public EntryResponse createEntry(@Valid @RequestBody UpsertEntryRequest request) {
        return entryService.createEntry(request);
    }

    @PutMapping("/entries/{id}")
    public EntryResponse updateEntry(@PathVariable Long id, @Valid @RequestBody UpsertEntryRequest request) {
        return entryService.updateEntry(id, request);
    }

    @DeleteMapping("/entries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEntry(@PathVariable Long id) {
        entryService.deleteEntry(id);
    }

    @GetMapping("/transfers")
    public List<TransferResponse> transfers() {
        return transferService.listTransfers();
    }

    @PostMapping("/transfers")
    @ResponseStatus(HttpStatus.CREATED)
    public TransferResponse createTransfer(@Valid @RequestBody CreateTransferRequest request) {
        return transferService.createTransfer(request);
    }

    @GetMapping("/debts")
    public List<DebtResponse> debts() {
        return debtService.listDebts();
    }

    @PostMapping("/debts")
    @ResponseStatus(HttpStatus.CREATED)
    public DebtResponse createDebt(@Valid @RequestBody UpsertDebtRequest request) {
        return debtService.createDebt(request);
    }

    @PutMapping("/debts/{id}")
    public DebtResponse updateDebt(@PathVariable Long id, @Valid @RequestBody UpsertDebtRequest request) {
        return debtService.updateDebt(id, request);
    }

    @DeleteMapping("/debts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDebt(@PathVariable Long id) {
        debtService.deleteDebt(id);
    }

    @GetMapping("/budgets")
    public List<BudgetResponse> budgets(@RequestParam(required = false) String month) {
        return budgetService.listBudgets(defaultMonth(month));
    }

    @PostMapping("/budgets")
    public BudgetResponse saveBudget(@Valid @RequestBody UpsertBudgetRequest request) {
        return budgetService.saveBudget(request);
    }

    @DeleteMapping("/budgets/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String granularity
    ) {
        return dashboardService.buildDashboard(defaultMonth(month), granularity);
    }

    private String defaultMonth(String month) {
        return month == null || month.isBlank() ? YearMonth.now().toString() : month;
    }
}
