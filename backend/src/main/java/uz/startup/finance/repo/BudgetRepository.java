package uz.startup.finance.repo;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.startup.finance.model.Budget;
import uz.startup.finance.model.BudgetType;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByMonthOrderByTypeAscIdAsc(String month);

    Optional<Budget> findByMonthAndTypeAndCategoryId(String month, BudgetType type, Long categoryId);
}
