package com.TinyPro.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;
import org.springframework.validation.annotation.Validated;

/**
 * Application-owned settings that need validation before the application starts.
 */
@Validated
@ConfigurationProperties(prefix = "tinypro")
public class TinyProProperties {

    @Valid
    @NotNull
    private Jwt jwt = new Jwt();

    @Valid
    @NotNull
    private Reject reject = new Reject();

    @Valid
    @NotNull
    private Logging logging = new Logging();

    public Jwt getJwt() {
        return jwt;
    }

    public void setJwt(Jwt jwt) {
        this.jwt = jwt;
    }

    public Reject getReject() {
        return reject;
    }

    public void setReject(Reject reject) {
        this.reject = reject;
    }

    public Logging getLogging() {
        return logging;
    }

    public void setLogging(Logging logging) {
        this.logging = logging;
    }

    public static class Jwt {

        @NotBlank(message = "tinypro.jwt.secret must not be blank")
        @Size(min = 8, message = "tinypro.jwt.secret must contain at least 8 characters")
        private String secret;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }
    }

    public static class Reject {

        @NotNull(message = "tinypro.reject.start must be specified")
        private Boolean start = false;

        public Boolean getStart() {
            return start;
        }

        public void setStart(Boolean start) {
            this.start = start;
        }
    }

    public static class Logging {

        @NotBlank(message = "tinypro.logging.file must not be blank")
        private String file = "logs/tiny-pro.log";

        @NotBlank(message = "tinypro.logging.max-file-size must not be blank")
        private String maxFileSize = "50MB";

        @Min(value = 1, message = "tinypro.logging.max-history must be at least 1")
        @Max(value = 365, message = "tinypro.logging.max-history must not exceed 365")
        private int maxHistory = 30;

        @NotBlank(message = "tinypro.logging.total-size-cap must not be blank")
        private String totalSizeCap = "2GB";

        @AssertTrue(message = "tinypro.logging.max-file-size must be a valid data size")
        public boolean isMaxFileSizeValid() {
            return isDataSize(maxFileSize);
        }

        @AssertTrue(message = "tinypro.logging.total-size-cap must be a valid data size")
        public boolean isTotalSizeCapValid() {
            return isDataSize(totalSizeCap);
        }

        private boolean isDataSize(String value) {
            if (value == null || value.isBlank()) {
                return false;
            }
            try {
                return DataSize.parse(value).toBytes() > 0;
            } catch (IllegalArgumentException ex) {
                return false;
            }
        }

        public String getFile() {
            return file;
        }

        public void setFile(String file) {
            this.file = file;
        }

        public String getMaxFileSize() {
            return maxFileSize;
        }

        public void setMaxFileSize(String maxFileSize) {
            this.maxFileSize = maxFileSize;
        }

        public int getMaxHistory() {
            return maxHistory;
        }

        public void setMaxHistory(int maxHistory) {
            this.maxHistory = maxHistory;
        }

        public String getTotalSizeCap() {
            return totalSizeCap;
        }

        public void setTotalSizeCap(String totalSizeCap) {
            this.totalSizeCap = totalSizeCap;
        }
    }
}
