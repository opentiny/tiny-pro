package com.TinyPro.entity.po;

import org.junit.jupiter.api.Test;

import java.util.AbstractSet;
import java.util.Iterator;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class RoleTest {

    @Test
    void hashCodeDoesNotInitializeLazyAssociations() {
        Role role = new Role();
        role.setId(1);

        role.setPermission(new ExplodingHashCodeSet<>());
        role.setMenus(new ExplodingHashCodeSet<>());

        assertDoesNotThrow(role::hashCode);
    }

    private static final class ExplodingHashCodeSet<T> extends AbstractSet<T> {
        @Override
        public Iterator<T> iterator() {
            return Set.<T>of().iterator();
        }

        @Override
        public int size() {
            return 0;
        }

        @Override
        public int hashCode() {
            throw new AssertionError("lazy association was accessed");
        }
    }
}
