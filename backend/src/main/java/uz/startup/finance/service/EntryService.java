package uz.startup.finance.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.startup.finance.dto.FinanceDtos.EntryResponse;
import uz.startup.finance.dto.FinanceDtos.UpsertEntryRequest;
import uz.startup.finance.model.Category;
import uz.startup.finance.model.Entry;
import uz.startup.finance.model.TransactionType;
import uz.startup.finance.repo.EntryRepository;

@Service
public class EntryService {

    private final EntryRepository entryRepository;
    private final CategoryService categoryService;
    private final AccountService accountService;

    public EntryService(
            EntryRepository entryRepository,
            CategoryService categoryService,
            AccountService accountService
    ) {
        this.entryRepository = entryRepository;
        this.categoryService = categoryService;
        this.accountService = accountService;
    }

    @Transactional(readOnly = true)
    public List<EntryResponse> listEntries(TransactionType type, LocalDate from, LocalDate to) {
        return entryRepository.findAll().stream()
                .filter(entry -> type == null || entry.getType() == type)
                .filter(entry -> from == null || !entry.getTransactionDate().isBefore(from))
                .filter(entry -> to == null || !entry.getTransactionDate().isAfter(to))
                .sorted(Comparator
                        .comparing(Entry::getTransactionDate, Comparator.reverseOrder())
                        .thenComparing(Entry::getId, Comparator.reverseOrder()))
                .map(FinanceMapper::toEntryResponse)
                .toList();
    }

    @Transactional
    public EntryResponse createEntry(UpsertEntryRequest request) {
        Category category = validateCategory(request);
        Entry entry = new Entry();
        entry.setType(request.type());
        entry.setAmount(request.amount());
        entry.setTransactionDate(request.transactionDate());
        entry.setTitle(request.title().trim());
        entry.setNote(trimToNull(request.note()));
        entry.setCategory(category);
        entry.setAccount(accountService.requireAccount(request.accountId()));
        Entry saved = entryRepository.save(entry);
        return FinanceMapper.toEntryResponse(saved);
    }

    @Transactional
    public EntryResponse updateEntry(Long id, UpsertEntryRequest request) {
        Category category = validateCategory(request);
        Entry entry = entryRepository.findById(id).orElseThrow(() -> new NotFoundException("Entry not found: " + id));
        entry.setType(request.type());
        entry.setAmount(request.amount());
        entry.setTransactionDate(request.transactionDate());
        entry.setTitle(request.title().trim());
        entry.setNote(trimToNull(request.note()));
        entry.setCategory(category);
        entry.setAccount(accountService.requireAccount(request.accountId()));
        return FinanceMapper.toEntryResponse(entry);
    }

    @Transactional
    public void deleteEntry(Long id) {
        Entry entry = entryRepository.findById(id).orElseThrow(() -> new NotFoundException("Entry not found: " + id));
        entryRepository.delete(entry);
    }

    private Category validateCategory(UpsertEntryRequest request) {
        Category category = categoryService.requireCategory(request.categoryId());
        if (category.getType() != request.type()) {
            throw new BadRequestException("Category type does not match entry type");
        }
        return category;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
