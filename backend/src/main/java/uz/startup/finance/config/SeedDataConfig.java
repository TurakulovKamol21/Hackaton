package uz.startup.finance.config;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import uz.startup.finance.domain.entity.Category;
import uz.startup.finance.domain.enums.TransactionType;
import uz.startup.finance.repo.CategoryRepository;

@Configuration
public class SeedDataConfig {

    @Bean
    CommandLineRunner seedCategories(CategoryRepository categoryRepository) {
        return args -> {
            if (categoryRepository.count() > 0) {
                return;
            }

            categoryRepository.saveAll(List.of(
                    category("Salary", TransactionType.INCOME),
                    category("Freelance", TransactionType.INCOME),
                    category("Cashback", TransactionType.INCOME),
                    category("Gift", TransactionType.INCOME),
                    category("Grocery", TransactionType.EXPENSE),
                    category("Transport", TransactionType.EXPENSE),
                    category("Utilities", TransactionType.EXPENSE),
                    category("Dining", TransactionType.EXPENSE),
                    category("Entertainment", TransactionType.EXPENSE),
                    category("Healthcare", TransactionType.EXPENSE)
            ));
        };
    }

    private Category category(String name, TransactionType type) {
        Category category = new Category();
        category.setName(name);
        category.setType(type);
        return category;
    }
}
