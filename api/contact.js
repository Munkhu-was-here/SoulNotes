import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { category, message } = req.body || {};

    if (!category || !message) {
      return res.status(400).json({
        message: "Category and message are required"
      });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return res.status(500).json({
        message: "Missing Gmail environment variables"
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"Soul Notes" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `Soul Notes - ${category}`,
      text: [
        "Soul Notes Podcast",
        "------------------------",
        `Төрөл: ${category}`,
        "",
        "Зурвас:",
        message,
        "",
        "------------------------"
      ].join("\n")
    });

    return res.status(200).json({
      message: "Амжилттай илгээгдлээ."
    });
  } catch (error) {
    console.error("MAIL ERROR:", error);
    return res.status(500).json({
      message: error?.message || "Илгээхэд алдаа гарлаа."
    });
  }
}