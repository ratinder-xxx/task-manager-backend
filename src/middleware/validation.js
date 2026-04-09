import { body, validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

export const userValidation = {
  register: [
    body("username").isLength({ min: 3 }).trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 })
  ],
  login: [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty()
  ]
};

export const projectValidation = {
  create: [
    body("name").notEmpty().trim().escape(),
    body("description").optional().trim().escape()
  ],
  update: [
    body("name").optional().trim().escape(),
    body("description").optional().trim().escape()
  ]
};

export const taskValidation = {
  create: [
    body("title").notEmpty().trim().escape(),
    body("description").optional().trim().escape(),
    body("status").optional().isIn(["todo", "in-progress", "done"])
  ],
  update: [
    body("title").optional().trim().escape(),
    body("description").optional().trim().escape(),
    body("status").optional().isIn(["todo", "in-progress", "done"])
  ]
};