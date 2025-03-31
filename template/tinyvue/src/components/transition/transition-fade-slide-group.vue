<script lang="ts" setup>
  import { findIdx } from './utils';

  let count = 0;
  const onBeforeEnter = (el: HTMLElement) => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-20px)';
    el.style.transition = 'all 300ms ease-in-out';
    count += 1;
  };

  const onEnter = (el: HTMLElement, done: () => void) => {
    const delay = findIdx(el) * 150;
    setTimeout(() => {
      el.style.transform = 'translateX(0px)';
      el.style.opacity = '1';
      el.addEventListener('transitionend', done);
    }, delay);
  };
</script>

<template>
  <transition-group
    name="left-slide-fade"
    appear
    @appear="onEnter"
    @before-appear="onBeforeEnter"
  >
    <slot />
  </transition-group>
</template>
