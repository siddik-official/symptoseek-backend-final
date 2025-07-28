const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require('../models/user');
const Appointment = require('../models/appointments');
const Doctor = require('../models/doctors');
const authMiddleware = require("../middleware/authMiddleware");
const { sendEmail, sendAppointmentConfirmation, sendAppointmentApproval } = require('../services/emailService');

// router.post('/test', (req, res) => {
//     res.json({ message: "Test route works!" });
//   });

router.get('/time', (req, res) => {
    res.json({ serverTime: new Date() });
  });


router.post('/', authMiddleware, async (req, res) => {
    const { doctors_id, date, reason, appointmentType } = req.body;

    // Basic validation
    if (!doctors_id || !date) {
        return res.status(400).json({ message: "Doctor ID and date are required" });
    }
  
    // Check if date is in the future
    if (new Date(date) < new Date()) {
        return res.status(400).json({ message: "Appointment date must be in the future" });
    }
  
    try {
        // Get user and doctor details for emails
        const user = await User.findById(req.user.id);
        const doctor = await Doctor.findById(doctors_id);

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Check for existing approved appointments at the same time
        const existingAppointment = await Appointment.findOne({
            doctors_id,
            date,
            status: 'Approved'
        });
  
        if (existingAppointment) {
            return res.status(400).json({ message: "Doctor already has an approved appointment at this time" });
        }
  
        const appointment = new Appointment({
            doctors_id,
            userId: req.user.id,
            date,
            reason: reason || "General consultation",
            status: 'Pending',
            appointmentType: appointmentType || 'consultation'
        });
  
        const savedAppointment = await appointment.save();
        
        // Populate doctor details for response
        const populatedAppointment = await Appointment.findById(savedAppointment._id)
            .populate({
                path: 'doctors_id',
                select: 'name speciality address number visiting_hours degree hospital_name image_source',
                model: 'Doctor'
            })
            .populate({
                path: 'userId',
                select: 'name email phone',
                model: 'User'
            });

        // Send confirmation email to user using the new function
        try {
            const appointmentDate = new Date(date);
            await sendAppointmentConfirmation(user.email, {
                user,
                doctor,
                appointment: savedAppointment,
                appointmentDate
            });
            console.log('Confirmation email sent successfully to user');
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the appointment booking if email fails
        }

        // Send notification to admin about new appointment request
        try {
            const adminUsers = await User.find({ role: 'admin' });
            const appointmentDate = new Date(date);

            for (const admin of adminUsers) {
                const adminEmailSubject = `New Appointment Request - SymptoSeek Admin`;
                const adminEmailBody = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                            <h1 style="color: white; margin: 0;">SymptoSeek Admin</h1>
                            <p style="color: white; margin: 5px 0;">New Appointment Request</p>
                        </div>
                        
                        <div style="padding: 30px; background: #f9f9f9;">
                            <h2 style="color: #333; margin-bottom: 20px;">New Appointment Request Requires Your Attention</h2>
                            
                            <p>Dear Admin,</p>
                            
                            <p>A new appointment request has been submitted and requires your approval.</p>
                            
                            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                <h3 style="color: #667eea; margin-top: 0;">Appointment Details:</h3>
                                <p><strong>Patient:</strong> ${user.name}</p>
                                <p><strong>Email:</strong> ${user.email}</p>
                                <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
                                <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
                                <p><strong>Speciality:</strong> ${doctor.speciality}</p>
                                <p><strong>Date:</strong> ${appointmentDate.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</p>
                                <p><strong>Time:</strong> ${appointmentDate.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                })}</p>
                                <p><strong>Type:</strong> ${appointmentType || 'Consultation'}</p>
                                <p><strong>Reason:</strong> ${reason || 'General consultation'}</p>
                                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/appointments" 
                                   style="background: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">
                                    Manage Appointments
                                </a>
                            </div>
                        </div>
                        
                        <div style="background: #333; color: white; padding: 20px; text-align: center;">
                            <p style="margin: 0;">© 2024 SymptoSeek Admin Panel. All rights reserved.</p>
                        </div>
                    </div>
                `;

                await sendEmail(admin.email, adminEmailSubject, adminEmailBody);
            }
            console.log('Admin notification emails sent successfully');
        } catch (emailError) {
            console.error('Failed to send admin notification emails:', emailError);
            // Don't fail the appointment booking if email fails
        }

        res.status(201).json({
            success: true,
            message: "Appointment request submitted successfully! You will receive a confirmation email shortly.",
            appointment: populatedAppointment
        });

    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error while creating appointment"
        });
    }
});
// Get all appointments for the authenticated user
router.get('/my-appointments', authMiddleware, async (req, res) => {
    try {
        const appointments = await Appointment.find({ userId: req.user.id })
            .populate({
                path: 'doctors_id',
                select: 'name speciality address number visiting_hours degree hospital_name',
                model: 'Doctor'
            })
            .populate({
                path: 'adminId',
                select: 'name email',
                model: 'User'
            })
            .sort({ createdAt: -1 }); // Sort by creation date descending

        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Cancel appointment (only by user who created it)
router.patch('/:appointmentId/cancel', authMiddleware, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { reason } = req.body;
        
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            userId: req.user.id
        });
        
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found or you don't have permission to cancel it" });
        }
        
        // Check if appointment can be cancelled
        if (appointment.status === 'Cancelled') {
            return res.status(400).json({ message: "Appointment is already cancelled" });
        }
        
        if (appointment.status === 'Completed') {
            return res.status(400).json({ message: "Cannot cancel a completed appointment" });
        }
        
        // Update appointment status
        appointment.status = 'Cancelled';
        appointment.cancelledAt = new Date();
        appointment.adminNote = reason || "Cancelled by user";
        
        await appointment.save();
        
        const updatedAppointment = await Appointment.findById(appointmentId)
            .populate({
                path: 'doctors_id',
                select: 'name speciality address number visiting_hours degree hospital_name',
                model: 'Doctor'
            });
        
        res.json({
            message: "Appointment cancelled successfully",
            appointment: updatedAppointment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;