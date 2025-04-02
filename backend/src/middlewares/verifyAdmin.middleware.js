
import Group from "../models/group.model.js"; // Assuming you have a Group model

const verifyAdmin = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?._id;

    if (!groupId || !userId) {
      return res.status(400).json({ message: "Group ID and User ID are required." });
    }

    // Find the group and check if the user is an admin
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }


    const isAdmin = group.members.some(
      (member) => member.userId.toString() === userId.toString() && member.role === "admin"
    );

    if (!isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next(); // User is an admin, proceed to the next middleware/controller
  } catch (error) {
    console.error("Error in verifyAdmin middleware:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default verifyAdmin;
