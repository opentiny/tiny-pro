package com.TinyPro.logging;

import ch.qos.logback.classic.PatternLayout;
import ch.qos.logback.classic.spi.ILoggingEvent;

import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Masks credentials in the fully rendered log line, including exception text.
 */
public class MaskingPatternLayout extends PatternLayout {

    private static final String MASK = "******";
    private static final Pattern BEARER_PATTERN = Pattern.compile(
            "(?i)(\\bBearer\\s+)([^\\s,;]+)");
    private static final Pattern AUTHORIZATION_PATTERN = Pattern.compile(
            "(?i)(\\bauthorization\\b\\s*[:=]\\s*)(Bearer\\s+)?([^\\s,;]+)");
    private static final Pattern SENSITIVE_ASSIGNMENT_PATTERN = Pattern.compile(
            "(?i)((?<![A-Za-z0-9_])[\"']?(?:password|passwd|pwd|secret|token|access[_-]?token|"
                    + "refresh[_-]?token|client[_-]?secret|api[_-]?key|private[_-]?key|cookie)[\"']?\\s*[:=]\\s*)"
                    + "(\"(?:\\\\.|[^\"\\\\])*\"|'[^']*'|[^\\s,;}&]+)");

    @Override
    public String doLayout(ILoggingEvent event) {
        return mask(super.doLayout(event));
    }

    static String mask(String message) {
        String masked = replace(message, BEARER_PATTERN,
                matcher -> matcher.group(1) + MASK);
        masked = replace(masked, AUTHORIZATION_PATTERN,
                matcher -> matcher.group(1)
                        + (matcher.group(2) == null ? "" : matcher.group(2))
                        + MASK);
        return replace(masked, SENSITIVE_ASSIGNMENT_PATTERN,
                matcher -> matcher.group(1) + maskValue(matcher.group(2)));
    }

    private static String maskValue(String value) {
        if (value.length() >= 2
                && ((value.startsWith("\"") && value.endsWith("\""))
                || (value.startsWith("'") && value.endsWith("'")))) {
            return value.charAt(0) + MASK + value.charAt(value.length() - 1);
        }
        return MASK;
    }

    private static String replace(String value, Pattern pattern,
                                  Function<Matcher, String> replacement) {
        Matcher matcher = pattern.matcher(value);
        StringBuffer result = new StringBuffer();
        while (matcher.find()) {
            matcher.appendReplacement(result,
                    Matcher.quoteReplacement(replacement.apply(matcher)));
        }
        matcher.appendTail(result);
        return result.toString();
    }
}
