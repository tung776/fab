exports.profileUpload = async (req, res, next) => {
  // debugger;
  const file = req.file;
  // const _id = r
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  let pathImage = `/users/pictures/${file.filename}`;
  res.status(200).json({
    path: pathImage
  });
};
