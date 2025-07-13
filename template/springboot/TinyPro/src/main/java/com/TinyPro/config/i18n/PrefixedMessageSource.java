package com.TinyPro.config.i18n;

import org.springframework.context.MessageSource;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.context.NoSuchMessageException;

import java.util.Locale;

public  class PrefixedMessageSource implements MessageSource {
        private final MessageSource delegate;
        private final String prefix;

        public PrefixedMessageSource(MessageSource delegate, String prefix) {
            this.delegate = delegate;
            this.prefix = prefix;
        }

        @Override
        public String getMessage(String code, Object[] args, String defaultMessage, Locale locale) {
            // 去除前缀
            String strippedCode = code.startsWith(prefix) ? code.substring(prefix.length()) : code;
            return delegate.getMessage(strippedCode, args, defaultMessage, locale);
        }

        @Override
        public String getMessage(String code, Object[] args, Locale locale) throws NoSuchMessageException {
            // 去除前缀
            String strippedCode = code.startsWith(prefix) ? code.substring(prefix.length()) : code;
            return delegate.getMessage(strippedCode, args, locale);
        }

        @Override
        public String getMessage(MessageSourceResolvable resolvable, Locale locale) throws NoSuchMessageException {
            return delegate.getMessage(resolvable, locale);
        }
    }
