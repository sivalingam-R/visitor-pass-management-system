const Visitor = require("../models/Visitor")
const User = require("../models/User")
const ActivityLog = require("../models/ActivityLog")

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

    await ActivityLog.create({
     visitorId: visitor._id,
     action: "Created",
    })

    res.status(201).json(visitor);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const approveVisitor = async (req, res) => {
  try {
    const { id } = req.params

    const visitor = await Visitor.findById(id)

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found",
      })
    }

    if (visitor.status !== "Pending") {
      return res.status(400).json({
        message: "Visitor cannot be approved",
      })
    }

    visitor.status = "Approved"

    await visitor.save()

    await ActivityLog.create({
       visitorId: visitor._id,
       action: "Approved",
      })

    res.status(200).json(visitor)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

const rejectVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found",
      });
    }

    if (visitor.status !== "Pending") {
      return res.status(400).json({
        message: "Visitor cannot be rejected",
      });
    }

    visitor.status = "Rejected";

    await visitor.save();

    await ActivityLog.create({
       visitorId: visitor._id,
       action: "Rejected",
      })

    res.status(200).json(visitor);
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

    await ActivityLog.create({
       visitorId: visitor._id,
       action: "CheckedIn",
      })

    res.status(200).json(visitor);
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

    await ActivityLog.create({
       visitorId: visitor._id,
       action: "CheckedOut",
    })
    res.status(200).json(visitor);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const searchVisitors = async (req, res) => {
  try {
    const { visitorName, status, visitDate } = req.query

    const filter = {}

    if (visitorName) {
      filter.visitorName = {
        $regex: visitorName,
        $options: "i",
      }
    }

    if (status) {
      filter.status = status
    }

    if (visitDate) {
      filter.visitDate = new Date(visitDate)
    }

    const visitors = await Visitor.find(filter)

    res.status(200).json(visitors)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

const getVisitorReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = {};

    if (startDate && endDate) {
      filter.visitDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const visitors = await Visitor.find(filter);

    res.status(200).json({
      totalVisitors: visitors.length,
      visitors,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createVisitor,
  approveVisitor,
  rejectVisitor,
  getVisitorReports,
  searchVisitors,
  checkInVisitor,
  checkOutVisitor,
}