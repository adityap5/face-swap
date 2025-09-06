// middleware/errorMiddleware.js
const multer = require('multer');
const notFound = (req, res, next) => {
  if (req.originalUrl.startsWith('/.well-known')) {
    return res.status(204).end(); // No Content
  }
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 400;
      message = 'File too large. Maximum size is 2MB';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      statusCode = 400;
      message = 'Too many files uploaded';
    } else {
      statusCode = 400;
      message = 'File upload error';
    }
  }

  console.error(err);

  if (req.accepts('html')) {
    res.status(statusCode).render('error', {
      message: message,
      statusCode: statusCode
    });
  } else {
    res.status(statusCode).json({
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};

module.exports = {
  notFound,
  errorHandler
};