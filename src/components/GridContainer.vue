<template>
  <GridExpand
    :title="containerTitle"
    v-model="expanded"
    :disableExpand="disableExpand"
    @update:modelValue="expandRows"
  >
    <template v-slot:header>
      <slot name="header" />
    </template>
    <template v-slot:headerRight>
      <GridInfo
        v-if="!disableInfoBtn"
        :columnDefs="columnDefs"
        :extraColumnDescriptions="extraColumnDescriptions"
      />
      <GridSettings
        v-if="gridColumnApi && !disableGridSettings && settingsName"
        :allColumns="nonPinnedColumns"
        :saveRoute="settingsName"
        :defaultColumns="defaultShowColumns"
        v-model:columns="shownColumnsComputed"
        @loaded="loadedColumns"
        @save="savedColumns"
        @reset="resetColumns"
        @updateShowLocationNames="updateShowLocationNames"
        :getSettingsProp="getSettings"
        :setSettingsProp="setSettings"
        :deleteSettingsProp="deleteSettings"
        ref="settings"
      />
      <GridDownload
        v-if="gridApi"
        :gridApi="gridApi"
        :reportName="containerTitle"
        :columnGroups="columnGroups"
      />
    </template>
    <div class="outer-grid-container">
      <ColumnGroups
        v-if="columnGroups && gridColumnApi"
        :columnGroups="columnGroups"
        :defaultColumns="defaultColumns"
        :hideDefaultColumnGroup="hideDefaultColumnGroup"
        @change="changeColumnGroup"
      />
      <div class="grid-container" :style="gridStyle">
        <AgGridVue
          ref="agGrid"
          class="ag-grid ag-theme-balham"
          style="height: 100%; width: 100%"
          :modules="modules"
          :columnDefs="columnDefsComputed"
          :rowData="rowData"
          :gridOptions="gridOptions"
          :defaultColDef="defaultColDef"
          :autoGroupColumnDef="autoGroupColumnDef"
          @grid-ready="onGridReady"
          @first-data-rendered="firstDataRendered"
          @expandOrCollapseAll="calcGridHeight"
          @columnMoved="handleColumnChange"
          v-bind="gridProps"
        />
      </div>
    </div>
  </GridExpand>
</template>

<script setup>
import { defineComponent, ref, toRefs, computed, nextTick, watch } from "vue";
import { useDisplay } from "vuetify";

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
// import { ModuleRegistry } from "@ag-grid-community/core";
import { AgGridVue } from "@ag-grid-community/vue3";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { MenuModule } from "@ag-grid-enterprise/menu";
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { LicenseManager } from "@ag-grid-enterprise/core";

import GridSettings from './GridSettings.vue';
import GridExpand from "./GridExpand.vue";
import GridDownload from './GridDownload.vue';
import ColumnGroups from "./ColumnGroups.vue";
import GridInfo from './GridInfo.vue';

// set ag grid licenseKey key
LicenseManager.setLicenseKey(
  "CompanyName=QsrSoft,LicensedApplication=myqsrsoft.com,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=2,LicensedProductionInstancesCount=1,AssetReference=AG-037500,SupportServicesEnd=26_January_2024_[v2]_MTcwNjIyNzIwMDAwMA==9f4ee52279cf0c96bfb717c953e06370"
);

const emit = defineEmits(["onGridReady", "firstDataRendered"]);

const props = defineProps({
  gridName: {
    type: String,
    default: 'Grid'
  },
  columnDefs: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disableAutoHeight: {
    type: Boolean,
    default: false,
  },
  defaultShowColumns: {
    type: Array,
  },
  pinnedColumns: {
    type: Array,
    default: () => ["storeNum"],
  },
  groupedRowGrandTotal: {
    type: Boolean,
    default: false,
  },
  groupedColsFields: {
    type: Array,
  },
  disableExpand: {
    type: Boolean,
    default: false,
  },
  disableInfoBtn: {
    type: Boolean,
    default: false,
  },
  extraColumnDescriptions: {
    type: Array,
    default: () => [],
  },
  columnGroups: {
    type: Array,
  },
  hideDefaultColumnGroup: {
    type: Boolean,
    default: false,
  },
  settingsName: {
    type: String,
  },
  disableGridSettings: {
    type: Boolean,
    default: false,
  },
  // passed through to the gridSettings
  getSettings: {
    type: Function,
  },
  setSettings: {
    type: Function,
  },
  deleteSettings: {
    type: Function,
  },
  gridProps: {
    type: Object,
  },
});

const {
  gridName,
  defaultShowColumns,
  columnDefs,
  data,
  loading,
  disableAutoHeight,
  pinnedColumns,
  groupedRowGrandTotal,
  groupedColsFields,
  disableExpand,
  disableInfoBtn,
  extraColumnDescriptions,
  columnGroups,
  settingsName,
  disableGridSettings,
  hideDefaultColumnGroup,
} = toRefs(props);

const modules = [
  ClientSideRowModelModule,
  RowGroupingModule,
  RangeSelectionModule,
  ClipboardModule,
  MenuModule,
  ExcelExportModule,
  CsvExportModule,
];

