const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

exports.renderIndex = (req, res) => {
  res.render("index");
};

exports.renderDownloadPage = (req, res) => {
  res.render("download");
};

exports.uploadFile = (req, res) => {
  const file = req.file;
  const filePath = path.join(__dirname, "..", file.path);

  exec(
    `python telegram_handler.py upload "${filePath}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error uploading file: ${error.message}`);
        return res.status(500).send("Error uploading file to Telegram");
      }
      const output = stdout.trim().split(", ");
      const fileId = output[0].split(": ")[1];
      const access_hash = output[1].split(": ")[1];
      const file_reference = output[2].split(": ")[1];

      console.log(
        `File ID: ${fileId}, Access Hash: ${access_hash}, File Reference: ${file_reference}`,
      );
      res.send({
        message: "File uploaded to Telegram",
        fileId,
        access_hash,
        file_reference,
      });
    },
  );
};

exports.downloadFile = (req, res) => {
  const { fileId, accessHash, fileReference } = req.body; // Assuming you're sending this data as a JSON body
  const destPath = path.join(__dirname, "..", "downloads", `${fileId}.file`);

  exec(
    `python telegram_handler.py download ${fileId} "${destPath}" --access_hash ${accessHash} --file_reference ${fileReference}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error downloading file: ${error.message}`);
        return res.status(500).send("Error downloading file from Telegram");
      }
      res.download(destPath);
    },
  );
};
