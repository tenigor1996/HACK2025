const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function summarizeText(text) {
  try {
    // The ONLY model your key supports
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
    Summarize the following text in simple language that an elderly person can understand.
    Use 2–4 short sentences, no jargon.

    TEXT:
    ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();

  } catch (error) {
    console.error("Gemini error:", error);
    throw new Error("Summarization failed");
  }
}

module.exports = { summarizeText };
