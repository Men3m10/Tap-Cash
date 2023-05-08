const signUpValidation = (
  req,
  res,
  name,
  email,
  password,
  ssid,
  confirmPassword
) => {
  if (name.length < 3 || name.length == 0) {
    return res.status(400).json({ message: "too short Password" });
  }
  if (email.length == 0) {
    return res.status(400).json({ message: "email required" });
  }
  if (password.length < 6 || password.length == 0) {
    return res.status(400).json({ message: "too short Password" });
  }
  if (password != req.body.confirmPassword) {
    return res
      .status(400)
      .json({ message: "password confirmation is inCorrect" });
  }
  if (ssid.length > 14 || ssid.length < 14 || ssid.length == 0) {
    return res.status(400).json({ message: "national id must be 14 number" });
  }
  if (confirmPassword.length < 6 || confirmPassword.length == 0) {
    return res.status(400).json({ message: "confirm password is required" });
  }
};

const logInValidation = (res, password, ssid) => {
  if (password.length < 6 || ssid.length > 14 || ssid.length < 14) {
    return res
      .status(400)
      .json({ message: "check national id or password you enterd" });
  }
};
module.exports = { signUpValidation, logInValidation };
