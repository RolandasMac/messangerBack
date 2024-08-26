const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const app = express();

const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from a .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });
// const PORT = 4001;
// const HOST = "localhost";
const PORT = process.env.PROXYPORT || 5000;
const HOST = process.env.HOST;
app.use(cors());

const proxy = (port, url) => {
  return createProxyMiddleware({
    target: `http://localhost:${port}`,
    changeOrigin: true,
    pathRewrite: {
      [`^/${url}`]: "/", // Ensure pathRewrite is correctly applied
    },
    proxyTimeout: 5000, // Set a reasonable timeout (adjust as needed)
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying request to: http://localhost:${port}${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`Received response from target: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      console.error(`Proxy error: ${err.message}`);
      res.writeHead(504, { "Content-Type": "text/plain" });
      res.end("Proxy Error: Could not reach the target server.");
    },
  });
};

app.use("/auth", proxy(5001, "auth"));
app.use("/todo", proxy(5002, "todo"));
app.use("/socket", proxy(5004, "socket"));
// app.use("/upload", proxy(1005, "upload"));
// app.use("/update", proxy(1006, "update"));

app.listen(PORT, HOST, () => {
  console.log(`Proxy Started at: ${HOST}:${PORT}`);
});
