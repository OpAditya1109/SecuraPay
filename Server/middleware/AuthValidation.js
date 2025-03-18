const Joi = require('joi');
const signupvalidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    username: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(100).required(),
    phone: Joi.string().min(10).max(10).required(),
    publicKey: Joi.string().optional(), // Add this line to allow the publicKey
    privateKeyEncrypted: Joi.string().optional(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    console.log("Validation Error:", error.details); // Logs detailed validation errors
    return res
      .status(400)
      .json({ message: "Bad request", error: error.details });
  }

  next();
};

const loginvalidation = (req, res, next) => {
  const schema = Joi.object({
    
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(100).required(),
    
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
};

module.exports={
    signupvalidation,
    loginvalidation
}
