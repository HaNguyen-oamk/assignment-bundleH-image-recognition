const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
const upload = multer({ dest: "uploads/" });

const endpoint = process.env.endpoint;
const Key = process.env.Key;

app.post("/upload", upload.single("image"), async (req, res) => {
  const filePath = req.file.path;

  try {
    const imageData = fs.readFileSync(filePath);
    const response = await axios.post(
      `${endpoint}/vision/v3.2/analyze?visualFeatures=Description`,
      imageData,
      {
        headers: {
          "Content-Type": "application/octet-stream",
          "Ocp-Apim-Subscription-Key": Key,
        },
      }
    );

    fs.unlinkSync(filePath);

    res.json(response.data);
  } catch (error) {
    console.error("Error calling Azure Cognitive Services:", error);
    res.status(500).send("Error processing image");
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
