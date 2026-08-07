const express = require("express")

const router = express.Router()

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

const {
  createVisitor,
  getAllVisitors,
  getMyRequests,
  approveVisitor,
  rejectVisitor,
  checkInVisitor,
  checkOutVisitor,
  cancelVisitor,
  searchVisitors,
  getVisitorReports,
  getVisitorActivity,
} = require("../controllers/visitorController")

router.use(authMiddleware)

router.get("/search", searchVisitors)
router.get("/reports", roleMiddleware("Administrator"), getVisitorReports)
router.get("/my-requests", roleMiddleware("Employee"), getMyRequests)
router.get("/", getAllVisitors)

router.post("/", roleMiddleware("Receptionist"), createVisitor)

router.put("/:id/approve", roleMiddleware("Employee"), approveVisitor)
router.put("/:id/reject", roleMiddleware("Employee"), rejectVisitor)
router.put("/:id/checkin", roleMiddleware("Receptionist"), checkInVisitor)
router.put("/:id/checkout", roleMiddleware("Receptionist"), checkOutVisitor)
router.put(
  "/:id/cancel",
  roleMiddleware("Receptionist", "Administrator"),
  cancelVisitor,
)

router.get("/:id/activity", getVisitorActivity)

module.exports = router
