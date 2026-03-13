package uz.startup.finance.security;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import uz.startup.finance.domain.entity.UserAccount;
import uz.startup.finance.service.UserAccountService;

@Service
public class GoogleOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {

    private final OidcUserService delegate = new OidcUserService();
    private final UserAccountService userAccountService;

    public GoogleOidcUserService(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = delegate.loadUser(userRequest);
        UserAccount userAccount = userAccountService.upsertGoogleUser(oidcUser.getAttributes());
        return AppUserPrincipal.from(userAccount, oidcUser);
    }
}
