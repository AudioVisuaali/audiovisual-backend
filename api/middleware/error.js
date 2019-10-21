const errorLine = '================ ERROR ================\n\n';

// Do not remove next argument
// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  // TODO add error handling for saving errors
  // eslint-disable-next-line no-console
  console.log(errorLine, error.message);

  // If an error is not provided it means that an
  //   error happened during request processing.
  res.status(error.status || 500);
  res.json({
    error: {
      message: 'Something went wrong on our end',
    },
  });
}

module.exports = errorHandler;
