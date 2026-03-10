package uz.startup.finance.security;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import uz.startup.finance.domain.entity.UserAccount;

public class AppUserPrincipal implements UserDetails, OAuth2User, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private final Long userId;
    private final String username;
    private final String password;
    private final String displayName;
    private final Collection<? extends GrantedAuthority> authorities;
    private final Map<String, Object> attributes;

    public AppUserPrincipal(
            Long userId,
            String username,
            String password,
            String displayName,
            Collection<? extends GrantedAuthority> authorities,
            Map<String, Object> attributes
    ) {
        this.userId = userId;
        this.username = username;
        this.password = password == null ? "" : password;
        this.displayName = displayName;
        this.authorities = authorities;
        this.attributes = attributes == null ? Map.of() : Map.copyOf(attributes);
    }

    public static AppUserPrincipal from(UserAccount user) {
        return from(user, Map.of());
    }

    public static AppUserPrincipal from(UserAccount user, Map<String, Object> attributes) {
        String username = user.getPhoneNumber() != null ? user.getPhoneNumber()
                : user.getEmail() != null ? user.getEmail()
                : String.valueOf(user.getId());
        return new AppUserPrincipal(
                user.getId(),
                username,
                user.getPasswordHash(),
                user.getFullName(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                attributes
        );
    }

    public Long getUserId() {
        return userId;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        return String.valueOf(userId);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
