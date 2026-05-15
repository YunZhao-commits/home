<template>
  <span :style="{ width: size + 'px', height: size + 'px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 24 },
});
</script>
