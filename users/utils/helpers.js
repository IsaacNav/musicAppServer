const { generate } = require("generate-password");

const generatePassword = () => {
  const configPassword = {
    length: 12,
    numbers: true,
  };
  return generate(configPassword);
};

module.exports = {
  generatePassword,
};
