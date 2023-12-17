
import {
  valueCheckFormatterNoSpecial,
  numberFormatter,
  currencyFormatter,
  percentFormatter,
  numericComparator,
} from './formatters';


function getMinWidth(headerName) {
  if (!headerName) return 70;

  const pixelsPerChar = 7;
  const padding = 24;
  const longestWord = headerName
    .split(' ')
    .reduce((a, b) => (a.length > b.length ? a : b));

  return longestWord.length * pixelsPerChar + padding;
}

const defaultCol = headerName => ({
  minWidth: getMinWidth(headerName),
  hide: false,
});

export const columnText = ({ field, headerName, ...column }) => ({
  field,
  headerName,
  filter: 'agTextColumnFilter',
  valueFormatter: valueCheckFormatterNoSpecial,
  type: '',
  cellClass: 'string',
  ...defaultCol(headerName),
  ...column,
});

export const columnNumber = ({ field, headerName, decimalPlace = 0, ...column }) => ({
  field,
  headerName,
  filter: 'agNumberColumnFilter',
  valueFormatter: ({ value }) => numberFormatter(value, decimalPlace),
  type: 'numericColumn',
  cellClass: 'number',
  comparator: numericComparator,
  cellStyle: { textAlign: 'right', ...column.cellStyle },
  ...defaultCol(headerName),
  ...column,
});


export const columnCurrency = ({ field, headerName, decimalPlace = 2, ...column }) => ({
  field,
  headerName,
  filter: 'agNumberColumnFilter',
  valueFormatter: ({ value }) => currencyFormatter(value, decimalPlace),
  type: 'numericColumn',
  cellClass: 'currency',
  comparator: numericComparator,
  cellStyle: { textAlign: 'right', ...column.cellStyle },
  ...defaultCol(headerName),
  ...column,
});

export const columnPercent = ({ field, headerName, decimalPlace = 2, ...column }) => ({
  field,
  headerName,
  filter: 'agNumberColumnFilter',
  valueFormatter: ({ value }) => percentFormatter(value, decimalPlace),
  type: 'numericColumn',
  cellClass: 'percent',
  comparator: numericComparator,
  cellStyle: { textAlign: 'right', ...column.cellStyle },
  ...defaultCol(headerName),
  ...column,
});

export const locationColumn = columnText({
  field: 'storeNum',
  headerName: 'Loc',
  pinned: 'left',
  sort: 'asc',
  comparator: numericComparator,
  valueGetter({ data, context }) {
    const showLocationNames = context?.showLocationNames;
    let value = data?.storeNum;
    if (showLocationNames) {
      const locations = context?.locations;
      const location = locations?.find(l => `${l.value}` === `${data?.storeNum}`);
      value = location?.text || value;
    }
    return value;
  },
  valueFormatter: null,
});

export const excelStyles = [
  // defaults
  {
    id: 'number',
  },
  {
    id: 'percent',
    numberFormat: {
      format: '0.00%',
    },
  },
  {
    id: 'currency',
    numberFormat: {
      format: '$#,##0.00',
    },
  },
  {
    id: 'string',
    dataType: 'String',
  },
  {
    id: 'date',
    dataType: 'DateTime',
  },
];
