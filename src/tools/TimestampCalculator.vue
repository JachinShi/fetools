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
      <div class="timestamp-actions">
        <select v-model="selectedTimeZone" title="模拟时区">
          <option v-for="zone in timeZones" :key="zone.value" :value="zone.value">
            {{ zone.label }}
          </option>
        </select>
        <button type="button" class="primary-button" @click="toggleAutoRefresh">
          <Pause v-if="autoRefresh" :size="17" />
          <Play v-else :size="17" />
          {{ autoRefresh ? '停止' : '继续' }}
        </button>
        <button type="button" class="icon-button" title="刷新" @click="refreshNow">
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
        <button type="button" class="icon-button" title="复制 ISO" @click="copyIso">
          <Copy :size="17" />
        </button>
      </div>
      <dl class="result-list">
        <div>
          <dt>模拟时区时间</dt>
          <dd>{{ zonedResult }}</dd>
        </div>
        <div>
          <dt>本地输入格式</dt>
          <dd>{{ result.localInput }}</dd>
        </div>
        <div>
          <dt>ISO</dt>
          <dd>{{ result.iso }}</dd>
        </div>
        <div>
          <dt>秒</dt>
          <dd>{{ result.seconds }}</dd>
        </div>
        <div>
          <dt>毫秒</dt>
          <dd>{{ result.milliseconds }}</dd>
        </div>
      </dl>
      <p class="hint-text">{{ status }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { Copy, Pause, Play, RefreshCcw } from 'lucide-vue-next';
import {
  currentDateParts,
  dateInputToTimestamp,
  formatInTimeZone,
  timestampToDateParts,
  type DateParts,
  type TimestampUnit
} from '../utils/time';

const timeZones = [
  { label: '本地时区', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { label: 'UTC', value: 'UTC' },
  { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
  { label: 'America/New_York', value: 'America/New_York' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'Asia/Tokyo', value: 'Asia/Tokyo' }
];

const current = ref<DateParts>(currentDateParts());
const result = ref<DateParts>(current.value);
const unit = ref<TimestampUnit>('seconds');
const timestampInput = ref(String(current.value.seconds));
const dateInput = ref(current.value.localInput);
const timestampError = ref('');
const dateError = ref('');
const status = ref('等待转换');
const autoRefresh = ref(true);
const selectedTimeZone = ref(timeZones[0].value);
const zonedCurrent = computed(() =>
  formatInTimeZone(new Date(current.value.milliseconds), selectedTimeZone.value)
);
const zonedResult = computed(() =>
  formatInTimeZone(new Date(result.value.milliseconds), selectedTimeZone.value)
);
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

async function copyIso() {
  await navigator.clipboard?.writeText(result.value.iso);
  status.value = '已复制 ISO';
}
</script>
