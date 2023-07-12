const CustomAPIError = require('../errors/custom-error')
const Task = require('../models/task')
const { StatusCodes } = require('http-status-codes')


const addTask = async (req, res) => {
    try {
        req.body.createdBy = req.user.userId
        const { taskInfo, completionDate } = req.body
        if (!completionDate || !taskInfo) {
            throw new CustomAPIError('Add taskInfo and completion date', 204)
        } else if (taskInfo && taskInfo.length > 160) {
            throw new CustomAPIError('Task content is too long', 204)
        } else {
            const task = await Task.create(req.body)
            return res.status(StatusCodes.CREATED).json({ status: 'ok', msg: 'Task has been added successfully' })
        }
    } catch (error) {
        next(error)
    }
}

const getAllTasks = async (req, res) => {
    try {
        const { year, month, date, status, sort } = req.query
        let allTasks = []
        if (year || month || date || status || sort) {
            const tasks = await Task.find({
                createdBy: req.user.userId,
                ...req.query
            }).sort({ "createdAt": sort === 'old' ? 1 : -1 })
            tasks.forEach((task) => {
                if (year && !month && !date && task.createdAt.getFullYear() === +year) {
                    allTasks.push(task)
                } else if (!year && month && !date && task.createdAt.getMonth() === +month) {
                    allTasks.push(task)
                } else if (!year && !month && date && task.createdAt.getDate() === +date) {
                    allTasks.push(task)
                } else if (year && month && !date && task.createdAt.getFullYear() === +year && task.createdAt.getMonth() === +month) {
                    allTasks.push(task)
                } else if (!year && month && date && task.createdAt.getMonth() === +month && task.createdAt.getDate() === +date) {
                    allTasks.push(task)
                } else if (year && !month && date && task.createdAt.getDate() === +date && task.createdAt.getFullYear() === +year) {
                    allTasks.push(task)
                } else if (year && month && date && task.createdAt.getDate() === +date && task.createdAt.getMonth() === +month && task.createdAt.getFullYear() === +year) {
                    allTasks.push(task)
                } else if (!year && !month && !date) {
                    allTasks.push(task)
                }
            })
        } else {
            const tasks = await Task.find({
                createdBy: req.user.userId
            })
            tasks.forEach(async (task) => {
                if (task.status !== 'completed' && task.status !== 'cancelled' && task.completionDate < new Date()) {
                    await Task.findOneAndUpdate({
                        _id: task._id
                    },
                        { status: 'delayed' },
                        { new: true, runValidators: true })
                }
            })
            allTasks = await Task.find({
                createdBy: req.user.userId
            }).sort({ "createdAt": -1 })
        }
        return res.status(StatusCodes.OK).json({ status: 'ok', count: allTasks.length, allTasks })
    } catch (error) {
        console.log(error)
        next(error)
    }
}


const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.userId
        })
        if (!task) {
            throw new CustomAPIError('Task not found', 204)
        }
        return res.status(StatusCodes.OK).send({ status: 'ok', msg: 'Task has been removed' })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const deleteSelectedTasks = async (req, res) => {
    try {
        const ids = req.params.id.split('$')
        const newIds = ids.splice(1, ids.length)
        newIds.forEach(async (id) => {
            const task = await Task.findOne({ _id: id, createdBy: req.user.userId })
            if (task) {
                await Task.findOneAndDelete({ _id: id, createdBy: req.user.userId })
            }

        });
        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'All selected tasks have been successfully deleted' })
    } catch (error) {
        next(error)
    }

}

const deleteAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user.userId })
        if (tasks.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ status: 'Not found', length: 0 })
        }
        await Task.deleteMany({
            createdBy: req.user.userId
        })
        res.status(StatusCodes.OK).send({ status: 'ok', msg: 'tasks have been removed' })
    } catch (error) {
        next(error)
    }

}

const editTask = async (req, res) => {

    try {
        const { userId } = req.user
        const taskId = req.params.id

        const task = await Task.findOne({ _id: taskId, createdBy: userId })
        if (!task) {
            throw new CustomAPIError('task not found', 204)
        }
        const updatedTask = await Task.findOneAndUpdate({
            _id: taskId,
            createdBy: userId
        },
            req.body,
            { new: true, runValidators: true })
        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'Task has been updated', updatedTask })
    } catch (error) {
        console.log(error)
        next(error)
    }

}
module.exports = {
    addTask,
    getAllTasks,
    deleteTask,
    editTask,
    deleteAllTasks,
    deleteSelectedTasks
}
