<template>
  <v-dialog
    v-model="menuOpen"
    :max-width="400"
    close-on-back
  >
  <template v-slot:activator="{ props }">
    <v-icon
      :disabled="disabled"
      v-bind="props"
      large
    >
      mdi-download
    </v-icon>
  </template>
    <v-card class="d-flex flex-column">
      <v-toolbar
        color="secondary"
        dark
        max-height="64"
        style="margin-bottom: 10px"
      >
        <v-toolbar-title>Download</v-toolbar-title>
        <v-spacer />
        <v-btn icon dark @click="menuOpen = false">
          <v-icon large>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-title>File Name</v-card-title>
      <v-card-text>
        <v-text-field label="File Name" outlined dense v-model="fileName" />
        <v-checkbox
          v-model="allColumns"
          hide-details
          label="Include Hidden Columns"
          class="mt-0"
        />
      </v-card-text>
      <v-spacer></v-spacer>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn @click="menuOpen = false" color="secondary">Cancel</v-btn>
        <v-spacer></v-spacer>
        <ButtonOptions @click="downloadExcel">
          <v-icon>mdi-content-save</v-icon>
          Save
          <template v-slot:options>
            <v-list>
              <v-list-item link @click.prevent="downloadExcel">
                <v-list-item-title>Excel</v-list-item-title>
              </v-list-item>
              <v-list-item link @click.prevent="downloadCSV">
                <v-list-item-title>CSV</v-list-item-title>
              </v-list-item>
            </v-list>
          </template>
        </ButtonOptions>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import ButtonOptions from './ButtonOptions.vue';

export default {
  name: 'GridDownload',
  components: { ButtonOptions },
  props: {
    // used in the grid container
    gridApi: {
      type: Object,
    },
    reportName: {
      type: String,
      default: '',
    },
    columnGroups: {
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      menuOpen: false,
      fileName: this.reportName.replace(/[^a-zA-Z ]/g, ''),
      allColumns: false,
    };
  },
  computed: {
    computedFileName() {
      const cleanedReportName = this.reportName.replace(/[^a-zA-Z ]/g, '');
      return cleanedReportName;
    },
  },
  methods: {
    setFileName() {
      this.fileName = this.computedFileName;
    },
    downloadExcel() {
      const sheets = [];
      // default cols
      sheets.push(
        this.gridApi.getSheetDataForExcel({
          sheetName: this.reportName,
          allColumns: this.allColumns,
          processCellCallback: this.processExcelCell,
        }),
      );

      this.columnGroups.forEach(f => {
        sheets.push(
          this.gridApi.getSheetDataForExcel({
            sheetName: f.name.replace(/[^a-zA-Z ]/g, ''),
            columnKeys: f.columns,
            processCellCallback: this.processExcelCell,
          }),
        );
      });

      this.gridApi.exportMultipleSheetsAsExcel({
        data: sheets,
        fileName: this.fileName,
      });
    },
    downloadCSV() {
      this.gridApi.exportDataAsCsv({
        fileName: this.fileName,
        processCellCallback: this.processCells,
        allColumns: this.allColumns,
      });
      this.menuOpen = false;
    },
    processExcelCell(params) {
      const wholeNumberClasses = ['wholeNumber'];
      const twoDecimalClasses = ['currency', 'number'];
      const fourDecimalClasses = ['percent'];
      // I want to keep the excel types like currency, number, etc -
      // that way people can use excel functions on them - like sum
      // I just want to round the whole numbers and round currency to 2 decimals, etc
      let value = params.value;
      if (value?.toString) value = value.toString();
      if (value == null) return '';
      if (wholeNumberClasses.includes(params.column?.colDef?.cellClass))
        return Math.round(value);
      if (twoDecimalClasses.includes(params.column?.colDef?.cellClass))
        return Math.round(value * 100) / 100;
      if (fourDecimalClasses.includes(params.column?.colDef?.cellClass))
        return Math.round(value * 10000) / 10000;
      return value;
    },
    processCells(params) {
      if (!params.column.colDef.valueFormatter) return params.value;
      const formattedValue = params.column.colDef.valueFormatter(params);
      return formattedValue;
    },
  },
};
</script>