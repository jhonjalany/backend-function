const express = require('express');
const router = express.Router();

const {
  sortTable,
  setupFilters,
  saveEditedData,
  updateFormulaColumns,
  exportToCSV
} = require('../controllers/residentController');

router.post('/sort', sortTable);
router.post('/filter', setupFilters);
router.post('/save-edits', saveEditedData);
router.post('/update-formulas', updateFormulaColumns);
router.post('/export-csv', exportToCSV);

module.exports = router;