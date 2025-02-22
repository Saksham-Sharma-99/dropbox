const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const { v4: uuidV4 } = require("uuid");
const router = express.Router();
const dotenv = require("dotenv");
const { Document } = require("../models/document");

dotenv.config();

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});


const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    expired: null,
    acl: "public-read",
    key: (req, file, cb) => {
      cb(null, `${req.user.id}/${Date.now()}-${uuidV4()}-${file.originalname}`);
    },
  }),
});


router.post("/", upload.single("document"), (request, response) => {
    console.log(request.file);
    Document.create({
        title: request.body.title || request.file.originalname,
        url: request.file.location,
    })
    response.status(200).json({ success: true });
  });


module.exports = router;