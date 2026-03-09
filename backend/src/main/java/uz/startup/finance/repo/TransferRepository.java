package uz.startup.finance.repo;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.startup.finance.model.Transfer;

public interface TransferRepository extends JpaRepository<Transfer, Long> {

    List<Transfer> findByTransferDateBetweenOrderByTransferDateDescIdDesc(LocalDate start, LocalDate end);

    boolean existsByFromAccountIdOrToAccountId(Long fromAccountId, Long toAccountId);
}
