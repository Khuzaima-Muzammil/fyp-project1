const { check, validationResult } = require('express-validator');

// Validation Result Checker
const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Register Validation
const validateRegister = [
  check('name', 'Name is required and must be at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  check('email', 'Please include a valid email')
    .isEmail()
    .normalizeEmail(),
  check('password', 'Please enter a password with 8 or more characters, including 1 uppercase, 1 number and 1 symbol')
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
  validateResult
];

// Login Validation
const validateLogin = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists(),
  validateResult
];

// Product Validation
const validateProduct = [
  check('name')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Product name must be between 3 and 100 characters')
    .matches(/[a-zA-Z]/).withMessage('Product name must contain at least one alphabet character')
    .escape(),
  check('costPrice')
    .optional({ checkFalsy: true })
    .isFloat({ gt: 0 }).withMessage('Cost price must be a positive number greater than 0'),
  check('price').custom((value, { req }) => {
    const price = parseFloat(value);
    const costPrice = parseFloat(req.body.costPrice);
    if (isNaN(price) || price <= 0) {
      throw new Error('Selling price must be a positive number');
    }
    if (!isNaN(costPrice) && price <= costPrice) {
      throw new Error('Selling price must be greater than cost price to ensure profit');
    }
    return true;
  }),
  check('stock', 'Stock must be 0 or a positive whole number').isInt({ min: 0 }),
  check('category', 'Please select a valid category').trim().notEmpty().escape(),
  check('description')
    .trim()
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters long')
    .custom((value) => {
      if (/<script\b[^>]*>([\s\S]*?)<\/script>/gi.test(value)) {
        throw new Error('Description contains invalid/malicious script tags');
      }
      return true;
    })
    .escape(),
  check('image')
    .trim()
    .notEmpty().withMessage('Image URL is required')
    .isURL({ require_protocol: true, protocols: ['http', 'https'] }).withMessage('Must be a valid URL starting with http/https')
    .matches(/\.(jpg|jpeg|png|webp)$/i).withMessage('Image URL must end with .jpg, .jpeg, .png, or .webp'),
  validateResult
];

// Profile Update Validation
const validateProfileUpdate = [
  check('username', 'Username must be at least 3 characters').optional({ checkFalsy: true }).trim().isLength({ min: 3 }).escape(),
  check('email', 'Please include a valid email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  check('password', 'New password must be at least 8 characters').optional({ checkFalsy: true }).isLength({ min: 8 }),
  validateResult
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateProfileUpdate,
  validateResult
};
