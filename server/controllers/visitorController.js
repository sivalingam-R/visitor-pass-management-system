const Visitor = require("../models/Visitor")
const User = require("../models/User")
const ActivityLog = require("../models/ActivityLog")

const logActivity = async (visitorId, action, performedBy) => {
  await ActivityLog.create({
    visitorId,
    action,
    performedBy,
  })
}

const createVisitor = async (req, res) => {
  try {
    const {
      visitorName,
      phoneNumber,
      address,
      purpose,
      employeeId,
      visitDate,
      expectedArrivalTime,
    } = req.body;

    const activeVisitor = await Visitor.findOne({
      phoneNumber,
      status: {
        $in: ["Pending", "Approved", "CheckedIn"],
      },
    });

    if (activeVisitor) {
      return res.status(400).json({
        message: "Visitor already has an active request",
      });
    }

    const duplicateVisitor = await Visitor.findOne({
      phoneNumber,
      visitDate,
    });

    if (duplicateVisitor) {
      return res.status(400).json({
        message: "Duplicate visitor entry is not allowed",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(visitDate);

    if (selectedDate < today) {
      return res.status(400).json({
        message: "Past dates are not allowed",
      });
    }

    const pendingRequests = await Visitor.countDocuments({
      employeeId,
      status: "Pending",
    });

    if (pendingRequests >= 3) {
      return res.status(400).json({
        message: "Maximum pending requests reached",
      });
    }

    const visitor = await Visitor.create({
      visitorName,
      phoneNumber,
      address,
      purpose,
      employeeId,
      visitDate,
      expectedArrivalTime,
    });

    await logActivity(visitor._id, "Created", req.user.id);

    const populated = await Visitor.findById(visitor._id).populate("employeeId", "name email");
    res.status(201).json(populated);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({ status: { $ne: "Cancelled" } })
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const visitors = await Visitor.find({ employeeId: req.user.id })
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found",
      });
    }

    if (visitor.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (visitor.status !== "Pending") {
      return res.status(400).json({
        message: "Visitor cannot be approved",
      });
    }

    visitor.status = "Approved";
    if (remarks) visitor.remarks = remarks;

    await visitor.save();
    await logActivity(visitor._id, "Approved", req.user.id);

    const populated = await Visitor.findById(visitor._id).populate("employeeId", "name email");
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const rejectVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found",
      });
    }

    if (visitor.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (visitor.status !== "Pending") {
      return res.status(400).json({
        message: "Visitor cannot be rejected",
      });
    }

    visitor.status = "Rejected";
    if (remarks) visitor.remarks = remarks;

    await visitor.save();
    await logActivity(visitor._id, "Rejected", req.user.id);

    const populated = await Visitor.findById(visitor._id).populate("employeeId", "name email");
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const checkInVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found",
      });
    }

    if (visitor.status === "Rejected") {
      return res.status(400).json({
        message: "Rejected visitors cannot check in",
      });
    }

    if (visitor.status !== "Approved") {
      return res.status(400).json({
        message: "Visitor is not approved",
      });
    }

    visitor.status = "CheckedIn";
    visitor.checkInTime = new Date();

    await visitor.save();
    await logActivity(visitor._id, "CheckedIn", req.user.id);

    const populated = await Visitor.findById(visitor._id).populate("employeeId", "name email");
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const checkOutVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found",
      });
    }

    if (visitor.status !== "CheckedIn") {
      return res.status(400).json({
        message: "Visitor is not checked in",
      });
    }

    visitor.status = "CheckedOut";
    visitor.checkOutTime = new Date();

    await visitor.save();
    await logActivity(visitor._id, "CheckedOut", req.user.id);

    const populated = await Visitor.findById(visitor._id).populate("employeeId", "name email");
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const cancelVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    if (visitor.status === "CheckedOut") {
      return res.status(400).json({ message: "Checked out visits cannot be cancelled" });
    }

    if (visitor.status === "Cancelled") {
      return res.status(400).json({ message: "Visit is already cancelled" });
    }

    visitor.status = "Cancelled";
    await visitor.save();
    await logActivity(visitor._id, "Cancelled", req.user.id);

    const populated = await Visitor.findById(visitor._id).populate("employeeId", "name email");
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchVisitors = async (req, res) => {
  try {
    const { visitorName, employeeId, status, visitDate } = req.query;

    const filter = { status: { $ne: "Cancelled" } };

    if (visitorName) {
      filter.visitorName = {
        $regex: visitorName,
        $options: "i",
      };
    }

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (status) {
      filter.status = status;
    }

    if (visitDate) {
      const start = new Date(visitDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(visitDate);
      end.setHours(23, 59, 59, 999);
      filter.visitDate = { $gte: start, $lte: end };
    }

    const visitors = await Visitor.find(filter)
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getVisitorReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.visitDate = {
        $gte: start,
        $lte: end,
      };
    }

    const visitors = await Visitor.find(filter)
      .populate("employeeId", "name email")
      .sort({ visitDate: -1 });

    const countByStatus = (s) => visitors.filter((v) => v.status === s).length;

    res.status(200).json({
      totalVisitors: visitors.length,
      pending: countByStatus("Pending"),
      approved: countByStatus("Approved"),
      rejected: countByStatus("Rejected"),
      checkedIn: countByStatus("CheckedIn"),
      checkedOut: countByStatus("CheckedOut"),
      cancelled: countByStatus("Cancelled"),
      visitors,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getVisitorActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ visitorId: req.params.id })
      .populate("performedBy", "name email role")
      .sort({ timestamp: 1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVisitor,
  getAllVisitors,
  getMyRequests,
  approveVisitor,
  rejectVisitor,
  getVisitorReports,
  searchVisitors,
  checkInVisitor,
  checkOutVisitor,
  cancelVisitor,
  getVisitorActivity,
};
