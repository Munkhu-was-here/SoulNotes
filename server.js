const express = require("express");
const path = require("path");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/contact", async (req, res) => {
  const { category, message, transcript } = req.body;

  if (!category || !message) {
    return res.status(400).json({
      message: "Category and message are required"
    });
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    return res.status(500).json({
      message: "Gmail environment variables are missing"
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const mailText = [
    "Soul Notes Podcast",
    "------------------------",
    `Төрөл: ${category}`,
    "",
    "Зурвас:",
    message,
    "",
    "Transcript:",
    transcript || "",
    "------------------------"
  ].join("\n");

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `Soul Notes - ${category}`,
      text: mailText
    });

    res.json({
      message: "Амжилттай илгээгдлээ."
    });
  } catch (error) {
    console.error("MAIL ERROR:", error);
    res.status(500).json({
      message: "Илгээхэд алдаа гарлаа."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});