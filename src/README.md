# Shopping List API

A REST API built with Node.js and TypeScript (built-in `http` module). Items are stored in memory, so data resets when the server restarts.

## Setup
```
npm install
npm run dev
```
Server runs on http://localhost:3000

## Item shape
```json
{ "id": 1, "name": "Milk", "quantity": 2, "purchased": false }
```

## Endpoints

| Method | Endpoint | Description | Success | Errors |
|---|---|---|---|---|
| POST | /items | Add an item (`name`, `quantity`) | 201 | 400 |
| GET | /items | Get all items | 200 | |
| GET | /items/:id | Get one item | 200 | 404 |
| PUT | /items/:id | Update `name`, `quantity` or `purchased` | 200 | 400, 404 |
| DELETE | /items/:id | Delete an item | 204 | 404 |

## Response format
Success: `{ "success": true, "data": ... }`
Error: `{ "success": false, "error": { "message": "..." } }`

## Example
POST /items
```json
{ "name": "Milk", "quantity": 2 }
```