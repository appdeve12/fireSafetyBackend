const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const supportController = require("../controllers/supportController")

// Create new support ticket
router.post("/create", authMiddleware, supportController.createTicket)
// View all my tickets
// router.get("/my-tickets", authMiddleware, supportController.getMyTickets)
// // View specific ticket by ID
// router.get("/ticket/:ticketId", authMiddleware, supportController.getTicketById)
// // Reply to ticket
// router.post("/ticket/:ticketId/reply", authMiddleware, supportController.replyToTicket)
// // Close ticket
// router.put("/ticket/:ticketId/close", authMiddleware, supportController.closeTicket)


// //admin side
// // View all tickets (with optional filters)

// router.get("/api/admin/support/all-tickets?status=open&priority=high", authMiddleware, supportController.getAllTickets)


// // View ticket by ID
    
// // router.get("/api/admin/support/ticket/:ticketId", authMiddleware, supportController.getTicketById)
// // // Reply to ticket
// // router.post("/api/admin/support/ticket/:ticketId/reply", authMiddleware, supportController.replyToTicketAdmin)


// // Assign admin to ticket
// router.put("/api/admin/support/ticket/:ticketId/assign/:adminId", authMiddleware, supportController.assignTicketToAdmin)


// // Update ticket status
// // PUT     /api/admin/support/ticket/:ticketId/status   // body: { status: 'in_progress' | 'resolved' | 'closed' }
// router.put(" /api/admin/support/ticket/:ticketId/status", authMiddleware, supportController.updateTicketStatus)
// // Download attachments (URLs usually served via CDN / S3)
// router.get("/api/admin/support/ticket/:ticketId/download/:filename", authMiddleware, supportController.downloadAttachment)
module.exports = router;

