const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ status: "Server musik aktif!" });
});

// Pakai invidious API (gratis, tanpa ytdl)
app.get("/audio", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL diperlukan" });

  try {
    // Ambil video ID dari URL YouTube
    const videoId = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (!videoId) return res.status(400).json({ error: "URL tidak valid" });

    // Pakai Invidious API publik
    const apiUrl = `https://invidious.nerdvpn.de/api/v1/videos/${videoId}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Ambil audio format terbaik
    const audioFormat = data.adaptiveFormats?.find(
      f => f.type?.includes("audio/webm") || f.type?.includes("audio/mp4")
    );

    if (!audioFormat) {
      return res.status(500).json({ error: "Format audio tidak ditemukan" });
    }

    res.json({
      title: data.title,
      audioUrl: audioFormat.url,
      duration: data.lengthSeconds,
    });

  } catch (err) {
    res.status(500).json({ error: "Gagal: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
