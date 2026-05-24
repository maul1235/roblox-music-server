const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ status: "Server musik aktif!" });
});

// Search lagu
app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query diperlukan" });

  try {
    const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`);
    const data = await response.json();

    const tracks = data.data.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist.name,
      preview: `https://roblox-music-server-production.up.railway.app/proxy?url=${encodeURIComponent(track.preview)}`,
      cover: track.album.cover_medium,
    }));

    res.json({ tracks });
  } catch (err) {
    res.status(500).json({ error: "Gagal: " + err.message });
  }
});

// Proxy audio dari Deezer
app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL diperlukan" });

  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.byteLength);
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: "Proxy gagal: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server musik aktif di port " + PORT);
});
