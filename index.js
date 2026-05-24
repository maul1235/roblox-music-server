const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ status: "Server musik aktif!" });
});

app.get("/audio", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL diperlukan" });

  try {
    const videoId = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (!videoId) return res.status(400).json({ error: "URL tidak valid" });

    // Pakai Piped API - lebih stabil dari Invidious
    const apiUrl = `https://pipedapi.kavin.rocks/streams/${videoId}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.error) return res.status(500).json({ error: data.error });

    // Ambil audio terbaik
    const audioStream = data.audioStreams?.[0];
    if (!audioStream) return res.status(500).json({ error: "Audio tidak ditemukan" });

    res.json({
      title: data.title,
      audioUrl: audioStream.url,
      duration: data.duration,
    });

  } catch (err) {
    res.status(500).json({ error: "Gagal: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
