const path = require("path");
const { AppError } = require("./error");

module.exports = {
  isEmail: (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  },

  isPassword: (password) => {
    return password.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    );
  },
  isImage: (image, next) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(image.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(image.mimetype);
    if (mimetype && extname) {
      return next(null, true);
    } else {
      next(new AppError(400, "File must be an image"));
    }
  },
};
