const sortTable = (req, res) => {
  const { column, data } = req.body;
  const sortDirection = req.body.sortDirection || 'asc';

  const isNumericColumn = data.every(row => {
    const value = row[column] || '';
    const cleaned = value.toString().replace(/[^0-9.-]/g, '');
    return cleaned === '' || !isNaN(parseFloat(cleaned)) && isFinite(cleaned);
  });

  const sortedData = [...data].sort((a, b) => {
    let valA = a[column] || '';
    let valB = b[column] || '';
    if (isNumericColumn) {
      valA = parseFloat(valA.toString().replace(/[^0-9.-]/g, ''));
      valB = parseFloat(valB.toString().replace(/[^0-9.-]/g, ''));
      if (isNaN(valA)) valA = -Infinity;
      if (isNaN(valB)) valB = -Infinity;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    } else {
      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }
  });

  res.json({ sortedData, sortDirection });
};

const setupFilters = (req, res) => {
  const { filters, data } = req.body;

  const filteredData = data.filter(item => {
    return Object.entries(filters).every(([col, val]) => {
      let cellText = item[col]?.toString().toLowerCase() || '';
      return cellText.includes(val.toLowerCase());
    });
  });

  res.json({ filteredData });
};

const saveEditedData = (req, res) => {
  const { updatedRows, allData } = req.body;

  const mergedData = allData.map(row => {
    const match = updatedRows.find(r => r.ID === row.ID);
    return match ? { ...row, ...match } : row;
  });

  res.json({ mergedData });
};

const updateFormulaColumns = (req, res) => {
  const { sheetData, formulas } = req.body;

  const evaluateFormula = (formula, rowData) => {
    try {
      let expr = formula.replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, match => {
        const val = rowData[match];
        return isNaN(val) ? `"${val}"` : parseFloat(val);
      });
      if (expr.startsWith('=')) expr = expr.substring(1);
      return Function('"use strict";return (' + expr + ')')();
    } catch (e) {
      return 'Error';
    }
  };

  const processedData = sheetData.map(row => {
    const newRow = { ...row };
    Object.keys(formulas).forEach(colName => {
      const formula = formulas[colName];
      try {
        newRow[colName] = evaluateFormula(formula, newRow);
      } catch (e) {
        newRow[colName] = 'Error';
      }
    });
    return newRow;
  });

  res.json({ processedData });
};

const exportToCSV = (req, res) => {
  const { headers, rows } = req.body;

  const csvRows = [headers.join(',')];
  rows.forEach(row => {
    const values = headers.map(h => `"${row[h] || ''}"`);
    csvRows.push(values.join(','));
  });

  const csvString = csvRows.join('\n');

  res.header('Content-Type', 'text/csv');
  res.attachment('ResidentData.csv');
  res.send(csvString);
};

module.exports = {
  sortTable,
  setupFilters,
  saveEditedData,
  updateFormulaColumns,
  exportToCSV
};