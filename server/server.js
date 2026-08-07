const express = require("express")   // import express package
const cors = require("cors")          
require("dotenv").config()

const connectDB = require("./config/db")

const authRoutes = require("./routes/authRoutes")
const visitorRoutes = require("./routes/visitorRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")

const app = express()

connectDB()
app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/visitors", visitorRoutes)
app.use("/api/dashboard", dashboardRoutes)

app.get("/", (req, res) => {       // API creation
  res.send("Server is running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {           // Run server on port 5000
  console.log(`Server running on port ${PORT}`)
})