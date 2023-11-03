<template>
  <v-btn
    v-bind="$attrs"
    :color="color"
    :variant="variant"
    @click="$emit('click')"
    class="outer"
    :disabled="disabled"
    >
      <slot />
    <v-menu bottom right offset-y>
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          class="inner"
          plain
          dark
        >
          <v-icon>mdi-menu-down </v-icon>
        </v-btn>
      </template>

      <slot name="options"/>
    </v-menu>
  </v-btn>
</template>

<script>
export default {
  name: 'ButtonOptions',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: 'primary',
    },
    variant: {
      type: String,
      default: 'tonal',
    },
  }
};
</script>

<style scoped>
.inner {
  margin-left: 5px;
  padding: 0px 5px;
  width: 16px !important;
  min-width: 16px !important;
  border-left: 1px solid white !important;
  border-radius: 0;
}
.outer {
  padding-right: 0px !important;
}
</style>
