import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import experienceRoutes from "./experience/experience.routes.js";
import lostFoundRoutes from "./lost-found/routes/lostFound.routes.js";
import grievanceRoutes from "./grievance/grievance.routes.js";
import bookingRoutes from "./booking/booking.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"));

mongoose.connection.once("open", () => {
  console.log("Connected DB name:", mongoose.connection.name);
});

app.use("/api/experience", experienceRoutes);
app.use("/api/lost-found", lostFoundRoutes);
app.use("/api/grievance", grievanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/booking", bookingRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server running on port 5000");
});
