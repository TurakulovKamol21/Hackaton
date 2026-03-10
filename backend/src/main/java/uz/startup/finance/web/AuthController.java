package uz.startup.finance.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import uz.startup.finance.domain.entity.UserAccount;
import uz.startup.finance.dto.AuthDtos.LoginRequest;
import uz.startup.finance.dto.AuthDtos.RegisterRequest;
import uz.startup.finance.dto.AuthDtos.SessionResponse;
import uz.startup.finance.dto.AuthDtos.UserProfileResponse;
import uz.startup.finance.security.CurrentUserService;
import uz.startup.finance.security.OAuthAvailabilityService;
import uz.startup.finance.service.SessionAuthenticationService;
import uz.startup.finance.service.UserAccountService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserAccountService userAccountService;
    private final SessionAuthenticationService sessionAuthenticationService;
    private final CurrentUserService currentUserService;
    private final OAuthAvailabilityService oAuthAvailabilityService;

    public AuthController(
            UserAccountService userAccountService,
            SessionAuthenticationService sessionAuthenticationService,
            CurrentUserService currentUserService,
            OAuthAvailabilityService oAuthAvailabilityService
    ) {
        this.userAccountService = userAccountService;
        this.sessionAuthenticationService = sessionAuthenticationService;
        this.currentUserService = currentUserService;
        this.oAuthAvailabilityService = oAuthAvailabilityService;
    }

    @GetMapping("/session")
    public SessionResponse session() {
        Optional<UserProfileResponse> user = currentUserService.currentUserOptional()
                .map(userAccountService::toProfile);
        return new SessionResponse(user.isPresent(), oAuthAvailabilityService.isGoogleEnabled(), user.orElse(null));
    }

    @PostMapping("/register")
    public SessionResponse register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        UserAccount userAccount = userAccountService.registerLocalUser(request);
        sessionAuthenticationService.establishSession(userAccount, httpRequest, httpResponse);
        return authenticatedResponse(userAccount);
    }

    @PostMapping("/login")
    public SessionResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        sessionAuthenticationService.authenticate(request, httpRequest, httpResponse);
        return authenticatedResponse(currentUserService.currentUser());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        sessionAuthenticationService.logout(request, response);
    }

    private SessionResponse authenticatedResponse(UserAccount userAccount) {
        return new SessionResponse(
                true,
                oAuthAvailabilityService.isGoogleEnabled(),
                userAccountService.toProfile(userAccount)
        );
    }
}
