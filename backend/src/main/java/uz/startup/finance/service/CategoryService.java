package uz.startup.finance.service;

import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.startup.finance.dto.FinanceDtos.CategoryResponse;
import uz.startup.finance.model.Category;
import uz.startup.finance.repo.CategoryRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator
                        .comparing((Category category) -> category.getType().name())
                        .thenComparing(Category::getName, String.CASE_INSENSITIVE_ORDER))
                .map(FinanceMapper::toCategoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Category requireCategory(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new NotFoundException("Category not found: " + id));
    }
}
