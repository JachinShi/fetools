<template>
  <nav class="tool-nav" aria-label="工具导航">
    <button
      v-for="tool in tools"
      :key="tool.id"
      type="button"
      class="nav-item"
      :class="{ active: modelValue === tool.id }"
      @click="$emit('update:modelValue', tool.id)"
    >
      <component :is="tool.icon" :size="18" aria-hidden="true" />
      <span>{{ tool.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  modelValue: string;
  tools: readonly {
    id: string;
    label: string;
    icon: Component;
  }[];
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>
