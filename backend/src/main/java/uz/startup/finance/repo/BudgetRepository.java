package uz.startup.finance.repo;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.startup.finance.domain.entity.Budget;
import uz.startup.finance.domain.enums.BudgetType;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByOwnerIdAndMonthOrderByTypeAscIdAsc(Long ownerId, String month);

    Optional<Budget> findByIdAndOwnerId(Long id, Long ownerId);

    Optional<Budget> findByOwnerIdAndMonthAndTypeAndCategoryId(Long ownerId, String month, BudgetType type, Long categoryId);
}
