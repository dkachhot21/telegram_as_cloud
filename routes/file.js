const express = require("express");
const multer = require("multer");
const fileController = require("../controllers/fileController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", fileController.renderIndex);
router.get("/download", fileController.renderDownloadPage);

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/download-file", fileController.downloadFile);

module.exports = router;
