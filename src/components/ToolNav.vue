<template>
  <nav class="tool-nav" :class="{ collapsed }" aria-label="工具导航">
    <button
      v-for="tool in tools"
      :key="tool.id"
      type="button"
      class="nav-item"
      :class="{ active: modelValue === tool.id }"
      :title="collapsed ? tool.label : undefined"
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
  collapsed?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>
