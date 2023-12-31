<template>
  <v-dialog
    v-model="menuOpen"
    :max-width="isFullscreen ? null : 400"
    :fullscreen="isFullscreen"
    close-on-back
    :disabled="disabledComputed"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        v-if="saveRoute"
        variant="text"
        :disabled="disabledComputed"
        icon="mdi-cog"
      />
    </template>
    <v-card class="settings-card">
      <v-toolbar color="secondary" dark max-height="64">
        <v-toolbar-title>Column Settings</v-toolbar-title>
        <v-spacer />
        <v-btn icon dark @click="closeMenu">
          <v-icon large>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <div class="columns-top">
        <v-text-field
          label="Search"
          outlined
          dense
          v-model="searchComputed"
          prepend-inner-icon="search"
          clearable
          @click:clear="search = ''"
          hide-details
        />
        <v-switch
          class="ml-3 mr-3"
          v-model="showLocationNames"
          label="Show Location Names"
          hide-details
        />
        <v-checkbox
          :input-value="allColumnsSelected"
          :indeterminate="!allColumnsSelected && !noColumnsSelected"
          label="Select All"
          @change="toggleAll"
          hide-details
          class="pl-3 pr-3 pt-0"
        />
        <v-divider />
      </div>
      <v-virtual-scroll
        class="columns-list"
        :items="filteredColumns"
        item-height="100"
        v-slot="{ item }"
      >
        <!-- no children -->
        <v-checkbox
          v-if="!item.children"
          v-model="columnsComputed"
          :label="item.headerName"
          :value="item.field"
          hide-details
          class="pl-3 pr-3 ma-2"
        />
        <!-- has children -->
        <template v-else>
          <v-divider />
          <v-checkbox
            :model-value="parentColumnsSelected"
            @update:modelValue="changeParent(item)"
            :value="item.field"
            :indeterminate="
              item.children.some((c) => columnsComputed.includes(c.field)) &&
              !item.children.every((c) => columnsComputed.includes(c.field))
            "
            :label="item.headerName"
            hide-details
            class="pl-3 pr-3 ma-2"
          />
          <div class="ml-5">
            <v-checkbox
              v-for="child in item.children"
              :key="child.field"
              v-model="columnsComputed"
              :label="child.headerName"
              :value="child.field"
              hide-details
              class="pl-3 pr-3 ma-0"
            />
          </div>
          <v-divider />
        </template>
      </v-virtual-scroll>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn @click.stop="closeMenu" color="secondary" variant="tonal">
          Close
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          @click="reset"
          color="error"
          variant="tonal"
          :disabled="loading"
          prepend-icon="mdi-delete"
        >
          Reset
        </v-btn>
        <v-btn
          @click.prevent="save()"
          color="primary"
          variant="tonal"
          :disabled="loading"
          prepend-icon="mdi-content-save"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import debounce from 'lodash.debounce';

