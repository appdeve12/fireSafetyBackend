const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const supportController = require("../controllers/supportController");
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
};
// ===== SELLER ROUTES =====
router.post('/create', authMiddleware, supportController.createTicket);
router.get('/my-tickets', authMiddleware, supportController.getMyTickets);
// router.get('/tickets/:ticketId', authMiddleware, supportController.getTicketById);
// router.post('/tickets/reply/:ticketId', authMiddleware, supportController.replyToTicket);
// router.post('/tickets/feedback/:ticketId', authMiddleware, supportController.submitFeedback);

// // ===== ADMIN ROUTES =====

// // Get all tickets (admin panel with filters)
// router.get('/admin/all', authMiddleware, isAdmin, supportController.getAllTickets);

// // Get ticket by ID (with full info)
// router.get('/admin/:ticketId', authMiddleware, isAdmin, supportController.getTicketByIdAdmin);

// // Reply to a ticket
// router.post('/admin/reply/:ticketId', authMiddleware, isAdmin, supportController.replyToTicketAdmin);

// // Assign ticket to an admin
// router.post('/admin/assign/:ticketId/:adminId', authMiddleware, isAdmin, supportController.assignTicketToAdmin);

// // Update ticket status
// router.patch('/admin/status/:ticketId', authMiddleware, isAdmin, supportController.updateTicketStatus);

// // Close a ticket
// router.patch('/admin/close/:ticketId', authMiddleware, isAdmin, supportController.closeTicket);

// // View feedback
// router.get('/admin/feedback/:ticketId', authMiddleware, isAdmin, supportController.getFeedback);



module.exports = router;
