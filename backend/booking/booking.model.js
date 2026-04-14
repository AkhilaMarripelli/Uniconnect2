import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventName: { type: String, required: true },
    purpose: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ["pending", "approved", "rejected"], 
        default: "pending" 
    },
    adminMessage: { type: String },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
