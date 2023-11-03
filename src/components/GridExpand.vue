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
        <slot name="header" />
      </div>
      <span v-else class="header-left">{{ title }}</span>
      <div class="header-right">
        <slot name="headerRight" />
      </div>
    </v-card-title>
    <slot />
  </v-card>
</template>

<script>
export default {
  name: 'GridExpand',
  props: {
    openedAtStart: {
      type: Boolean,
      default: true,
    },
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
  },
  created() {
    this.expanded = this.openedAtStart;
  },
  methods: {
    expand() {
      this.expanded = !this.expanded;
    },
  },
  computed: {
    headerStyle() {
      if (!this.disableExpand) {
        return {
          cursor: 'pointer',
        };
      }
      return {};
    },
    expanded: {
      get() {
        return this.modelValue;
      },
      set(value) {
        if (!this.disableExpand) this.$emit('update:modelValue', value);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import "vuetify/lib/styles/settings/_variables.scss";
$mobile-breakpoint: map-get($display-breakpoints, "sm-and-down");
.grid-title {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;

  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}
.grid-expand-button {
  padding: 0;
  font-size: medium;
  color: #0080ff;
}
</style>
