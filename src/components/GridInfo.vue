<template>
  <div id="gridToolbar" v-if="flattenedColumns.length > 0">
    <v-icon
      large
      @click="menuOpen = true"
      class="grid-info-button"
    >
      mdi-information
    </v-icon>
    <v-dialog
      v-model="menuOpen"
      max-width="1000"
      @click:outside="menuOpen = false"
      :fullscreen="$vuetify.display.xs"
      scrollable
    >
      <v-card class="d-flex flex-column">
        <v-toolbar
          color="secondary"
          dark
          max-height="64"
          style="margin-bottom: 10px;"
        >
          <v-toolbar-title>Column Descriptions</v-toolbar-title>
          <v-spacer />
          <v-btn icon dark @click="closeMenu">
            <v-icon large>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
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
          <v-table class="overflow-y-auto list-scroll">
            <thead>
              <tr>
                <th>Column</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="col in filteredColumns" :key="col.field">
                <td>{{ col.headerName }}</td>
                <td>{{ col.description }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="closeMenu" color="secondary">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
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
