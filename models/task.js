const mongoose = require('mongoose')
const TaskSchema = new mongoose.Schema({
    taskInfo: {
        type: String,
        required: [true, 'please provide information about task'],
        trim: true
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a user']
    },
    completionDate: {
        type: Date ,
        required:true
    },
    status: {
        type: String,
        required:true,
        enum: ['pending', 'completed', 'delayed', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true })
module.exports = mongoose.model('Task', TaskSchema)