const { mobile } = useDisplay();
const gridOptions = {
  suppressDragLeaveHidesColumns: true,
  suppressColumnVirtualisation: true,
  debounceVerticalScrollbar: true,
  suppressColumnMoveAnimation: true,
  enableRangeSelection: !mobile.value,
  suppressContextMenu: mobile.value,
  preventDefaultOnContextMenu: true,
  suppressNoRowsOverlay: true,
  suppressPropertyNamesCheck: true,
  suppressAggFuncInHeader: true,
  groupRowsSticky: true,
  getContextMenuItems: () => ["copy", "copyWithHeaders"],
  groupDefaultExpanded: -1,
};
const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  hide: true,
  wrapHeaderText: true,
  autoHeaderHeight: true,
  menuTabs: ["filterMenuTab"],
  lockPinned: true,
  filterParams: {
    buttons: ["clear", "apply"],
  },
};

const agGrid = ref(null);
const shownColumns = ref([]);
const expanded = ref(true);
const gridColumnApi = ref(null);
const gridApi = ref(null);
const defaultColumns = ref([]);
const autoGroupColumnDef = ref(null);

const gridHeight = ref(500);
const gridStyle = computed(() => {
  if (disableAutoHeight.value) return {};
  return { height: `${gridHeight.value}px` };
});

async function calcGridHeight() {
  if (disableAutoHeight.value) return;
  await nextTick();
  // TODO: update when ag grid can auto detect height
  const headerHeight =
    agGrid.value?.$el?.getElementsByClassName("ag-header")?.[0]
      ?.offsetHeight || 0;
  const scrollBarHeight =
    agGrid.value?.$el?.getElementsByClassName(
      "ag-body-horizontal-scroll"
    )?.[0]?.offsetHeight + 2 || 0;
  const totalHeight =
    agGrid.value?.$el?.getElementsByClassName(
      "ag-center-cols-container"
    )?.[0]?.offsetHeight || 0;

  const topPinnedRowHeight =
    agGrid.value?.$el?.getElementsByClassName("ag-floating-top")?.[0]
      ?.offsetHeight || 0;

  const bottomPinnedRowHeight =
    agGrid.value?.$el?.getElementsByClassName("ag-floating-bottom")?.[0]
      ?.offsetHeight || 0;

  const minHeight =
    headerHeight + totalHeight + scrollBarHeight + topPinnedRowHeight + bottomPinnedRowHeight;
  gridHeight.value = Math.min(500, minHeight);
}

async function autoSizeColumns() {
  gridColumnApi.value.autoSizeAllColumns(true);
}

function groupRows() {
  if (!groupedColsFields.value && !groupedRowGrandTotal.value) return;
  const groupColFields = groupedRowGrandTotal.value
    ? ["Grouping Total", ...(groupedColsFields.value || [])]
    : groupedColsFields.value;

  if (!groupColFields.length) return;

  gridColumnApi.value.applyColumnState({
    state: groupColFields.map((colId) => ({
      colId,
      rowGroup: true,
      hide: true,
    })),
  });
  // make the group col header name the name of the col that we are grouping by if only 1
  let column;
  if (groupedColsFields.value?.length === 1 && !groupedRowGrandTotal.value) {
    column = columnDefs.value.find(
      (col) => col.field === groupedColsFields.value[0]
    );
  }
  autoGroupColumnDef.value = {
    onCellClicked: async ({ node }) => {
      // Open group col on click
      if (node.group) {
        node.setExpanded(!node.expanded);
      }
    },
    ...column,
    filter: "agGroupColumnFilter",
    pinned: "left",
    hide: false,
    field: "ag-Grid-AutoColumn",
    cellRendererParams: {
      suppressCount: true,
    },
  };
}

const columnDefsComputed = computed(() => {
  if (groupedRowGrandTotal.value) {
    return [
      {
        // grouping total column
        field: 'Grouping Total',
        rowGroup: true,
        valueGetter: () => 'Total',
      },
      ...columnDefs.value,
    ];
  }
  return columnDefs.value;
});

function unPinColumnsForMobile() {
  if (mobile.value) {
    const maxPinnedCols = 1;
    const hasGroupCol = groupedColsFields.value || groupedRowGrandTotal.value
    const fields = [...pinnedColumns.value];
    if (hasGroupCol) fields.unshift('ag-Grid-AutoColumn');
    gridColumnApi.value.applyColumnState({
      state: fields.map((col, i) => ({
        colId: col,
        pinned: i < maxPinnedCols ? true : false,
      })),
      defaultState: { pinned: null },
    });
  }
}

const nonPinnedColumns = computed(() =>
  columnDefs.value.filter((x) => !pinnedColumns.value.includes(x.field) && !groupedColsFields.value?.includes(x.field))
);

function showPinnedColumns() {
  if (!gridColumnApi.value) return;
  const state = [];
  // add all the pinned columns to the front of the state & always hide grouped columns
  [...pinnedColumns.value].reverse().forEach((colId) => {
    state.unshift({
      colId,
      hide: groupedColsFields.value?.includes(colId) || false,
    });
  });

  // unshift the grouping column
  if (autoGroupColumnDef.value) {
    state.unshift({
      colId: autoGroupColumnDef.value.field,
      pinned: "left",
      hide: false,
    });
  }
  gridColumnApi.value.applyColumnState({
    state,
  });
}

