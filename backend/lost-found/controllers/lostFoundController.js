import LostFoundItem from "../models/LostFoundItem.js";
import Notification from "../models/Notification.js";
import natural from "natural";

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

export const reportItem = async (req, res) => {
    try {
        const { reportedBy, date, description, type } = req.body;

        if (!reportedBy || !date || !description || !type) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newItem = new LostFoundItem({
            reportedBy,
            date,
            description,
            type,
            status: "open",
        });

        await newItem.save();

        // Cosine Similarity Logic
        let potentialMatches = [];
        let itemsToCheck = [];

        // If new item is FOUND, check against LOST items (notify LOST item owners)
        if (type === "found") {
            itemsToCheck = await LostFoundItem.find({ type: "lost", status: "open" });
        }
        // If new item is LOST, check against FOUND items (notify current user)
        else if (type === "lost") {
            itemsToCheck = await LostFoundItem.find({ type: "found", status: "open" });
        }

        const stopwords = new Set(["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "lost", "found"]);

        // Calculate similarity
        itemsToCheck.forEach(item => {
            // Tokenize and FILTER stopwords
            const tokens1 = tokenizer.tokenize(description.toLowerCase()).filter(w => !stopwords.has(w));
            const tokens2 = tokenizer.tokenize(item.description.toLowerCase()).filter(w => !stopwords.has(w));

            if (tokens1.length === 0 || tokens2.length === 0) return; // Skip if no meaningful words

            // Create unique word set
            const uniqueWords = new Set([...tokens1, ...tokens2]);
            const vec1 = Array.from(uniqueWords).map(w => tokens1.filter(t => t === w).length);
            const vec2 = Array.from(uniqueWords).map(w => tokens2.filter(t => t === w).length);

            const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
            const mag1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
            const mag2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));

            const similarity = (mag1 && mag2) ? (dotProduct / (mag1 * mag2)) : 0;

            // --- AI DEBUGGING PICTURE ---
            console.log("\n╔════════════ SEMANTIC MATCHING ENGINE ════════════╗");
            console.log("║ STEP 1: TOKENIZATION & CLEANING");
            console.log(`║ New:  [${tokens1.join(", ")}]`);
            console.log(`║ Target: [${tokens2.join(", ")}]`);
            console.log("║");
            console.log("║ STEP 2: VOCABULARY MAPPING (Bag of Words)");
            console.log(`║ Shared Vocab: [${Array.from(uniqueWords).join(", ")}]`);
            console.log(`║ Vector A:     [${vec1.join(",")}]`);
            console.log(`║ Vector B:     [${vec2.join(",")}]`);
            console.log("║");
            console.log("║ STEP 3: COSINE SIMILARITY MATH");
            console.log(`║ Dot Product: ${dotProduct} | MagA: ${mag1.toFixed(2)} | MagB: ${mag2.toFixed(2)}`);
            console.log(`║ FINAL SCORE: ${(similarity * 100).toFixed(1)}%`);
            console.log("║");
            if (similarity > 0.4) {
                console.log("║ 🟢 MATCH FOUND! (Threshold > 40%)");
                potentialMatches.push(item);
            } else {
                console.log("║ 🔴 NO MATCH (Below Threshold)");
            }
            console.log("╚══════════════════════════════════════════════════╝\n");
        });

        // Create Notifications
        if (potentialMatches.length > 0) {
            if (type === "found") {
                // Notify the owners of the LOST items found
                // We should NOT notify if the finder is the same person who lost it (rare but possible test case)
                for (const match of potentialMatches) {
                    if (match.reportedBy !== reportedBy) {
                        await Notification.create({
                            userId: match.reportedBy, // Owner of the lost item
                            message: `Potential match found! A similar item ("${description}") was just reported found.`,
                            matchedItemId: newItem._id, // The newly found item
                        });
                    }
                }
            } else if (type === "lost") {
                // Notify the reportedBy (Current User) about existing FOUND items
                for (const match of potentialMatches) {
                    await Notification.create({
                        userId: reportedBy, // Current user who lost the item
                        message: `Potential match found! An item ("${match.description}") was previously reported found.`,
                        matchedItemId: match._id, // The existing found item
                    });
                }
            }
        }

        res.status(201).json({ message: "Item reported successfully", item: newItem, matches: potentialMatches.length });
    } catch (error) {
        console.error("Error reporting item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: "User ID required" });

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await LostFoundItem.findById(id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(item);
    } catch (error) {
        console.error("Error fetching item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const resolveItem = async (req, res) => {
    try {
        const { itemId, finderId } = req.body;

        // 1. Find the item
        const item = await LostFoundItem.findById(itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        // 2. Mark item as closed
        item.status = "closed";
        await item.save();

        // 3. Award points to the finder
        // We need to import the User model first. 
        // Note: Assuming 'User' model is in ../../models/User.js based on previous context, 
        // but wait, commonly it's ../models/User.js if in same folder structure.
        // Let's check imports. Existing imports are from "../models/..."
        // So User should be "../models/User.js"

        // Dynamic import or ensure it is imported at top. 
        // I will add the import at the top in a separate edit or just use mongoose.model('User') if registered.
        // Safer to import.

        const User = (await import("../../models/User.js")).default;
        const Message = (await import("../models/Message.js")).default;

        await User.findOneAndUpdate(
            { rollNo: finderId },
            { $inc: { recognitionPoints: 25 } }
        );

        // 4. Delete messages related to this item
        await Message.deleteMany({ itemId });

        res.status(200).json({ message: "Item resolved, points awarded, and chat history cleared." });

    } catch (error) {
        console.error("Error resolving item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
