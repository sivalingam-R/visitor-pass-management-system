const express = require("express")

const router = express.Router()

const {
  createVisitor,
  approveVisitor,
  rejectVisitor,
  checkInVisitor,
  checkOutVisitor,
  searchVisitors,
  getVisitorReports,
} = require("../controllers/visitorController")

router.post("/", createVisitor)
router.put("/:id/approve", approveVisitor)
router.put("/:id/reject", rejectVisitor)
router.put("/:id/checkin", checkInVisitor)

router.put("/:id/checkout", checkOutVisitor)
router.get("/search", searchVisitors)
router.get("/reports", getVisitorReports)

module.exports = router