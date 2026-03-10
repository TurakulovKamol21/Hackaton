package uz.startup.finance.security;

import uz.startup.finance.service.BadRequestException;

public final class PhoneNumberNormalizer {

    private PhoneNumberNormalizer() {
    }

    public static String normalize(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            throw new BadRequestException("Phone number is required");
        }

        String normalized = rawValue.replaceAll("[^\\d+]", "");
        if (normalized.startsWith("00")) {
            normalized = "+" + normalized.substring(2);
        }
        if (!normalized.startsWith("+")) {
            normalized = "+" + normalized;
        }
        if (!normalized.matches("\\+\\d{9,15}")) {
            throw new BadRequestException("Phone number format is invalid");
        }
        return normalized;
    }
}
