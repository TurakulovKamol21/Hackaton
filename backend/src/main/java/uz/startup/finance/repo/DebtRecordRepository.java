package uz.startup.finance.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.startup.finance.model.DebtRecord;

public interface DebtRecordRepository extends JpaRepository<DebtRecord, Long> {

    List<DebtRecord> findAllByOrderByStatusAscOpenedOnDescIdDesc();
}
