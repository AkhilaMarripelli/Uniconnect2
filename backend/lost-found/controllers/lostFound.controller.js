import LostFoundItem from "../models/LostFoundItem.js";
import { findMatches } from "../services/matching.service.js";

/**
 * Create Lost / Found Item
 */
export const createItem = async (req, res) => {
  try {
    const {
      itemName,
      description,
      category,
      location,
      date,
      imageUrl,
      type,
    } = req.body;
    console.log("USER:", req.user);

    if (!itemName || !description || !category || !location || !date || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const item = await LostFoundItem.create({
      itemName,
      description,
      category,
      location,
      date,
      imageUrl,
      type,
      reportedBy: req.user.id,
    });

    // 🔹 Auto-match (optional, safe)
    const matches = await findMatches(item);

    res.status(201).json({
      item,
      matches,
    });
  } catch (err) {
    console.error("Create item error:", err);
    res.status(500).json({ message: "Failed to create item" });
  }
};

/**
 * Get all OPEN items
 */
export const getItems = async (req, res) => {
  try {
    const items = await LostFoundItem.find({ status: "OPEN" })
      .populate("reportedBy", "rollNo")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
};

/**
 * Get single item
 */
export const getItemById = async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id)
      .populate("reportedBy", "rollNo");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch item" });
  }
};
