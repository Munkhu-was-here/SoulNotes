import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { category, message, transcript } = req.body;

  if (!category || !message) {
    return res.status(400).json({ message: "Category and message required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `Soul Notes - ${category}`,
      text: [
        `Төрөл: ${category}`,
        "",
        "Зурвас:",
        message,
        "",
        "Transcript:",
        transcript || ""
      ].join("\n")
    });

    return res.status(200).json({ message: "Амжилттай илгээгдлээ." });
  } catch (error) {
    console.error("MAIL ERROR:", error);
    return res.status(500).json({ message: "Илгээхэд алдаа гарлаа." });
  }
}