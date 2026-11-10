import http, { IncomingMessage, ServerResponse } from "http";
import { Item } from "./models/item";

const PORT = 3000;

let items: Item[] = [];
let nextId = 1;

// Error with a status code, so we can throw 400 or 404 anywhere
class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Every success looks like: { success: true, data: ... }
function sendSuccess(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: true, data }));
}

// Every error looks like: { success: false, error: { message } }
function handleError(res: ServerResponse, err: unknown) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof HttpError ? err.message : "Internal server error";
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: false, error: { message } }));
}

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new HttpError(400, "Invalid JSON"));
      }
    });
  });
}

function findItem(id: number): Item {
  const item = items.find((i) => i.id === id);
  if (!item) throw new HttpError(404, "Item not found");
  return item;
}

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const { method, url } = req;
    const idMatch = url?.match(/^\/items\/(\d+)$/);
    const id = idMatch ? Number(idMatch[1]) : null;

    // GET /items
    if (method === "GET" && url === "/items") {
      return sendSuccess(res, 200, items);
    }

    // POST /items
    if (method === "POST" && url === "/items") {
      const { name, quantity } = await readBody(req);
      if (typeof name !== "string" || name.trim() === "") {
        throw new HttpError(400, "name is required");
      }
      if (typeof quantity !== "number" || quantity <= 0) {
        throw new HttpError(400, "quantity must be a number greater than 0");
      }
      const newItem: Item = { id: nextId++, name: name.trim(), quantity, purchased: false };
      items.push(newItem);
      return sendSuccess(res, 201, newItem);
    }

    // GET /items/:id
    if (method === "GET" && id !== null) {
      return sendSuccess(res, 200, findItem(id));
    }

    // PUT /items/:id
    if (method === "PUT" && id !== null) {
      const item = findItem(id);
      const { name, quantity, purchased } = await readBody(req);

      if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
        throw new HttpError(400, "name must be a non-empty string");
      }
      if (quantity !== undefined && (typeof quantity !== "number" || quantity <= 0)) {
        throw new HttpError(400, "quantity must be a number greater than 0");
      }
      if (purchased !== undefined && typeof purchased !== "boolean") {
        throw new HttpError(400, "purchased must be true or false");
      }

      if (name !== undefined) item.name = name.trim();
      if (quantity !== undefined) item.quantity = quantity;
      if (purchased !== undefined) item.purchased = purchased;
      return sendSuccess(res, 200, item);
    }

    // DELETE /items/:id
    if (method === "DELETE" && id !== null) {
      findItem(id); // throws 404 if missing
      items = items.filter((i) => i.id !== id);
      res.writeHead(204);
      return res.end();
    }

    throw new HttpError(404, "Route not found");
  } catch (err) {
    handleError(res, err);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});