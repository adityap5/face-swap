const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { renderForm, submitForm, displaySubmissions, displaySubmission } = require('../controllers/submissionController');

router.get('/', renderForm);
router.post('/submit', upload.fields([{ name: 'image' }, { name: 'styleImage' }]), submitForm);
router.get('/submissions', displaySubmissions);
router.get('/submissions/:id', displaySubmission);

module.exports = router;
