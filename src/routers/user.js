const express = require("express");
const router = express.Router()
const { createUser, validateUserParams } = require("../services/user");
const { loginUser, validateLoginParams, logoutUser } = require("../services/auth");

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

router.post("/login", async (request, response) => {
    const { valid, error: validateError } = await validateLoginParams({ ...request.body });
    if (!valid) {
        return response.status(400).json({ validateError });
    }
    const { user, session, error: loginError } = await loginUser({ ...request.body });
    if (loginError) {
        return response.status(500).json({ loginError });
    }
    return response.status(200).json({ user, accessToken: session.accessToken });
})

router.post("/logout", async (request, response) => {
    const { session, error: logoutError } = await logoutUser({ session: request.session });
    if (logoutError) {
        return response.status(500).json({ logoutError });
    }
    return response.status(200).json({ success: true });
})

module.exports = router