package uz.startup.finance.security;

import java.util.Optional;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.startup.finance.domain.entity.UserAccount;
import uz.startup.finance.repo.UserAccountRepository;
import uz.startup.finance.service.UnauthorizedException;

@Service
public class CurrentUserService {

    private final UserAccountRepository userAccountRepository;

    public CurrentUserService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional(readOnly = true)
    public UserAccount currentUser() {
        return currentUserOptional()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
    }

    @Transactional(readOnly = true)
    public Long currentUserId() {
        return currentPrincipal()
                .map(AppUserPrincipal::getUserId)
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
    }

    @Transactional(readOnly = true)
    public Optional<UserAccount> currentUserOptional() {
        return currentPrincipal().flatMap(principal -> userAccountRepository.findById(principal.getUserId()));
    }

    private Optional<AppUserPrincipal> currentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken
                || !(authentication.getPrincipal() instanceof AppUserPrincipal principal)) {
            return Optional.empty();
        }
        return Optional.of(principal);
    }
}
