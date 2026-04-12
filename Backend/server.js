console.log("SERVER FILE LOADED");
console.log("SERVER RESTARTED WITH ANALYZE ROUTE");
require("dotenv").config();

const axios = require("axios");
let dataset = [];

//const { GoogleGenerativeAI } = require("@google/generative-ai");

//const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const app = express();
const {
  filterData,
  groupBySum,
  calculateAverage,
  getTopN,
  generateInsights,
} = require("./utils/dataProcessor.js");

app.use(cors());
app.use(express.json());

// Storage config
const upload = multer({ dest: "uploads/" });

// Upload + parse CSV
app.post("/upload", upload.single("file"), (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      fs.unlinkSync(req.file.path);

      dataset = results; // ✅ store data

      res.json(results);
    });
});

// Analyze route
app.post("/analyze", (req, res) => {
  const { type, column, value, groupColumn, valueColumn } = req.body;

  let result;

  if (type === "filter") {
    result = filterData(dataset, column, value);
  }

  if (type === "group") {
    result = groupBySum(dataset, groupColumn, valueColumn);
  }

  if (type === "average") {
    result = calculateAverage(dataset, column);
  }

  res.json(result);
});

// --- AI ROUTE ---
app.post("/ai-query", async (req, res) => {
  const { query } = req.body;

  try {
    // 1️⃣ CALL AI
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
You are a data analyst AI.

Convert user query into STRICT JSON format.

RULES:
- DO NOT return arrays or data
- DO NOT return explanation
- ONLY return JSON with keys:
  operation, column, metric, limit

VALID OPERATIONS:
- "top"
- "average"

EXAMPLES:

Input: Top 5 products by revenue
Output:
{"operation":"top","column":"product","metric":"revenue","limit":5}

Input: Average revenue
Output:
{"operation":"average","column":"revenue"}
`,
          },
          {
            role: "user",
            content: query,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
      },
    );

    const text = response.data.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const aiData = JSON.parse(jsonMatch[0]);

    console.log("AI Parsed:", aiData);

    // 2️⃣ APPLY LOGIC
    let result = {};

    if (aiData.operation === "top") {
      const grouped = groupBySum(dataset, aiData.column, aiData.metric);
      result = getTopN(grouped, aiData.limit || 5);
    }

    if (aiData.operation === "average") {
      result = {
        average: calculateAverage(dataset, aiData.column),
      };
    }

    const insight = generateInsights(aiData.operation, result);

    // 3️⃣ SEND RESULT
    res.json({
      ai: aiData || {},
      result: result || {},
      insight: insight || "No insight available",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
