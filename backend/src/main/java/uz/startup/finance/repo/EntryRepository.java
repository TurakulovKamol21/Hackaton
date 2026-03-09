package uz.startup.finance.repo;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.startup.finance.model.Entry;

public interface EntryRepository extends JpaRepository<Entry, Long> {

    List<Entry> findByTransactionDateBetweenOrderByTransactionDateDescIdDesc(LocalDate start, LocalDate end);

    boolean existsByAccountId(Long accountId);
}
