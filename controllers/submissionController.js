const Submission = require('../models/Submission');
const lightxService = require('../services/LightxService');
const { validateImage } = require('../utils/validation');

// Render form
const renderForm = (req, res) => {
  res.render('index', { errors: [], formData: {} });
};

// Handle form
const submitForm = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const inputImage = req.files?.image?.[0];
    const styleImage = req.files?.styleImage?.[0];

    if (!inputImage || !styleImage) {
      return res.status(400).render('index', {
        errors: [{ msg: 'Both input and style images are required' }],
        formData: req.body,
      });
    }

    // Upload both images
    const originalImageUrl = await lightxService.uploadImage(inputImage.buffer, inputImage.mimetype);
    const styleImageUrl = await lightxService.uploadImage(styleImage.buffer, styleImage.mimetype);

    // Call API
    const swappedImageUrl = await lightxService.performFaceSwap(originalImageUrl, styleImageUrl);

    // Save to DB
    const submission = await Submission.create({
      name,
      email,
      phone,
      originalImageUrl,
      styleImageUrl,
      swappedImageUrl,
      termsAccepted: true,
      createdAt: new Date(),
    });

    res.render('success', { submission, message: '✅ Face swap completed successfully!' });
  } catch (err) {
    console.error('❌ Submission error:', err);
    res.status(500).render('index', {
      errors: [{ msg: 'Submission failed. Please try again.' }],
      formData: req.body,
    });
  }
};

const displaySubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const submissions = await Submission.findAll(limit, skip);
    const totalCount = await Submission.count();
    const totalPages = Math.ceil(totalCount / limit);

    res.render('submissions', { submissions, currentPage: page, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Unable to fetch submissions', statusCode: 500 });
  }
};

const displaySubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).render('error', { message: 'Submission not found', statusCode: 404 });
    }
    res.render('submission-detail', { submission });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Unable to fetch submission', statusCode: 500 });
  }
};

module.exports = { renderForm, submitForm, displaySubmissions, displaySubmission };
