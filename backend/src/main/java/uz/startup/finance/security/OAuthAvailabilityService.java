package uz.startup.finance.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class OAuthAvailabilityService {

    private final boolean googleEnabled;

    public OAuthAvailabilityService(
            @Value("${app.security.google.client-id:}") String googleClientId,
            @Value("${app.security.google.client-secret:}") String googleClientSecret
    ) {
        this.googleEnabled = StringUtils.hasText(googleClientId) && StringUtils.hasText(googleClientSecret);
    }

    public boolean isGoogleEnabled() {
        return googleEnabled;
    }
}
