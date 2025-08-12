import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rootRouter from "./routes/root";
import sessionRouter from "./routes/session";
import conversationRouter from "./routes/conversations";
import chatRouter from "./routes/chat";
import errorHandler from "./middleware/errorHandler";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Mount routers
app.use("/", rootRouter);
app.use("/api/session", sessionRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/chat", chatRouter);

// Global error handler
app.use(errorHandler);

const PORT = 3001;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
