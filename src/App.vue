<template>
  <div>
    <GridContainer
      class="ma-5"
      :columnDefs="columnDefs"
      :data="data"
      gridName="simple grid"
    />

    <GridContainer
      class="ma-5"
      :columnDefs="columnDefs"
      :data="lotsOfData"
      :groupedColsFields="['group']"
      groupedRowGrandTotal
      settingsName="test"
      gridName="lots of data with groups"
    />

    <GridContainer
      class="ma-5"
      :columnDefs="lotsOfColumns"
      :data="dataForColumnGroups"
      :columnGroups="columnGroups"
      groupedRowGrandTotal
      settingsName="test2"
      gridName="column groups"
    />
  </div>
</template>

<script setup>
import GridContainer from "./components/GridContainer.vue";

const columnDefs = [
  { 
    field: 'group',
  },
  {
    field: 'sales',
    headerName: 'All Net Sales',
    description: 'example description',
    initialAggFunc: 'sum',
  },
  {
    field: 'oepe',
    headerName: 'OEPE',
    initialAggFunc: 'sum',
  },
];

const data = [
  {
    sales: 100,
    oepe: 50,
  },
  {
    sales: 200,
    oepe: 100,
  },
  {
    sales: 300,
    oepe: 150,
  },
];

const groups = ['group1', 'group2', 'group3'];

const lotsOfData = Array.from({ length: 1000 }, () => ({
  sales: Math.floor(Math.random() * 1000),
  oepe: Math.floor(Math.random() * 1000),
  group: groups[Math.floor(Math.random() * groups.length)],
}));

const lotsOfColumns = Array.from({ length: 30 }, (_, i) => ({
  field: `col${i}`,
  headerName: `Column ${i}`,
  initialAggFunc: 'sum',
}));
const columnGroups = [
  {
    name: 'group1',
    columns: lotsOfColumns.slice(0, 10).map(c => c.field),
  },
  {
    name: 'group2',
    columns: lotsOfColumns.slice(10, 20).map(c => c.field),
  },
  // {
  //   name: 'group3',
  //   columns: lotsOfColumns.slice(20, 29).map(c => c.field),
  // },
]
const dataForColumnGroups = Array.from({ length: 20 }, () => {
  const row = {};
  lotsOfColumns.forEach((col, i) => {
    row[col.field] = Math.floor(Math.random() * 1000);
  });
  row.group = groups[Math.floor(Math.random() * groups.length)];
  return row;
});
</script>