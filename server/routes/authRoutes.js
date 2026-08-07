const express = require("express")

const router = express.Router()

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

const {
  register,
  login,
  getMe,
} = require("../controllers/authController")

router.post("/login", login)
router.post("/register", authMiddleware, roleMiddleware("Administrator"), register)
router.get("/me", authMiddleware, getMe)

module.exports = router
