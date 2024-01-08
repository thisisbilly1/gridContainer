<template>
  <v-card :disabled="disabled" :elevation="0">
    <v-card-title class="grid-title" :headerStyle="headerStyle">
      <div class="header-left" v-if="!disableExpand">
        <v-btn
          variant="text"
          class="grid-expand-button"
          v-if="title"
          @click="expand"
        >
          {{ title }}
          <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
        <slot name="header" v-if="!shouldPlaceExtraHeaderContentBelow"/>
      </div>
      <span v-else class="header-left">{{ title }}</span>
      <div class="header-right">
        <slot name="headerRight" />
      </div>
    </v-card-title>
    <slot name="header" v-if="shouldPlaceExtraHeaderContentBelow"/>
    <slot />
  </v-card>
</template>

<script setup>
import { toRefs, computed } from 'vue';
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  title: {
    type: String,
  },
  modelValue: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  disableExpand: {
    type: Boolean,
    default: false,
  },
});
const { title, modelValue, disabled, disableExpand } = toRefs(props);

const headerStyle = computed(() => {
  if (!disableExpand.value) {
    return {
      cursor: 'pointer',
    };
  }
  return {};
});

const expanded = computed({
  get() {
    return modelValue.value;
  },
  set(value) {
    if (!disableExpand.value) emit('update:modelValue', value);
  },
});

function expand() {
  expanded.value = !expanded.value;
}

const shouldPlaceExtraHeaderContentBelow = computed(() => {
  return mobile.value && title.value;
});

</script>

<style lang="scss" scoped>
@import "vuetify/lib/styles/settings/_variables.scss";
$mobile-breakpoint: map-get($display-breakpoints, "sm-and-down");
.grid-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;

  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .header-left {
    flex-wrap: wrap;
  }
}
.grid-expand-button {
  padding: 0;
  font-size: medium;
  color: rgb(var(--v-theme-primary));
}
</style>
