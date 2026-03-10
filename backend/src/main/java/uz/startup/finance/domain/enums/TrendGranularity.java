package uz.startup.finance.domain.enums;

import java.util.Locale;

public enum TrendGranularity {
    DAILY,
    WEEKLY,
    MONTHLY,
    YEARLY;

    public static TrendGranularity from(String value) {
        if (value == null || value.isBlank()) {
            return MONTHLY;
        }

        return switch (value.trim().toUpperCase(Locale.ROOT)) {
            case "DAILY" -> DAILY;
            case "WEEKLY" -> WEEKLY;
            case "YEARLY" -> YEARLY;
            default -> MONTHLY;
        };
    }
}
