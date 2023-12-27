<template>
  <v-dialog
    v-model="menuOpen"
    :max-width="$vuetify.display.xs ? null : 1000"
    @click:outside="menuOpen = false"
    :fullscreen="$vuetify.display.xs"
    scrollable
  >
    <template v-slot:activator="{ props }">
      <v-icon
        v-if="flattenedColumns.length > 0"
        v-bind="props"
        @click.stop
      >
        mdi-information
      </v-icon>
    </template>
    <v-card class="settings-card">
      <v-toolbar color="secondary" dark max-height="64">
        <v-toolbar-title>Column Descriptions</v-toolbar-title>
        <v-spacer />
        <v-btn icon dark @click="closeMenu">
          <v-icon large>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-text-field
        label="Column"
        outlined
        dense
        v-model="search"
        prepend-inner-icon="search"
        clearable
        class="mt-4"
        @click:clear="search = ''"
      />
      <v-divider></v-divider>
      <v-card-text>
        <div class="column-def">
          <div class="header-name">Column</div>
          <div class="description">Description</div>
        </div>
        <v-virtual-scroll
          class="columns-list"
          :items="filteredColumns"
          item-height="32"
          v-slot="{ item }"
        >
          <div class="column-def">
            <div class="header-name">{{ item.headerName }}</div>
            <div class="description">{{ item.description }}</div>
          </div>
        </v-virtual-scroll>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn @click="closeMenu" color="secondary">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'GridInfo',
  props: {
    columnDefs: {
      type: Array,
      default: () => [],
    },
    extraColumnDescriptions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      menuOpen: false,
      search: null,
    };
  },
  computed: {
    flattenedColumns() {
      // get all the columns with children, and concat the parent headerName with the child's headerName
      const columnDefinitions = this.columnDefs.reduce((prev, col) => {
        if (!col.children) {
          if (col.description) prev.push(col);
        } else {
          const children = col.children.filter(x => x.description).map(child => ({
            ...child,
            headerName: `${col.headerName} ${child.headerName}`,
          }));
          prev.push(...children);
        }
        return prev;
      }, []);

      const additionalColumns = [
        // Used for Sales Ledger Summary, added additional 'Sales Ledger Group Items' to the column descriptions.
        ...this.extraColumnDescriptions,
        ...columnDefinitions,
      ];
      return additionalColumns.sort((a, b) => (a.headerName > b.headerName ? 1 : -1));
    },
    filteredColumns() {
      if (!this.search) return this.flattenedColumns;
      return this.flattenedColumns.filter(columnDef => {
        if (!columnDef.headerName) return false;
        const headerMatch = columnDef.headerName
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, '')
          .includes(this.search.toLowerCase().replace(/[^a-z0-9 ]/g, ''))
        const descriptionMatch = columnDef.description
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, '')
          .includes(this.search.toLowerCase().replace(/[^a-z0-9 ]/g, ''))
        return headerMatch || descriptionMatch;
      });
    },
  },
  methods: {
    closeMenu() {
      this.menuOpen = false;
    },
  },
};
</script>
<style scoped lang="scss">
.columns-list {
  height: min(41vh, 600px);
  padding: 0px !important;
  .v-virtual-scroll__item {
    padding: 0px !important;
  }
}
.settings-card {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr;
  height: min(80vh, 700px);
}

.column-def {
  display: grid;
  grid-template-columns: 0.25fr 1fr;
  grid-template-rows: 1fr;
  grid-column-gap: 5px;
  grid-row-gap: 0px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 10px 0px;
}

.header-name { grid-area: 1 / 1 / 2 / 2; }
.description { grid-area: 1 / 2 / 2 / 3; }
</style>
