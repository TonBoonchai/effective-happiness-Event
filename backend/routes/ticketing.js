const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ticketingController = require('../controllers/ticketing');


/**
 * @swagger
 * /ticketing:
 *   post:
 *     summary: Create ticketing request (member only)
 *     tags: [Ticketing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               ticketAmount:
 *                 type: integer
 *             required:
 *               - event
 *               - ticketAmount
 *     responses:
 *       201:
 *         description: Ticketing request created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get ticketing requests (admin can view all requests, member can only view their own)
 *     description: For admin users - Returns all ticketing requests in the system. For member users - Returns only their own ticketing requests.
 *     tags: [Ticketing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ticketing requests. For admin users - all requests. For member users - only their own requests.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of ticketing requests
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticketing'
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - _id: "5f7b5e3c3b5e8c1f4c9b4b1c"
 *                   user: "5f7b5e3c3b5e8c1f4c9b4b1d"
 *                   event:
 *                     _id: "5f7b5e3c3b5e8c1f4c9b4b1a"
 *                     name: "Tech Conference 2025"
 *                     description: "Annual technology conference"
 *                     eventDate: "2025-12-01"
 *                     venue: "Convention Center"
 *                     availableTicket: 495
 *                   ticketAmount: 2
 *                   createdAt: "2025-09-01T10:00:00.000Z"
 *                   updatedAt: "2025-09-01T10:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
router.post('/', protect, authorize('member'), ticketingController.createTicketing);
router.get('/', protect, ticketingController.getTicketings);

/**
 * @swagger
 * /ticketing/{id}:
 *   get:
 *     summary: Get a ticketing request by ID (admin can view any request, member can only view their own)
 *     description: For admin users - Can view any ticketing request in the system. For member users - Can only view their own ticketing requests.
 *     tags: [Ticketing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ticketing request to view. Admin can view any valid ticket ID, members can only view IDs of their own tickets.
 *     responses:
 *       200:
 *         description: Returns the ticketing request details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "5f7b5e3c3b5e8c1f4c9b4b1c"
 *                     user:
 *                       type: object
 *                       description: Only included for admin users
 *                     event:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         eventDate:
 *                           type: string
 *                         venue:
 *                           type: string
 *                         availableTicket:
 *                           type: number
 *                     ticketAmount:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       401:
 *         description: Unauthorized - User not logged in or invalid token
 *       404:
 *         description: Ticketing request not found
 *       500:
 *         description: Server Error
 *
 */
router.get('/:id', protect, ticketingController.getTicketing);

/**
 * @swagger
 * /ticketing/{id}:
 *   put:
 *     summary: Update ticketing request (admin can update any request, member can only update their own)
 *     description: For admin users - Can update any ticketing request in the system. For member users - Can only update their own ticketing requests.
 *     tags: [Ticketing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ticketing request to update. Admin can use any valid ticket ID, members can only use IDs of their own tickets.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketAmount:
 *                 type: integer
 *                 description: Number of tickets. For members, total tickets per event cannot exceed 5.
 *             required:
 *               - ticketAmount
 *     responses:
 *       200:
 *         description: Ticketing request updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Ticketing'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticketing request not found
 *       500:
 *         description: Server Error
 *   delete:
 *     summary: Delete ticketing request (admin can delete any request, member can only delete their own)
 *     description: For admin users - Can delete any ticketing request in the system. For member users - Can only delete their own ticketing requests.
 *     tags: [Ticketing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ticketing request to delete. Admin can use any valid ticket ID, members can only use IDs of their own tickets.
 *     responses:
 *       200:
 *         description: Ticketing request deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Ticketing request deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticketing request not found
 *       500:
 *         description: Server Error
 */
router.put('/:id', protect, ticketingController.updateTicketing);
router.delete('/:id', protect, ticketingController.deleteTicketing);

module.exports = router;
