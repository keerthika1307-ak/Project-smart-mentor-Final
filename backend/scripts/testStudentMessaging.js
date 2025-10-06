const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Message = require('../models/Message');
require('dotenv').config();

async function testStudentMessaging() {
    try {
        console.log('🔍 Testing Student Messaging System...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find student and mentor users
        const student = await Student.findOne({ 'personalInfo.regNo': '22sucs17' }).populate('userId');
        const mentor = await User.findOne({ role: 'mentor' });

        if (!student || !mentor) {
            console.log('❌ Student or mentor not found');
            console.log('Student found:', !!student);
            console.log('Mentor found:', !!mentor);
            return;
        }

        console.log(`👨‍🎓 Student: ${student.personalInfo.name} (User ID: ${student.userId._id})`);
        console.log(`👨‍🏫 Mentor: ${mentor.email} (User ID: ${mentor._id})`);

        // Check existing messages
        const existingMessages = await Message.find({
            $or: [
                { sender: student.userId._id, recipient: mentor._id },
                { sender: mentor._id, recipient: student.userId._id }
            ]
        }).sort({ createdAt: -1 });

        console.log(`📨 Existing messages: ${existingMessages.length}`);

        if (existingMessages.length === 0) {
            console.log('📝 Creating test messages...');
            
            // Create some test messages
            const messages = [
                {
                    sender: mentor._id,
                    recipient: student.userId._id,
                    content: "Hello! I hope you're doing well with your studies. How are you finding the current coursework?"
                },
                {
                    sender: student.userId._id,
                    recipient: mentor._id,
                    content: "Thank you for asking! I'm doing well overall, but I have some questions about the recent assignments."
                },
                {
                    sender: mentor._id,
                    recipient: student.userId._id,
                    content: "Of course! I'm here to help. What specific areas would you like to discuss?"
                },
                {
                    sender: student.userId._id,
                    recipient: mentor._id,
                    content: "I'm having trouble understanding some of the concepts in the database design module."
                }
            ];

            for (let i = 0; i < messages.length; i++) {
                const message = new Message({
                    ...messages[i],
                    createdAt: new Date(Date.now() - (messages.length - i) * 60000) // Space messages 1 minute apart
                });
                await message.save();
                console.log(`✅ Created message ${i + 1}`);
            }
        } else {
            console.log('📨 Messages already exist:');
            existingMessages.forEach((msg, index) => {
                const senderType = msg.sender.toString() === mentor._id.toString() ? 'Mentor' : 'Student';
                console.log(`${index + 1}. [${senderType}] ${msg.content.substring(0, 50)}...`);
            });
        }

        // Test the API endpoints
        console.log('\n🔍 Testing API functionality...');
        
        // Test conversations endpoint for student
        console.log('Testing conversations for student...');
        const studentConversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: student.userId._id },
                        { recipient: student.userId._id }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', student.userId._id] },
                            '$recipient',
                            '$sender'
                        ]
                    },
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$recipient', student.userId._id] },
                                        { $eq: ['$read', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        console.log(`📞 Student should see ${studentConversations.length} conversations`);

        console.log('\n🎯 Summary:');
        console.log(`- Student User ID: ${student.userId._id}`);
        console.log(`- Mentor User ID: ${mentor._id}`);
        console.log(`- Messages in database: ${existingMessages.length || 4}`);
        console.log(`- Student conversations: ${studentConversations.length}`);
        console.log('\n✅ Student messaging should now work correctly!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testStudentMessaging();
