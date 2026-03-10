package uz.startup.finance.repo;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.startup.finance.domain.entity.Transfer;

public interface TransferRepository extends JpaRepository<Transfer, Long> {

    List<Transfer> findAllByOwnerIdOrderByTransferDateDescIdDesc(Long ownerId);

    List<Transfer> findByOwnerIdAndTransferDateBetweenOrderByTransferDateDescIdDesc(Long ownerId, LocalDate start, LocalDate end);

    boolean existsByOwnerIdAndFromAccountId(Long ownerId, Long fromAccountId);

    boolean existsByOwnerIdAndToAccountId(Long ownerId, Long toAccountId);
}
