package uz.startup.finance.service;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import uz.startup.finance.domain.entity.UserAccount;
import uz.startup.finance.domain.enums.AuthProvider;
import uz.startup.finance.domain.enums.UserRole;
import uz.startup.finance.dto.AuthDtos.RegisterRequest;
import uz.startup.finance.dto.AuthDtos.UserProfileResponse;
import uz.startup.finance.repo.UserAccountRepository;
import uz.startup.finance.security.PhoneNumberNormalizer;

@Service
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public UserAccountService(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserAccount registerLocalUser(RegisterRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new BadRequestException("Password and confirm password must match");
        }

        String phoneNumber = PhoneNumberNormalizer.normalize(request.phoneNumber());
        if (userAccountRepository.existsByPhoneNumber(phoneNumber)) {
            throw new BadRequestException("Phone number is already registered");
        }

        UserAccount userAccount = new UserAccount();
        userAccount.setFullName(resolveLocalFullName(request.fullName(), phoneNumber));
        userAccount.setPhoneNumber(phoneNumber);
        userAccount.setPasswordHash(passwordEncoder.encode(request.password()));
        userAccount.setProvider(AuthProvider.LOCAL);
        userAccount.setRole(UserRole.USER);
        return userAccountRepository.save(userAccount);
    }

    @Transactional
    public UserAccount upsertGoogleUser(Map<String, Object> attributes) {
        String googleSubject = readRequired(attributes, "sub");
        String email = normalizeEmail((String) attributes.get("email"));
        String fullName = readPreferred(attributes, "name", "Google user");
        String avatarUrl = trimToNull((String) attributes.get("picture"));

        UserAccount userAccount = userAccountRepository.findByGoogleSubject(googleSubject)
                .or(() -> Optional.ofNullable(email)
                        .flatMap(userAccountRepository::findByEmailIgnoreCase))
                .orElseGet(UserAccount::new);

        if (userAccount.getProvider() == null) {
            userAccount.setProvider(AuthProvider.GOOGLE);
        }

        userAccount.setRole(userAccount.getRole() == null ? UserRole.USER : userAccount.getRole());
        userAccount.setGoogleSubject(googleSubject);
        userAccount.setEmail(email);
        userAccount.setFullName(fullName);
        userAccount.setAvatarUrl(avatarUrl);
        return userAccountRepository.save(userAccount);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse toProfile(UserAccount userAccount) {
        return new UserProfileResponse(
                userAccount.getId(),
                userAccount.getFullName(),
                userAccount.getPhoneNumber(),
                userAccount.getEmail(),
                userAccount.getAvatarUrl(),
                userAccount.getProvider()
        );
    }

    private String resolveLocalFullName(String fullName, String phoneNumber) {
        String normalizedName = trimToNull(fullName);
        return normalizedName != null ? normalizedName : "User " + phoneNumber;
    }

    private String readRequired(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        if (!(value instanceof String text) || text.isBlank()) {
            throw new BadRequestException("Google account payload is incomplete");
        }
        return text;
    }

    private String readPreferred(Map<String, Object> attributes, String key, String fallback) {
        Object value = attributes.get(key);
        if (value instanceof String text && !text.isBlank()) {
            return text.trim();
        }
        return fallback;
    }

    private String normalizeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
