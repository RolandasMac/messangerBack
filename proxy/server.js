const fs = require("fs");
const http = require("http");
const https = require("https");
const privateKey = fs.readFileSync("../cert/private.key", "utf8");
const certificate = fs.readFileSync("../cert/certificate.crt", "utf8");

const credentials = { key: privateKey, cert: certificate };

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
const BACKHOST = process.env.BACKHOST;
app.use(
  cors({
    origin: `https://${HOST}`, // Replace with your frontend's origin
    credentials: true, // This allows cookies and other credentials to be sent
  })
);

const proxy = (port, url) => {
  return createProxyMiddleware({
    target: `http://${BACKHOST}:${port}`,
    changeOrigin: true,
    pathRewrite: {
      [`^/${url}`]: "/", // Ensure pathRewrite is correctly applied
    },
    proxyTimeout: 5000, // Set a reasonable timeout (adjust as needed)
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying request to: http://${HOST}:${port}${req.url}`);
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
app.use("/conversations", proxy(5005, "conversations"));
app.use("/contacts", proxy(5006, "contacts"));

// app.listen(PORT, HOST, () => {
//   console.log(`Proxy Started at: ${HOST}:${PORT}`);
// });
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(PORT);
