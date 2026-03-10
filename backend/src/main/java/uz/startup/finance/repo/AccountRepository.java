package uz.startup.finance.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.startup.finance.domain.entity.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {

    java.util.List<Account> findAllByOwnerIdOrderByNameAsc(Long ownerId);

    java.util.Optional<Account> findByIdAndOwnerId(Long id, Long ownerId);
}
