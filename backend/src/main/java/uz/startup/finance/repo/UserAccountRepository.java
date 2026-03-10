package uz.startup.finance.repo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.startup.finance.domain.entity.UserAccount;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByPhoneNumber(String phoneNumber);

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    Optional<UserAccount> findByGoogleSubject(String googleSubject);

    boolean existsByPhoneNumber(String phoneNumber);
}
