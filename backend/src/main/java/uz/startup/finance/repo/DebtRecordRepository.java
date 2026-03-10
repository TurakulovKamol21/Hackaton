package uz.startup.finance.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.startup.finance.domain.entity.DebtRecord;

public interface DebtRecordRepository extends JpaRepository<DebtRecord, Long> {

    List<DebtRecord> findAllByOwnerIdOrderByStatusAscOpenedOnDescIdDesc(Long ownerId);

    java.util.Optional<DebtRecord> findByIdAndOwnerId(Long id, Long ownerId);
}