const shownColumnsComputed = computed({
  get() {
    return shownColumns.value;
  },
  set(shownCols) {
    shownColumns.value = shownCols;

    const gridColumns = gridColumnApi.value
      .getAllGridColumns()
      .filter((x) => !pinnedColumns.value.includes(x.colId));

    // group the shown cols by their parent
    const childrenGroupedShownCols = shownCols.reduce((cols, col) => {
      const column = gridColumns.find((x) => x.colId === col);
      const children = column?.originalParent?.children?.map(
        (x) => x.colId
      );
      if (children) {
        const sortedChildren = children.sort(
          (a, b) => shownCols.indexOf(a) - shownCols.indexOf(b)
        );
        cols.push(...sortedChildren);
      } else cols.push(col);
      return cols;
    }, []);

    gridColumns.sort(
      (a, b) =>
        childrenGroupedShownCols.indexOf(a.colId) -
        childrenGroupedShownCols.indexOf(b.colId)
    );
    // create hide/show state for each column
    const state = gridColumns.map((col) => {
      let hide = !shownCols.includes(col.colId);
      if (groupedColsFields.value) {
        if (groupedColsFields.value.includes(col.colId)) hide = true;
      }
      return {
        colId: col.colId,
        hide,
      };
    });

    showPinnedColumns();

    // apply the state to the grid
    gridColumnApi.value.applyColumnState({
      state,
      applyOrder: true,
    });
  },
});

watch(loading, async () => {
  if (loading.value) {
    if (gridApi.value) gridApi.value.showLoadingOverlay();
  } else {
    await nextTick();
    unPinColumnsForMobile();
    shownColumnsComputed.value = [...shownColumnsComputed.value];
    autoSizeColumns();
    calcGridHeight();
  }
});

async function onGridReady(params) {
  gridColumnApi.value = params.columnApi;
  gridApi.value = params.api;
  groupRows();

  if (!defaultShowColumns.value)
    defaultColumns.value = nonPinnedColumns.value.map((x) => x.field);
  else defaultColumns.value = [...defaultShowColumns.value];

  // await nextTick();
  // await nextTick();
  // shownColumnsComputed.value = [...defaultColumns.value];
  // await nextTick();
  unPinColumnsForMobile();
  emit("onGridReady", params);
}

function firstDataRendered(params) {
  autoSizeColumns();
  calcGridHeight();
  shownColumnsComputed.value = [...defaultColumns.value];
  emit("firstDataRendered", params);
}

const containerTitle = computed(() => {
  if (data.value?.length === 0) return `${gridName.value} (no data)`;
  return gridName.value;
});

async function expandRows() {
  if (!gridApi.value) return;
  if (expanded.value) {
    if (groupedRowGrandTotal.value || groupedColsFields.value?.length) {
      gridApi.value.expandAll();
    }
    await nextTick();
    calcGridHeight();
  }
  // collapse the group rows
  if (!expanded.value) {
    if (groupedRowGrandTotal.value) {
      if (groupedColsFields.value?.length) {
        gridApi.value.collapseAll();
        const totalRow = gridApi.value.getDisplayedRowAtIndex(0);
        if (totalRow) gridApi.value.setRowNodeExpanded(totalRow, true, true);
      } else {
        gridApi.value.collapseAll();
      }
    } else gridApi.value.collapseAll();
  }
}

const rowData = computed(() => {
  // if we have grouped rows, always return data
  if (groupedColsFields.value || groupedRowGrandTotal.value) return data.value;
  if (expanded.value) return data.value;
  return [];
});

function updateDefaultColumns(displayedColumns) {
  // if null, then assume everything
  if (!displayedColumns) defaultColumns.value = columnDefs.value.map((x) => x.field);
  else defaultColumns.value = [...displayedColumns];
}

function resetColumns() {
  updateDefaultColumns(defaultShowColumns.value);
  shownColumnsComputed.value = [...defaultShowColumns.value];
}
function loadedColumns() {
  updateDefaultColumns(shownColumnsComputed.value);
}
function savedColumns() {
  updateDefaultColumns(shownColumnsComputed.value);
}

const showLocationNames = ref(false);
async function updateShowLocationNames(value) {
  // force re render the loc/nsn columns
  showLocationNames.value = value;
  await nextTick();
  gridApi.value.refreshCells({
    force: true,
    columns: ['ag-Grid-AutoColumn', 'loc', 'nsn', 'storeNum'],
  });
}

const settings = ref(null);
function handleColumnChange({ finished, source }) {
  if (!finished || source !== 'uiColumnMoved') return;
  const columns = gridColumnApi.value
    .getAllDisplayedColumns()
    .map((x) => x.colId);
  shownColumns.value = columns;
  updateDefaultColumns(columns);
  settings.value?.save(columns);
}

function changeColumnGroup({ columns }) {
  shownColumnsComputed.value = columns;
}
</script>

<style scoped>
@import "./gridStyles.scss";
</style>