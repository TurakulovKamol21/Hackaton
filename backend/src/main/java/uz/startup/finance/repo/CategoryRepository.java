package uz.startup.finance.repo;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.startup.finance.model.Category;
import uz.startup.finance.model.TransactionType;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByTypeOrderByNameAsc(TransactionType type);

    Optional<Category> findByNameIgnoreCaseAndType(String name, TransactionType type);
}
