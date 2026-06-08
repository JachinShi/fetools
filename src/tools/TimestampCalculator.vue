<template>
  <section class="tool-stack">
    <div class="stats-grid">
      <div class="stat">
        <span>当前模拟时间</span>
        <strong>{{ zonedCurrent }}</strong>
      </div>
      <div class="stat">
        <span>本地输入格式</span>
        <strong>{{ current.localInput }}</strong>
      </div>
      <div class="stat">
        <span>秒时间戳</span>
        <strong>{{ current.seconds }}</strong>
      </div>
      <div class="stat">
        <span>毫秒时间戳</span>
        <strong>{{ current.milliseconds }}</strong>
      </div>
    </div>

    <div class="panel timestamp-control-panel">
      <div class="form-row">
        <label for="timezone-select">模拟时区</label>
        <select id="timezone-select" v-model="selectedTimeZone">
          <option v-for="zone in timeZones" :key="zone.value" :value="zone.value">
            {{ zone.label }}
          </option>
        </select>
      </div>
      <div class="timestamp-actions">
        <button type="button" class="primary-button" @click="toggleAutoRefresh">
          <Pause v-if="autoRefresh" :size="17" />
          <Play v-else :size="17" />
          {{ autoRefresh ? '停止刷新' : '继续刷新' }}
        </button>
        <button type="button" class="icon-button" title="立即刷新" @click="refreshNow">
          <RefreshCcw :size="17" />
        </button>
      </div>
    </div>

    <section class="tool-grid two-column">
      <div class="panel">
        <div class="panel-header">
          <h3>时间戳转日期</h3>
        </div>
        <div class="form-row">
          <label for="timestamp-unit">单位</label>
          <select id="timestamp-unit" v-model="unit">
            <option value="seconds">秒</option>
            <option value="milliseconds">毫秒</option>
          </select>
        </div>
        <input v-model="timestampInput" class="text-input" inputmode="numeric" placeholder="1704067200" />
        <button type="button" class="primary-button" @click="convertTimestamp">转换</button>
        <p v-if="timestampError" class="error-text">{{ timestampError }}</p>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>本地时间转时间戳</h3>
        </div>
        <input v-model="dateInput" class="text-input" type="datetime-local" />
        <button type="button" class="primary-button" @click="convertDate">转换</button>
        <p v-if="dateError" class="error-text">{{ dateError }}</p>
      </div>
    </section>

    <div class="panel">
      <div class="panel-header">
        <h3>转换结果</h3>
      </div>
      <div class="result-copy-list">
        <div v-for="item in resultItems" :key="item.label" class="result-copy-row">
          <span>{{ item.label }}</span>
          <code>{{ item.value }}</code>
          <button type="button" class="icon-button" :title="`复制${item.label}`" @click="copyValue(item.label, item.value)">
            <Copy :size="17" />
          </button>
        </div>
      </div>
      <p class="hint-text">{{ status }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { Copy, Pause, Play, RefreshCcw } from 'lucide-vue-next';
import {
  buildTimeZoneOptions,
  currentDateParts,
  dateInputToTimestamp,
  formatInTimeZone,
  timestampToDateParts,
  type DateParts,
  type TimestampUnit
} from '../utils/time';

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const timeZones = buildTimeZoneOptions();

const current = ref<DateParts>(currentDateParts());
const result = ref<DateParts>(current.value);
const unit = ref<TimestampUnit>('seconds');
const timestampInput = ref(String(current.value.seconds));
const dateInput = ref(current.value.localInput);
const timestampError = ref('');
const dateError = ref('');
const status = ref('等待转换');
const autoRefresh = ref(true);
const selectedTimeZone = ref(localTimeZone);
const zonedCurrent = computed(() =>
  formatInTimeZone(new Date(current.value.milliseconds), selectedTimeZone.value)
);
const zonedResult = computed(() =>
  formatInTimeZone(new Date(result.value.milliseconds), selectedTimeZone.value)
);
const resultItems = computed(() => [
  { label: '模拟时区时间', value: zonedResult.value },
  { label: '本地输入格式', value: result.value.localInput },
  { label: 'ISO', value: result.value.iso },
  { label: '秒', value: String(result.value.seconds) },
  { label: '毫秒', value: String(result.value.milliseconds) }
]);
const timer = window.setInterval(() => {
  if (autoRefresh.value) {
    current.value = currentDateParts();
  }
}, 1000);

onBeforeUnmount(() => {
  window.clearInterval(timer);
});

function refreshNow() {
  current.value = currentDateParts();
  status.value = '当前时间已刷新';
}

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value;
  status.value = autoRefresh.value ? '已继续自动刷新' : '已停止自动刷新';
}

function convertTimestamp() {
  const converted = timestampToDateParts(timestampInput.value, unit.value);
  if (converted.ok) {
    result.value = converted.value;
    timestampError.value = '';
    status.value = '时间戳已转换';
  } else {
    timestampError.value = converted.error;
  }
}

function convertDate() {
  const converted = dateInputToTimestamp(dateInput.value);
  if (converted.ok) {
    result.value = converted.value;
    dateError.value = '';
    status.value = '本地时间已转换';
  } else {
    dateError.value = converted.error;
  }
}

async function copyValue(label: string, value: string) {
  await navigator.clipboard?.writeText(value);
  status.value = `已复制${label}`;
}
</script>
