const express = require("express");
const router = express.Router()

const verifyTokenMiddleware = async (req, res, next) => {
    console.log("middleware for route protection")
    next();
}

const Health = require('./health');
router.use("/health", verifyTokenMiddleware, Health);

const Document = require('./document');
router.use("/document", verifyTokenMiddleware, Document);

module.exports = router