import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { 
        type: String, 
        enum: ["Classroom", "Seminar Hall", "Auditorium", "Lab"], 
        required: true 
    },
    block: { type: String, required: true },
    capacity: { type: Number, required: true },
    branch: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Resource", resourceSchema);
