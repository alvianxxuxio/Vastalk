const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(__dirname, filePath);

  // Tentukan tipe konten berdasarkan ekstensi file
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".wav": "audio/wav",
    ".mp4": "video/mp4",
    ".woff": "application/font-woff",
    ".ttf": "application/font-ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".otf": "application/font-otf",
    ".wasm": "application/wasm",
  };
  const contentType = mimeTypes[extname] || "application/octet-stream";

  // Baca dan kirim file yang diminta
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == "ENOENT") {
        // Jika file tidak ditemukan, kirim halaman 404
        fs.readFile(path.join(__dirname, "404.html"), (err, data) => {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end(data, "utf-8");
        });
      } else {
        // Kirim error 500 untuk kesalahan server lainnya
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Kirim file dengan tipe konten yang benar
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
}).listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
