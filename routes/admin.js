// routes/admin.js

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Doctor = require('../models/doctors'); // Assuming this is your doctor model
const Appointment = require('../models/appointments'); // Add appointment model
const Report = require('../models/reports'); // Add reports model
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail, sendAppointmentApproval } = require('../services/emailService');

// --- ADMIN AUTH ROUTES (NO MIDDLEWARE) ---

// POST /api/admin/login - Admin login
router.post('/login', async (req, res) => {
    console.log('Admin Login route hit!'); // Debug log
    const { email, password } = req.body;

    try {
        // Find admin user
        const admin = await User.findOne({ email, role: 'admin' });
        
        if (!admin) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Create JWT token
        const payload = {
            userId: admin._id,
            role: admin.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Admin login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// POST /api/admin/create-admin - Create first admin (for setup)
router.post('/create-admin', async (req, res) => {
    try {
        // Check if any admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const { name, email, password } = req.body;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user
        const admin = new User({
            name: name || 'Admin',
            email: email || 'admin@symptoseek.com',
            password: hashedPassword,
            role: 'admin',
            isVerified: true
        });

        await admin.save();

        res.json({
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// --- PROTECTED ADMIN ROUTES (WITH MIDDLEWARE) ---

// Apply both authMiddleware and adminMiddleware to all routes below this point
router.use(authMiddleware, adminMiddleware);

// --- DASHBOARD ---
// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const doctorCount = await Doctor.countDocuments();
        const appointmentCount = await Appointment.countDocuments();
        
        // Get appointment statistics
        const appointmentStats = await Appointment.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Format appointment stats for easier consumption
        const appointmentStatusCounts = {
            pending: 0,
            approved: 0,
            rejected: 0,
            cancelled: 0,
            completed: 0
        };
        
        appointmentStats.forEach(stat => {
            if (stat._id) {
                appointmentStatusCounts[stat._id.toLowerCase()] = stat.count;
            }
        });
        
        res.json({
            users: userCount,
            doctors: doctorCount,
            appointments: appointmentCount,
            appointmentStatusBreakdown: appointmentStatusCounts
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


// --- USER MANAGEMENT ---

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// GET /api/admin/users/:id - Get a single user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


// POST /api/admin/users - Create a new user (by admin)
router.post('/users', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User with this email already exists' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user', // Admin can specify role, defaults to 'user'
            isVerified: true // Admin-created users can be pre-verified
        });

        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ message: 'User created successfully by admin', user: userResponse });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


// PUT /api/admin/users/:id - Update a user (e.g., change role)
router.put('/users/:id', adminMiddleware, async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            age,
            gender,
            role,
            address,
            city,
            state,
            country
        } = req.body;

        const updateData = {
            name,
            email,
            phone,
            age: age ? parseInt(age) : undefined,
            gender,
            role,
            address,
            city,
            state,
            country
        };

        // Remove undefined fields so we don't overwrite with null
        Object.keys(updateData).forEach(key =>
            (updateData[key] === undefined || updateData[key] === '') && delete updateData[key]
        );

        console.log('Updating user with ID:', req.params.id, 'Data:', updateData);

        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            console.log('User not found with ID:', req.params.id);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User updated successfully:', user.name);
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Delete user
router.delete('/users/:id', adminMiddleware, async (req, res) => {
    try {
        console.log('Attempting to delete user with ID:', req.params.id);
        
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            console.log('User not found with ID:', req.params.id);
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log('Successfully deleted user:', user.name);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            message: 'Failed to delete user',
            error: error.message 
        });
    }
});

// --- APPOINTMENT MANAGEMENT ---

// GET /api/admin/appointments - Get all appointments with filters
router.get('/appointments', async (req, res) => {
    try {
        const { status, page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const skip = (page - 1) * limit;
        
        let filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        const appointments = await Appointment.find(filter)
            .populate({
                path: 'doctors_id',
                select: 'name speciality address number visiting_hours degree hospital_name',
                model: 'Doctor'
            })
            .populate({
                path: 'userId',
                select: 'name email phone profile_pic',
                model: 'User'
            })
            .populate({
                path: 'adminId',
                select: 'name email',
                model: 'User'
            })
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Appointment.countDocuments(filter);
        
        res.json({
            appointments,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// PATCH /api/admin/appointments/:id/approve - Approve an appointment
router.patch('/appointments/:id/approve', async (req, res) => {
    try {
        const { adminNote } = req.body;
        const appointmentId = req.params.id;
        
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        
        if (appointment.status !== 'Pending') {
            return res.status(400).json({ message: "Only pending appointments can be approved" });
        }
        
        // Check for conflicting approved appointments
        const conflictingAppointment = await Appointment.findOne({
            doctors_id: appointment.doctors_id,
            date: appointment.date,
            status: 'Approved',
            _id: { $ne: appointmentId }
        });
        
        if (conflictingAppointment) {
            return res.status(400).json({ message: "Another appointment is already approved for this time slot" });
        }
        
        // Approve the appointment
        appointment.status = 'Approved';
        appointment.adminId = req.user.userId;
        appointment.adminNote = adminNote || "Approved by admin";
        appointment.approvedAt = new Date();
        
        await appointment.save();
        
        const updatedAppointment = await Appointment.findById(appointmentId)
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

        // Send approval email to user
        try {
            const appointmentDate = new Date(appointment.date);
            const emailSubject = `🎉 Your Appointment is Approved - SymptoSeek`;
            const emailBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">✅ Appointment Approved!</h1>
                        <p style="color: white; margin: 5px 0;">SymptoSeek - Your Health Companion</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f0fdf4;">
                        <h2 style="color: #065f46; margin-bottom: 20px;">Great News! Your Appointment is Confirmed</h2>
                        
                        <p>Dear <strong>${updatedAppointment.userId.name}</strong>,</p>
                        
                        <p style="font-size: 16px; color: #047857;">Your appointment request has been <strong>approved</strong> by our admin team! 🎉</p>
                        
                        <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #10b981;">
                            <h3 style="color: #065f46; margin-top: 0; display: flex; align-items: center;">
                                📋 Your Confirmed Appointment Details:
                            </h3>
                            <div style="display: grid; gap: 10px;">
                                <p><strong>👨‍⚕️ Doctor:</strong> Dr. ${updatedAppointment.doctors_id.name}</p>
                                <p><strong>🏥 Speciality:</strong> ${updatedAppointment.doctors_id.speciality}</p>
                                <p><strong>🏥 Hospital:</strong> ${updatedAppointment.doctors_id.hospital_name}</p>
                                <p><strong>📅 Date:</strong> ${appointmentDate.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</p>
                                <p><strong>⏰ Time:</strong> ${appointmentDate.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                })}</p>
                                <p><strong>📞 Contact:</strong> ${updatedAppointment.doctors_id.number}</p>
                                <p><strong>📍 Address:</strong> ${updatedAppointment.doctors_id.address}</p>
                                <p><strong>✅ Status:</strong> <span style="color: #10b981; font-weight: bold;">APPROVED</span></p>
                                ${adminNote ? `<p><strong>📝 Admin Note:</strong> ${adminNote}</p>` : ''}
                            </div>
                        </div>
                        
                        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h4 style="color: #065f46; margin-top: 0;">📋 Important Reminders:</h4>
                            <ul style="color: #065f46; margin: 10px 0;">
                                <li>Please arrive 15 minutes before your scheduled time</li>
                                <li>Bring a valid ID and any relevant medical documents</li>
                                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                                <li>Save the doctor's contact number: <strong>${updatedAppointment.doctors_id.number}</strong></li>
                            </ul>
                        </div>
                        
                        <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="color: #92400e; margin: 0;"><strong>💡 Need to cancel or reschedule?</strong></p>
                            <p style="color: #92400e; margin: 5px 0;">Log into your account or contact our support team.</p>
                        </div>
                        
                        <p>We're excited to help you with your healthcare needs!</p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:3000/appointments" 
                               style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                                View My Appointments
                            </a>
                        </div>
                    </div>
                    
                    <div style="background: #065f46; color: white; padding: 20px; text-align: center;">
                        <p style="margin: 0;">© 2024 SymptoSeek. All rights reserved.</p>
                        <p style="margin: 5px 0; font-size: 12px;">This is an automated message, please do not reply.</p>
                    </div>
                </div>
            `;

            await sendEmail(updatedAppointment.userId.email, emailSubject, emailBody);
        } catch (emailError) {
            console.error('Failed to send approval email:', emailError);
        }

        res.json({
            message: "Appointment approved successfully and user has been notified via email",
            appointment: updatedAppointment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// PATCH /api/admin/appointments/:id/reject - Reject an appointment
router.patch('/appointments/:id/reject', async (req, res) => {
    try {
        const { adminNote } = req.body;
        const appointmentId = req.params.id;
        
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        
        if (appointment.status !== 'Pending') {
            return res.status(400).json({ message: "Only pending appointments can be rejected" });
        }
        
        // Reject the appointment
        appointment.status = 'Rejected';
        appointment.adminId = req.user.userId;
        appointment.adminNote = adminNote || "Rejected by admin";
        appointment.rejectedAt = new Date();
        
        await appointment.save();
        
        const updatedAppointment = await Appointment.findById(appointmentId)
            .populate({
                path: 'doctors_id',
                select: 'name speciality address number visiting_hours degree hospital_name',
                model: 'Doctor'
            })
            .populate({
                path: 'userId',
                select: 'name email phone',
                model: 'User'
            });

        // Send rejection email to user
        try {
            const appointmentDate = new Date(appointment.date);
            const emailSubject = `Appointment Update - SymptoSeek`;
            const emailBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Appointment Update</h1>
                        <p style="color: white; margin: 5px 0;">SymptoSeek - Your Health Companion</p>
                    </div>
                    
                    <div style="padding: 30px; background: #fef2f2;">
                        <h2 style="color: #991b1b; margin-bottom: 20px;">Appointment Status Update</h2>
                        
                        <p>Dear <strong>${updatedAppointment.userId.name}</strong>,</p>
                        
                        <p>We regret to inform you that your appointment request could not be approved at this time.</p>
                        
                        <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #ef4444;">
                            <h3 style="color: #991b1b; margin-top: 0;">📋 Appointment Details:</h3>
                            <p><strong>👨‍⚕️ Doctor:</strong> Dr. ${updatedAppointment.doctors_id.name}</p>
                            <p><strong>🏥 Speciality:</strong> ${updatedAppointment.doctors_id.speciality}</p>
                            <p><strong>📅 Requested Date:</strong> ${appointmentDate.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</p>
                            <p><strong>⏰ Requested Time:</strong> ${appointmentDate.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                            })}</p>
                            <p><strong>❌ Status:</strong> <span style="color: #ef4444; font-weight: bold;">NOT APPROVED</span></p>
                            ${adminNote ? `<p><strong>📝 Reason:</strong> ${adminNote}</p>` : ''}
                        </div>
                        
                        <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h4 style="color: #92400e; margin-top: 0;">💡 What you can do next:</h4>
                            <ul style="color: #92400e; margin: 10px 0;">
                                <li>Try booking a different time slot that may be available</li>
                                <li>Contact us directly for alternative appointment options</li>
                                <li>Check if there are other doctors available in the same speciality</li>
                                <li>Reach out to our support team for assistance</li>
                            </ul>
                        </div>
                        
                        <p>We apologize for any inconvenience and appreciate your understanding.</p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:3000/doctors" 
                               style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 5px;">
                                Book Another Appointment
                            </a>
                            <a href="http://localhost:3000/appointments" 
                               style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 5px;">
                                View My Appointments
                            </a>
                        </div>
                    </div>
                    
                    <div style="background: #991b1b; color: white; padding: 20px; text-align: center;">
                        <p style="margin: 0;">© 2024 SymptoSeek. All rights reserved.</p>
                        <p style="margin: 5px 0; font-size: 12px;">This is an automated message, please do not reply.</p>
                    </div>
                </div>
            `;

            await sendEmail(updatedAppointment.userId.email, emailSubject, emailBody);
        } catch (emailError) {
            console.error('Failed to send rejection email:', emailError);
        }

        res.json({
            message: "Appointment rejected and user has been notified via email",
            appointment: updatedAppointment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// GET /api/admin/appointments/:id - Get a specific appointment
router.get('/appointments/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate({
                path: 'doctors_id',
                select: 'name speciality address number visiting_hours degree hospital_name',
                model: 'Doctor'
            })
            .populate({
                path: 'userId',
                select: 'name email phone address profile_pic',
                model: 'User'
            })
            .populate({
                path: 'adminId',
                select: 'name email',
                model: 'User'
            });
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// PUT /api/admin/appointments/:id - Update appointment status (for generic updates like Completed)
router.put('/appointments/:id', async (req, res) => {
    console.log('PUT /appointments/:id route hit!', req.params.id, req.body);
    try {
        const { status, adminNote } = req.body;
        const appointmentId = req.params.id;
        
        console.log('Updating appointment:', appointmentId, 'to status:', status);
        
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            console.log('Appointment not found:', appointmentId);
            return res.status(404).json({ message: "Appointment not found" });
        }
        
        // Validate status
        const validStatuses = ['Pending', 'Approved', 'Completed', 'Cancelled', 'Rejected'];
        if (!validStatuses.includes(status)) {
            console.log('Invalid status:', status);
            return res.status(400).json({ message: "Invalid status" });
        }
        
        // Update the appointment
        appointment.status = status;
        appointment.adminId = req.user.userId;
        appointment.adminNote = adminNote || `Status updated to ${status} by admin`;
        
        // Add timestamp based on status
        if (status === 'Completed') {
            appointment.completedAt = new Date();
        } else if (status === 'Cancelled') {
            appointment.cancelledAt = new Date();
        }
        
        await appointment.save();
        console.log('Appointment updated successfully');
        
        const updatedAppointment = await Appointment.findById(appointmentId)
            .populate({
                path: 'doctors_id',
                select: 'name speciality address number visiting_hours degree hospital_name',
                model: 'Doctor'
            })
            .populate({
                path: 'userId',
                select: 'name email phone',
                model: 'User'
            });
        
        res.json({
            message: `Appointment ${status.toLowerCase()} successfully`,
            appointment: updatedAppointment
        });
    } catch (error) {
        console.error('PUT route error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// DOCTOR MANAGEMENT ROUTES

// GET /api/admin/doctors - Get all doctors with pagination
router.get('/doctors', adminMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 12, search, speciality } = req.query;
        const skip = (page - 1) * limit;
        
        let filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { speciality: { $regex: search, $options: 'i' } },
                { hospital_name: { $regex: search, $options: 'i' } }
            ];
        }
        if (speciality && speciality !== '') {
            filter.speciality = speciality;
        }
        
        const doctors = await Doctor.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Doctor.countDocuments(filter);
        
        res.json({
            doctors,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// POST /api/admin/doctors - Create a new doctor
router.post('/doctors', adminMiddleware, async (req, res) => {
    try {
        const doctor = new Doctor(req.body);
        const savedDoctor = await doctor.save();
        res.status(201).json(savedDoctor);
    } catch (error) {
        console.error('Error creating doctor:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// PATCH /api/admin/doctors/:id - Update a doctor
router.patch('/doctors/:id', adminMiddleware, async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        res.json(doctor);
    } catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// DELETE /api/admin/doctors/:id - Delete a doctor
router.delete('/doctors/:id', adminMiddleware, async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        console.error('Error deleting doctor:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// --- REPORTS MANAGEMENT ---

// GET /api/admin/reports - Get all reports with pagination
router.get('/reports', adminMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 12, status, type, search } = req.query;
        const skip = (page - 1) * limit;
        
        let filter = {};
        if (status && status !== '') {
            filter.status = status;
        }
        if (type && type !== '') {
            filter.type = type;
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { doctor: { $regex: search, $options: 'i' } }
            ];
        }
        
        const reports = await Report.find(filter)
            .populate({
                path: 'user',
                select: 'name email profile_pic',
                model: 'User'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Report.countDocuments(filter);
        
        res.json({
            reports,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// GET /api/admin/reports/:id - Get specific report
router.get('/reports/:id', adminMiddleware, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate({
                path: 'user',
                select: 'name email profile_pic phone',
                model: 'User'
            });
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        res.json(report);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// PATCH /api/admin/reports/:id - Update report status
router.patch('/reports/:id', adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate({
            path: 'user',
            select: 'name email profile_pic',
            model: 'User'
        });
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        res.json({ message: 'Report updated successfully', report });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// DELETE /api/admin/reports/:id - Delete a report
router.delete('/reports/:id', adminMiddleware, async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;

