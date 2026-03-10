package uz.startup.finance.service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.startup.finance.dto.FinanceDtos.BudgetResponse;
import uz.startup.finance.dto.FinanceDtos.UpsertBudgetRequest;
import uz.startup.finance.domain.entity.Budget;
import uz.startup.finance.domain.enums.BudgetType;
import uz.startup.finance.domain.entity.Category;
import uz.startup.finance.domain.enums.TransactionType;
import uz.startup.finance.repo.BudgetRepository;
import uz.startup.finance.security.CurrentUserService;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryService categoryService;
    private final CurrentUserService currentUserService;

    public BudgetService(
            BudgetRepository budgetRepository,
            CategoryService categoryService,
            CurrentUserService currentUserService
    ) {
        this.budgetRepository = budgetRepository;
        this.categoryService = categoryService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> listBudgets(String month) {
        return budgetRepository.findByOwnerIdAndMonthOrderByTypeAscIdAsc(currentUserService.currentUserId(), month).stream()
                .sorted(Comparator.comparing(budget -> budget.getType().name()))
                .map(FinanceMapper::toBudgetResponse)
                .toList();
    }

    @Transactional
    public BudgetResponse saveBudget(UpsertBudgetRequest request) {
        Category category = validateRequest(request);
        Budget budget = budgetRepository.findByOwnerIdAndMonthOrderByTypeAscIdAsc(currentUserService.currentUserId(), request.month()).stream()
                .filter(candidate -> candidate.getType() == request.type())
                .filter(candidate -> Objects.equals(
                        candidate.getCategory() == null ? null : candidate.getCategory().getId(),
                        request.categoryId()
                ))
                .findFirst()
                .orElseGet(Budget::new);

        if (budget.getOwner() == null) {
            budget.setOwner(currentUserService.currentUser());
        }
        budget.setMonth(request.month());
        budget.setType(request.type());
        budget.setAmount(request.amount());
        budget.setCurrency(request.currency().trim().toUpperCase(Locale.ROOT));
        budget.setCategory(category);

        return FinanceMapper.toBudgetResponse(budgetRepository.save(budget));
    }

    @Transactional
    public void deleteBudget(Long id) {
        Budget budget = budgetRepository.findByIdAndOwnerId(id, currentUserService.currentUserId())
                .orElseThrow(() -> new NotFoundException("Budget not found: " + id));
        budgetRepository.delete(budget);
    }

    private Category validateRequest(UpsertBudgetRequest request) {
        if (!request.month().matches("\\d{4}-\\d{2}")) {
            throw new BadRequestException("Month must be in YYYY-MM format");
        }

        if (request.type() == BudgetType.INCOME_TARGET) {
            if (request.categoryId() != null) {
                throw new BadRequestException("Income target budget should not have a category");
            }
            return null;
        }

        if (request.categoryId() == null) {
            throw new BadRequestException("Expense limit budget requires a category");
        }

        Category category = categoryService.requireCategory(request.categoryId());
        if (category.getType() != TransactionType.EXPENSE) {
            throw new BadRequestException("Expense limit budget requires an expense category");
        }
        return category;
    }
}
