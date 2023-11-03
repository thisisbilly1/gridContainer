const MISSING_VALUE = 'N/A';

function isFinite(val) {
  return !(
    val === Number.POSITIVE_INFINITY || val === Number.NEGATIVE_INFINITY
  );
}

function hasValue(val) {
  if (val === 0 || val === false) return true;
  // if(typeof val === 'string' && val === '') return false;
  return (val && isFinite(val)) || null;
}

export function valueCheckFormatterNoSpecial({ value, node }) {
  if (node.group) return value;
  if (!hasValue(value)) return MISSING_VALUE;
  return value;
}

export function numberFormatter(value, decimals = 0) {
  try {
    let newVal = value?.toString ? value.toString() : value;
    if (newVal == null || newVal === '') return MISSING_VALUE;
    if (typeof newVal === 'string') return newVal;
    return newVal.toFixed(decimals).toLocaleString('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    });
  } catch (e) {
    console.error('ERROR:', e);
    return newVal;
  }
}

export function percentFormatter(value, decimals = 2) {
  try {
    let newVal = value?.toString ? value.toString() : value;
    if (newVal == null || newVal === '') return MISSING_VALUE;
    if (typeof newVal === 'string') return newVal;
    return `${(newVal * 100).toFixed(decimals)}%`;
  } catch (e) {
    console.error('ERROR:', e);
    return newVal;
  }
}

export function currencyFormatter(value, decimals = 0) {
  let newVal = value?.toString ? value.toString() : value;
  if (newVal == null) return MISSING_VALUE;
  const formatVal = Intl.NumberFormat('en-us', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(newVal);
  return formatVal;
}


// comparitors
export function numericComparator(valueA, valueB, nodeA, nodeB, isDescending) {
  if (valueA == null) return isDescending ? -1 : 1;
  if (valueB == null) return isDescending ? 1 : -1;
  return parseFloat(valueA) - parseFloat(valueB);
}
