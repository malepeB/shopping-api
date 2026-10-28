import* as http from "http";

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Shopping List API is running" }));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});