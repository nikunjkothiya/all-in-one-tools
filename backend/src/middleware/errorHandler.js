import config from "../config/env.js";

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: Object.values(err.errors).map((error) => error.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID format",
      details: err.message,
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      error: "File Upload Error",
      details: err.message,
    });
  }

  return res.status(500).json({
    error: "Internal Server Error",
    message: config.nodeEnv === "development" ? err.message : "Something went wrong",
  });
};

export default errorHandler;
