import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Resource from "./booking/resource.model.js";
import Booking from "./booking/booking.model.js";

dotenv.config();

const BRANCHES = ["CSE", "ECE", "MECH"];
const BLOCKS = ["Block A", "Block B", "Block C"];
const TYPES = ["Classroom", "Seminar Hall", "Auditorium", "Lab"];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Clear existing booking data
        await Resource.deleteMany({});
        await Booking.deleteMany({});
        await User.deleteMany({ role: "admin" });

        // 1. Create Admins
        const admins = {};
        for (const branch of BRANCHES) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            const admin = await User.create({
                rollNo: `admin-${branch.toLowerCase()}`,
                password: hashedPassword,
                role: "admin",
                branch: branch
            });
            admins[branch] = admin._id;
            console.log(`Created admin for ${branch}`);
        }

        // Create a dummy student for the history
        let student = await User.findOne({ role: "student" });
        if (!student) {
            const hashedPassword = await bcrypt.hash("student123", 10);
            student = await User.create({
                rollNo: "student01",
                password: hashedPassword,
                role: "student",
                branch: "CSE"
            });
        }

        // 2. Create Resources
        const resources = [];
        
        // High Demand Demo Resource
        const demoResource = await Resource.create({
            name: "Premium AI Lab",
            type: "Lab",
            block: "Block A",
            capacity: 50,
            branch: "CSE"
        });
        resources.push(demoResource);

        // Generic Resources
        for (let i = 1; i <= 14; i++) {
            const branch = BRANCHES[Math.floor(Math.random() * BRANCHES.length)];
            const type = TYPES[Math.floor(Math.random() * TYPES.length)];
            const block = BLOCKS[Math.floor(Math.random() * BLOCKS.length)];
            
            const r = await Resource.create({
                name: `${branch} ${type} ${i}`,
                type: type,
                block: block,
                capacity: Math.floor(Math.random() * 100) + 30,
                branch: branch
            });
            resources.push(r);
        }
        console.log(`Created ${resources.length} resources`);

        // 3. Create Booking History (Last 6 Months)
        const bookings = [];
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);

        // A. Inject Guaranteed Heavy Demand for the Demo Lab (Daily 2 PM - 4 PM)
        console.log("Injecting peak patterns for Premium AI Lab...");
        for (let d = new Date(sixMonthsAgo); d <= now; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) continue; // Skip Sundays
            
            // Peak at 14:00 (2 PM)
            const startTime = new Date(d);
            startTime.setHours(14, 0, 0, 0);
            const endTime = new Date(d);
            endTime.setHours(16, 0, 0, 0);

            bookings.push({
                resourceId: demoResource._id,
                studentId: student._id,
                eventName: "Daily AI Research",
                purpose: "Heavy Computing",
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                status: "approved"
            });
        }

        // B. Generate random patterns for other resources
        console.log("Generating random historical bookings...");
        for (let i = 0; i < 1200; i++) {
            const resource = resources[Math.floor(Math.random() * resources.length)];
            
            // Random date in last 6 months
            const bookingDate = new Date(sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime()));
            
            // Artificial peak generation: 40% chance of peak hours (10 AM - 1 PM) if it is an Auditorium
            let startHour = 8 + Math.floor(Math.random() * 10); // 8 AM to 5 PM
            if (resource.type === "Auditorium" && Math.random() < 0.4) {
                 startHour = 10 + Math.floor(Math.random() * 3); // 10, 11, 12
            }

            const startTime = new Date(bookingDate);
            startTime.setHours(startHour, 0, 0, 0);
            
            const durationHours = 1 + Math.floor(Math.random() * 3); // 1 to 3 hours
            const endTime = new Date(startTime);
            endTime.setHours(startTime.getHours() + durationHours);

            bookings.push({
                resourceId: resource._id,
                studentId: student._id,
                eventName: `Event ${i}`,
                purpose: "Academic / Club",
                startTime,
                endTime,
                status: Math.random() > 0.1 ? "approved" : "rejected" // 90% approved
            });
        }

        await Booking.insertMany(bookings);
        console.log(`Created ${bookings.length} historical bookings for ML training!`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
