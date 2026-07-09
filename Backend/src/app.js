import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true, // or specific frontend origin once established
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// API Routes
app.use("/api/auth", authRoutes);

export default app;