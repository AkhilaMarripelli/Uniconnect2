import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    getResources,
    requestBooking,
    getMyRequests,
    getAdminRequests,
    decideRequest,
    getHeatmapData,
    getOccupiedSlots
} from "./booking.controller.js";

const router = express.Router();

router.get("/resources", getResources);
router.post("/request", authMiddleware, requestBooking);
router.get("/my-requests", authMiddleware, getMyRequests);
router.get("/admin/requests", authMiddleware, getAdminRequests);
router.put("/admin/decide/:id", authMiddleware, decideRequest);
router.get("/heatmap/:resourceId", getHeatmapData);
router.get("/occupied/:resourceId", getOccupiedSlots);

export default router;
