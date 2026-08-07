const Visitor = require("../models/Visitor")
const User = require("../models/User")

const getTodayRange = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return { today, tomorrow }
}

const getDashboardData = async (req, res) => {
  try {
    const { today, tomorrow } = getTodayRange()
    const role = req.user.role

    if (role === "Administrator") {
      const totalEmployees = await User.countDocuments({ role: "Employee" })
      const totalVisitors = await Visitor.countDocuments()
      const pendingVisitors = await Visitor.countDocuments({ status: "Pending" })
      const checkedInVisitors = await Visitor.countDocuments({ status: "CheckedIn" })
      const todaysVisitors = await Visitor.countDocuments({
        visitDate: { $gte: today, $lt: tomorrow },
      })

      return res.status(200).json({
        totalEmployees,
        totalVisitors,
        pendingVisitors,
        checkedInVisitors,
        todaysVisitors,
      })
    }

    if (role === "Receptionist") {
      const todaysVisitors = await Visitor.countDocuments({
        visitDate: { $gte: today, $lt: tomorrow },
      })
      const checkedInVisitors = await Visitor.countDocuments({ status: "CheckedIn" })
      const approvedWaitingCheckIn = await Visitor.countDocuments({ status: "Approved" })
      const scheduledVisitors = await Visitor.countDocuments({
        visitDate: { $gte: today },
        status: { $in: ["Pending", "Approved"] },
      })

      return res.status(200).json({
        todaysVisitors,
        checkedInVisitors,
        approvedWaitingCheckIn,
        scheduledVisitors,
      })
    }

    if (role === "Employee") {
      const employeeId = req.user.id
      const pendingRequests = await Visitor.countDocuments({
        employeeId,
        status: "Pending",
      })
      const approvedToday = await Visitor.countDocuments({
        employeeId,
        status: "Approved",
        updatedAt: { $gte: today, $lt: tomorrow },
      })
      const totalHandled = await Visitor.countDocuments({
        employeeId,
        status: { $in: ["Approved", "Rejected", "CheckedIn", "CheckedOut"] },
      })

      return res.status(200).json({
        pendingRequests,
        approvedToday,
        totalHandled,
      })
    }

    res.status(403).json({ message: "Access denied" })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

module.exports = {
  getDashboardData,
}
