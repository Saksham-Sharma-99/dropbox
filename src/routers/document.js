const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const { v4: uuidV4 } = require("uuid");
const router = express.Router();
const dotenv = require("dotenv");
const {
  createDocument,
  getDocumentsList,
  getDocument,
  validateShareParams,
  shareDocuments,
  validateUpdateParams,
  updateDocument
} = require("../services/document");

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

router.post("/", upload.single("document"), async (request, response) => {
  const { newDocument, error: createError } = await createDocument({ file: request.file, ...request.body, user: request.user })
  if (createError) {
      return response.status(500).json({ createError });
  }
  
  response.status(200).json(newDocument);
});

router.get("/", async (request, response) => {
  const page = request.query.page > 1 ? request.query.page : 1
  const accessType = request.query.accessType
  if (accessType && !['edit', 'read', 'owner'].includes(accessType)) {
    response.status(400).json({ error: 'Invalid access type' })
  }
  const { documents, error: getError } = await getDocumentsList({ user: request.user, page, accessType })
  if (getError) {
      return response.status(500).json({ getError });
  }
  response.status(200).json(documents);
});

router.get("/:id", async (request, response) => {
  const { document, error: getError, errorCode } = await getDocument({ id: request.params.id, user: request.user })
  if (getError) {
      return response.status(errorCode).json({ getError });
  }
  response.status(200).json(document);
})

router.post("/access", async (request, response) => {
	const { valid, error: validateError } = await validateShareParams({
		...request.body,
		user: request.user,
	});
	if (!valid) {
		return response.status(400).json({ validateError });
	}

	const { error: shareError } = await shareDocuments({
		...request.body,
		user: request.user,
	});
	if (shareError) {
		return response.status(500).json({ shareError });
	}
	response.status(200).json({ success: true });
})

router.patch("/:id", async (request, response) => {
  const { valid, error: validateError } = await validateUpdateParams({
    documentId: request.params.id,
    user: request.user,
  });
  if (!valid) {
    return response.status(400).json({ validateError });
  }

  const { _document, error: updateError } = await updateDocument({
    ...request.body,
    documentId: request.params.id,
  });
  if (updateError) {
    return response.status(500).json({ updateError });
  }
  response.status(200).json({success: true});
})

module.exports = router;