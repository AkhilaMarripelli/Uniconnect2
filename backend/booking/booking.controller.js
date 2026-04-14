import Booking from "./booking.model.js";
import Resource from "./resource.model.js";
import User from "../models/User.js";


export const getResources = async (req, res) => {
    try {
        const resources = await Resource.find({});
        res.json(resources);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch resources" });
    }
};

export const requestBooking = async (req, res) => {
    try {
        const { resourceId, eventName, purpose, startTime, endTime } = req.body;
        const studentId = req.user.id; 

        // Algorithm: CONFLICT CHECK
        const st = new Date(startTime);
        const et = new Date(endTime);

        const conflicts = await Booking.find({
            resourceId,
            status: { $in: ["pending", "approved"] },
            startTime: { $lt: et },
            endTime: { $gt: st }
        });

        if (conflicts.length > 0) {
            return res.status(409).json({ success: false, message: "Slot already taken" });
        }

        const b = await Booking.create({
            resourceId,
            studentId,
            eventName,
            purpose,
            startTime: st,
            endTime: et,
            status: "pending"
        });

        res.status(201).json({ success: true, booking: b });
    } catch (err) {
        res.status(500).json({ error: "Booking request failed" });
    }
};

export const getMyRequests = async (req, res) => {
    try {
        const bookings = await Booking.find({ studentId: req.user.id }).populate('resourceId').sort('-createdAt');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch requests" });
    }
};

export const getAdminRequests = async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const resources = await Resource.find({ branch: admin.branch });
        const resourceIds = resources.map(r => r._id);

        const bookings = await Booking.find({ 
            resourceId: { $in: resourceIds },
            status: "pending"
        }).populate("resourceId").populate("studentId", "rollNo").sort('startTime');

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch admin requests" });
    }
};

export const decideRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminMessage } = req.body; 
        
        const booking = await Booking.findByIdAndUpdate(id, { status, adminMessage }, { new: true });
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ error: "Failed to process decision" });
    }
};

export const getHeatmapData = async (req, res) => {
    try {
        const { resourceId } = req.params;
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);

        // Fetch historical booking volumes
        const bookings = await Booking.find({
            resourceId,
            status: "approved",
            startTime: { $gte: sixMonthsAgo }
        });

        const historyData = bookings.map(b => ({
            startTime: b.startTime,
            endTime: b.endTime
        }));

        // Call ML Service for ARIMA peak prediction
        const response = await fetch("http://localhost:8000/booking/predict_peak", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                resourceId,
                history: historyData
            })
        });

        if (!response.ok) {
            throw new Error(`ML service responded with ${response.status}`);
        }
        
        const mlData = await response.json();
        res.json({ success: true, heatmap: mlData.heatmap });
    } catch (err) {
        console.error("ML Peak Prediction Error:", err.message);
        res.status(500).json({ error: "Failed to generate peak prediction heatmap" });
    }
};

export const getOccupiedSlots = async (req, res) => {
    try {
        const { resourceId } = req.params;
        const now = new Date();
        const bookings = await Booking.find({
            resourceId,
            status: "approved",
            endTime: { $gte: now }
        }).sort('startTime');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch occupied slots" });
    }
};
