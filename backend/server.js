const express = require("express");
const cors = require("cors");
const { jsPDF } = require('jspdf');

const cron = require('node-cron');
const sendReminders = require('./sendReminders');

// Schedule to run daily at 7:00 AM server time
cron.schedule('0 7 * * *', () => {
  console.log('Running daily reminder job...');
  sendReminders();
});

const cookieparser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const eventRoutes = require("./routes/eventRoutes");
const actionRoutes = require("./routes/actionRoutes");
const receptionRoutes = require("./routes/receptionRoutes");
const sendedRoutes = require("./routes/sendedRoutes");
const attachmentRoutes = require("./routes/attachmentRoutes");
const documentRoutes = require("./routes/documentRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const exportsRoutes = require("./routes/exportsRoutes");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieparser());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/events", eventRoutes);
app.use("/actions", actionRoutes);
app.use("/receptions", receptionRoutes);
app.use("/sended", sendedRoutes);
app.use("/attachments", attachmentRoutes);
app.use("/documents", documentRoutes);
app.use("/calendar", calendarRoutes);
app.use("/exports", exportsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});