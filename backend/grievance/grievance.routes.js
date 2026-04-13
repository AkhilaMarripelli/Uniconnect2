import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { submitComplaint, getMyComplaints } from "./grievance.controller.js";

const router = express.Router();

router.post("/", authMiddleware, submitComplaint);
router.get("/mine", authMiddleware, getMyComplaints);

export default router;
