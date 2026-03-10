package uz.startup.finance.repo;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.startup.finance.domain.entity.Entry;

public interface EntryRepository extends JpaRepository<Entry, Long> {

    List<Entry> findAllByOwnerIdOrderByTransactionDateDescIdDesc(Long ownerId);

    List<Entry> findByOwnerIdAndTransactionDateBetweenOrderByTransactionDateDescIdDesc(Long ownerId, LocalDate start, LocalDate end);

    java.util.Optional<Entry> findByIdAndOwnerId(Long id, Long ownerId);

    boolean existsByOwnerIdAndAccountId(Long ownerId, Long accountId);
}
