package uz.startup.finance.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import uz.startup.finance.domain.entity.UserAccount;
import uz.startup.finance.dto.AuthDtos.LoginRequest;
import uz.startup.finance.security.AppUserPrincipal;
import uz.startup.finance.security.PhoneNumberNormalizer;

@Service
public class SessionAuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public SessionAuthenticationService(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    public AppUserPrincipal authenticate(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String phoneNumber = PhoneNumberNormalizer.normalize(request.phoneNumber());
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(phoneNumber, request.password())
        );
        saveAuthentication(authentication, httpRequest, httpResponse);
        return (AppUserPrincipal) authentication.getPrincipal();
    }

    public void establishSession(UserAccount userAccount, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        AppUserPrincipal principal = AppUserPrincipal.from(userAccount);
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                principal,
                null,
                principal.getAuthorities()
        );
        saveAuthentication(authentication, httpRequest, httpResponse);
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        new SecurityContextLogoutHandler().logout(request, response, authentication);
    }

    private void saveAuthentication(
            Authentication authentication,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);
        securityContextRepository.saveContext(securityContext, httpRequest, httpResponse);
    }
}
