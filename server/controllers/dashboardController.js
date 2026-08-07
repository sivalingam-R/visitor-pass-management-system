const Visitor = require("../models/Visitor")
const User = require("../models/User") 

const getDashboardData = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({
      role: "Employee",
    })

    const totalVisitors = await Visitor.countDocuments()

    const pendingVisitors = await Visitor.countDocuments({
      status: "Pending",
    })

    const checkedInVisitors = await Visitor.countDocuments({
      status: "CheckedIn",
    })

    const today = new Date()

    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)

    tomorrow.setDate(tomorrow.getDate() + 1)

    const todaysVisitors = await Visitor.countDocuments({
      visitDate: {
        $gte: today,
        $lt: tomorrow,
      },
    })

    res.status(200).json({
      totalEmployees,
      totalVisitors,
      pendingVisitors,
      checkedInVisitors,
      todaysVisitors,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

module.exports = {
  getDashboardData,
}