"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const root_1 = __importDefault(require("./routes/root"));
const session_1 = __importDefault(require("./routes/session"));
const conversations_1 = __importDefault(require("./routes/conversations"));
const chat_1 = __importDefault(require("./routes/chat"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Mount routers
app.use("/", root_1.default);
app.use("/api/session", session_1.default);
app.use("/api/conversations", conversations_1.default);
app.use("/api/chat", chat_1.default);
// Global error handler
app.use(errorHandler_1.default);
const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
