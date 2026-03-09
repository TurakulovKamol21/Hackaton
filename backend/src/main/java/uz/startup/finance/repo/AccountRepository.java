package uz.startup.finance.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.startup.finance.model.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {
}
