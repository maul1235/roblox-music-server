const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Test server hidup
app.get("/", (req, res) => {
  res.json({ status: "Server musik aktif!" });
});

// Search & ambil URL audio dari YouTube
app.get("/audio", async (req, res) => {
  const query = req.query.url;

  if (!query) {
    return res.status(400).json({ error: "URL YouTube diperlukan" });
  }

  try {
    const info = await ytdl.getInfo(query);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    res.json({
      title: info.videoDetails.title,
      audioUrl: format.url,
      duration: info.videoDetails.lengthSeconds,
    });
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil audio: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
