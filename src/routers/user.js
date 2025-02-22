const express = require("express");
const router = express.Router()
const { createUser, validateUserParams } = require("../services/user");

router.post("/", async (request, response) => {
    const { valid, error: validateError } = await validateUserParams({ ...request.body });
    if (!valid) {
        return response.status(400).json({ validateError });
    }
    const { newUser, error: createError } = await createUser({ ...request.body })
    if (createError) {
        return response.status(500).json({ createError });
    }
    return response.status(201).json({ newUser });
})

module.exports = router