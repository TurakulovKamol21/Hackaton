package uz.startup.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import uz.startup.finance.domain.enums.AuthProvider;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            String fullName,
            @NotBlank String phoneNumber,
            @NotBlank @Size(min = 8) String password,
            @NotBlank String confirmPassword
    ) {
    }

    public record LoginRequest(
            @NotBlank String phoneNumber,
            @NotBlank String password
    ) {
    }

    public record UserProfileResponse(
            Long id,
            String fullName,
            String phoneNumber,
            String email,
            String avatarUrl,
            AuthProvider provider
    ) {
    }

    public record SessionResponse(
            boolean authenticated,
            boolean googleEnabled,
            UserProfileResponse user
    ) {
    }
}