export default {
  name: 'GridSettings',
  data() {
    return {
      menuOpen: false,
      loading: false,
      search: null,
      showLocNames: true,
      // used when setting functions are not passed in
      defaultSettings: {},
    };
  },
  props: {
    allColumns: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    saveRoute: {
      type: String,
    },
    defaultColumns: {
      type: Array,
    },
    getSettingsProp: {
      type: Function,
    },
    setSettingsProp: {
      type: Function,
    },
    deleteSettingsProp: {
      type: Function,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    showLocationNames: {
      get() {
        return this.showLocNames;
      },
      set(v) {
        this.showLocNames = v;
        this.$emit('updateShowLocationNames', v);
      },
    },
    columnsComputed: {
      get() {
        return this.columns;
      },
      set(cols) {
        this.$emit('update:columns', cols);
      },
    },
    searchComputed: {
      get() {
        return this.search;
      },
      set: debounce(function(v) {
        this.search = v;
      }, 200),
    },
    sortedColumns() {
      return [...this.allColumns].sort((a, b) =>
        a.headerName?.localeCompare(b.headerName),
      );
    },
    filteredColumns() {
      if (!this.search || this.search.length === 0) return this.sortedColumns;
      return this.sortedColumns.filter(col =>
        col.headerName.toLowerCase().includes(this.search.toLowerCase()),
      );
    },
    isFullscreen() {
      return this.$vuetify?.display?.xs;
    },
    flattenedColumns() {
      return this.allColumns.flatMap(column => column.children || column);
    },
    allColumnsSelected() {
      return this.columnsComputed.length === this.flattenedColumns.length;
    },
    noColumnsSelected() {
      return this.columnsComputed.length === 0;
    },
    parentColumnsSelected() {
      return this.allColumns.reduce((prev, column) => {
        if (column.children) {
          const allChildrenSelected = column.children.every(child =>
            this.columnsComputed.includes(child.field),
          );
          if (allChildrenSelected) {
            prev.push(column.field);
          }
        }
        return prev;
      }, []);
    },
    defaultColumnsComputed() {
      return this.defaultColumns || this.allColumns.map(c => c.field);
    },
    disabledComputed() {
      return !this.saveRoute || this.disabled;
    }
  },
  methods: {
    updateSettingsDefault({ name, settingName, value }) {
      this.defaultSettings[`${name}/${settingName}`] = value;
      localStorage.setItem('exampleSave', JSON.stringify(this.defaultSettings));
    },
    getSettingsDefault({ name, settingName }) {
      return this.defaultSettings?.[`${name}/${settingName}`]
    },
    deleteSettingsDefault({ name, settingName, value }) {
      delete this.settings[`${name}/${settingName}`]
      localStorage.setItem('exampleSave', JSON.stringify(this.defaultSettings));
    },
    updateSettings(...args) {
      if (this.setSettingsProp) return this.setSettingsProp(...args);
      return this.updateSettingsDefault(...args);
    },
    getSettings(...args) {
      if (this.getSettingsProp) return this.getSettingsProp(...args);
      return this.getSettingsDefault(...args);
    },
    deleteSettings(...args) {
      if (this.deleteSettingsProp) return this.deleteSettingsProp(...args);
      return this.deleteSettingsDefault(...args);
    },
    // eslint-disable-next-line func-names
    onInput: debounce(function(s) {
      this.search = s;
    }, 500),
    async save(columns = this.columnsComputed) {
      this.loading = true;
      const colsP = this.updateSettings({
        name: this.saveRoute,
        settingName: 'defaultColumns',
        value: columns,
      });
      const locP = this.updateSettings({
        name: 'reports',
        settingName: 'locationNames',
        value: this.showLocationNames,
      });
      await Promise.all([colsP, locP]);
      this.menuOpen = false;
      this.loading = false;
    },
    async reset() {
      this.loading = true;
      const colsP = this.deleteSettings({
        name: this.saveRoute,
        settingName: 'defaultColumns',
      });
      const locP = this.deleteSettings({
        name: 'reports',
        settingName: 'locationNames',
      });
      await Promise.all([colsP, locP]);
      // reset the rows
      this.columnsComputed = [...this.defaultColumnsComputed];
      this.showLocationNames = true;
      this.menuOpen = false;
      this.loading = false;
    },
    async load() {
      const defaultColumns = await this.getSettings({
        name: this.saveRoute,
        settingName: 'defaultColumns',
      });
      const userDefaultLoc = await this.getSettings({
        name: 'reports',
        settingName: 'locationNames',
      });
      if (defaultColumns) this.columnsComputed = defaultColumns;
      else this.columnsComputed = [...this.defaultColumnsComputed];

      if (userDefaultLoc !== null) this.showLocationNames = userDefaultLoc;
      else this.showLocationNames = true;
      this.$emit('loaded');
    },
    async closeMenu() {
      this.menuOpen = false;
    },
    changeParent(col) {
      const intermediate =
        col.children.some(c => this.columnsComputed.includes(c.field)) &&
        !col.children.every(c => this.columnsComputed.includes(c.field));

      if (intermediate) {
        // find the children that are checked and add the rest of the children at the same index
        const checkedChildrenIndex = this.columnsComputed.indexOf(
          col.children.find(c => this.columnsComputed.includes(c.field)).field,
        );
        const tempCols = [...this.columnsComputed];
        tempCols.splice(
          checkedChildrenIndex,
          col.children.length,
          ...col.children.map(c => c.field),
        );
        this.columnsComputed = tempCols;
      } else {
        const allChildrenSelected = col.children.every(c =>
          this.columnsComputed.includes(c.field),
        );
        const childFieldMap = col.children.map(c => c.field);
        // remove all children from the columns
        if (allChildrenSelected) {
          this.columnsComputed = this.columnsComputed.filter(
            c => !childFieldMap.includes(c),
          );
        } else {
          // add all children to the columns
          this.columnsComputed = [...this.columnsComputed, ...childFieldMap];
        }
      }
    },
    toggleAll() {
      if (this.allColumnsSelected) {
        this.columnsComputed = [];
      } else {
        this.columnsComputed = this.allColumns
          .map(c => {
            if (c.children) return c.children.map(cc => cc.field);
            return c.field;
          })
          .flat();
      }
    },
  },
  mounted() {
    this.load();
  },
};
</script>

<style scoped lang="scss">
.columns-list {
  height: min(50vh, 400px);
  padding: 0px !important;
}

.settings-card {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr;
  height: min(80vh, 700px);
}
.columns-top {
  position: sticky;
  top: 0px;
  z-index: 1;
  border-radius: 0px;
  width: 100%;
  padding: 10px 10px 0px 10px;
}
</style>
