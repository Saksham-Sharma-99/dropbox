const express = require("express");
const router = express.Router()

router.get("/status", (request, response) => {
    response.status(200).json({
        health: "healthy",
        ...request.body,
        ...request.query,
        username: request.username
    })
})

module.exports = router