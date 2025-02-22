const express = require("express");
const router = express.Router()
const { Session } = require("../models/session");

const verifyTokenMiddleware = async (req, res, next) => {
    const routesToSkip = {
        "/api/user/login": "POST",
        "/api/user": "POST"
    }
    console.log(req.originalUrl)
    if (routesToSkip[req.originalUrl] === req.method) {
        next()
        return
    }

    const accessToken = req.headers.authorization
    if (!accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const session = await Session.findOne({ where: { accessToken, status: "active" } });
    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await session.getUser()
    req.session = session;
    req.user = user;
    next();
}

const Health = require('./health');
router.use("/health", verifyTokenMiddleware, Health);

const Document = require('./document');
router.use("/document", verifyTokenMiddleware, Document);

const User = require('./user');
router.use("/user", verifyTokenMiddleware, User);

module.exports = router