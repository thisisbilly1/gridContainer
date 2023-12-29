<template>
  <v-card>
    <v-tabs dark show-arrows background-color="primary" @update:model-value="changeColGroup">
      <v-tab v-for="filter in allOptions" :key="filter.name">
        {{ filter.name }}
      </v-tab>
    </v-tabs>
  </v-card>
</template>

<script>
export default {
  name: 'ColumnGroups',
  props: {
    columnGroups: {
      type: Array,
      required: true,
      validator: value =>
        value.every(filter => filter.name && filter.columns),
    },
    hideDefaultColumnGroup: {
      type: Boolean,
      default: false,
    },
    defaultColumns: {
      type: Array,
    },
  },
  data() {
    return {
      selectedFilter: null,
    };
  },
  computed: {
    allOptions() {
      const defaultFilter = {
        name: 'default',
        isDefault: true,
        columns: this.defaultColumns,
      };
      return this.hideDefaultColumnGroup
        ? this.columnGroups
        : [defaultFilter, ...this.columnGroups];
    },
  },
  methods: {
    changeColGroup(index) {
      const filter = this.allOptions[index];
      if (!filter) return;
      this.$emit('change', filter);
    },
  },
};
</script>
