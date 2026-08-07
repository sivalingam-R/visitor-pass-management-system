const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  getUsers,
  getEmployees,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/employees", authMiddleware, getEmployees);
router.get("/", authMiddleware, roleMiddleware("Administrator"), getUsers);
router.post("/", authMiddleware, roleMiddleware("Administrator"), createUser);
router.put("/:id", authMiddleware, roleMiddleware("Administrator"), updateUser);
router.delete("/:id", authMiddleware, roleMiddleware("Administrator"), deleteUser);

module.exports = router;
