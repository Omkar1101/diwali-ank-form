const express = require("express");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Update the CORS origin to match your website's port
app.use(
  cors({
    origin: "http://localhost:8080", // Corrected URL
  })
);
app.use(express.json());

app.post("/api/submit-form", async (req, res) => {
  const {
    name,
    contact,
    district,
    taluka,
    village,
    literatureType,
    otherLiteratureType,
    literature,
  } = req.body;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const rowData = [
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      name,
      contact,
      district,
      taluka,
      village,
      literatureType === "इतर" ? otherLiteratureType : literatureType,
      literature,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:H",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
      },
    });

    res
      .status(200)
      .json({ message: "Data successfully added to Google Sheet." });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ message: "Error adding data to Google Sheet." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
