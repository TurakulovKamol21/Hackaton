package uz.startup.finance.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import uz.startup.finance.domain.entity.UserAccount;
import uz.startup.finance.repo.UserAccountRepository;

@Service
public class UserAccountDetailsService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    public UserAccountDetailsService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalizedPhone = PhoneNumberNormalizer.normalize(username);
        UserAccount user = userAccountRepository.findByPhoneNumber(normalizedPhone)
                .filter(candidate -> candidate.getPasswordHash() != null && !candidate.getPasswordHash().isBlank())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return AppUserPrincipal.from(user);
    }
}
