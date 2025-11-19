const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const eventsController = require('../controllers/events');

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get list of all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: A list of events with count
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
 *                   description: Total number of events
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - _id: "5f7b5e3c3b5e8c1f4c9b4b1a"
 *                   name: "Tech Conference 2025"
 *                   description: "Annual technology conference featuring the latest innovations"
 *                   eventDate: "2025-12-01"
 *                   venue: "Convention Center"
 *                   organizer: "Tech Events Inc."
 *                   availableTicket: 500
 *                   posterPicture: "https://example.com/tech-conf-2025.jpg"
 *                   createdAt: "2025-09-01T10:00:00.000Z"
 *                   updatedAt: "2025-09-01T10:00:00.000Z"
 *                 - _id: "5f7b5e3c3b5e8c1f4c9b4b1b"
 *                   name: "Music Festival 2025"
 *                   description: "Three-day music festival with top artists"
 *                   eventDate: "2025-10-15"
 *                   venue: "City Park"
 *                   organizer: "Music Events LLC"
 *                   availableTicket: 1000
 *                   posterPicture: "https://example.com/music-fest-2025.jpg"
 *                   createdAt: "2025-09-02T09:30:00.000Z"
 *                   updatedAt: "2025-09-02T09:30:00.000Z"
 *   post:
 *     summary: Create event (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - eventDate
 *               - venue
 *               - organizer
 *               - availableTicket
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               eventDate:
 *                 type: string
 *                 format: date
 *               venue:
 *                 type: string
 *               organizer:
 *                 type: string
 *               availableTicket:
 *                 type: integer
 *                 minimum: 0
 *               posterPicture:
 *                 type: string
 *           example:
 *             name: "Tech Conference 2025"
 *             description: "Annual technology conference featuring the latest innovations"
 *             eventDate: "2025-12-01"
 *             venue: "Convention Center"
 *             organizer: "Tech Events Inc."
 *             availableTicket: 500
 *             posterPicture: "https://example.com/tech-conf-2025.jpg"
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *             example:
 *               success: true
 *               data:
 *                 _id: "5f7b5e3c3b5e8c1f4c9b4b1a"
 *                 name: "Tech Conference 2025"
 *                 description: "Annual technology conference featuring the latest innovations"
 *                 eventDate: "2025-12-01"
 *                 venue: "Convention Center"
 *                 organizer: "Tech Events Inc."
 *                 availableTicket: 500
 *                 posterPicture: "https://example.com/tech-conf-2025.jpg"
 *                 createdAt: "2025-09-01T10:00:00.000Z"
 *                 updatedAt: "2025-09-01T10:00:00.000Z"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/', eventsController.getEvents);
router.post('/', protect, authorize('admin'), eventsController.createEvent);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *             example:
 *               success: true
 *               data:
 *                 _id: "5f7b5e3c3b5e8c1f4c9b4b1a"
 *                 name: "Tech Conference 2025"
 *                 description: "Annual technology conference featuring the latest innovations"
 *                 eventDate: "2025-12-01"
 *                 venue: "Convention Center"
 *                 organizer: "Tech Events Inc."
 *                 availableTicket: 500
 *                 posterPicture: "https://example.com/tech-conf-2025.jpg"
 *                 createdAt: "2025-09-01T10:00:00.000Z"
 *                 updatedAt: "2025-09-01T10:00:00.000Z"
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *             example:
 *               success: false
 *               message: "Event not found"
 *   put:
 *     summary: Update event (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 *   delete:
 *     summary: Delete event (admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.get('/:id', eventsController.getEvent);
router.put('/:id', protect, authorize('admin'), eventsController.updateEvent);
router.delete('/:id', protect, authorize('admin'), eventsController.deleteEvent);


/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - name
 *         - eventDate
 *         - venue
 *         - organizer
 *         - availableTicket
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *           readOnly: true
 *         name:
 *           type: string
 *           description: Name of the event
 *         description:
 *           type: string
 *           description: Detailed description of the event
 *         eventDate:
 *           type: string
 *           format: date
 *           description: Date when the event will take place (YYYY-MM-DD)
 *         venue:
 *           type: string
 *           description: Location where the event will be held
 *         organizer:
 *           type: string
 *           description: Name of the event organizer
 *         availableTicket:
 *           type: integer
 *           description: Number of tickets available for the event
 *           minimum: 0
 *         posterPicture:
 *           type: string
 *           description: URL of the event poster image
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the event was created
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the event was last updated
 *           readOnly: true
 *     Ticketing:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         event:
 *           $ref: '#/components/schemas/Event'
 *         ticketAmount:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
module.exports = router;
