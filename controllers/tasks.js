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
            await Task.create({ ...req.body, completionDate: new Date(completionDate) })
            return res.status(StatusCodes.CREATED).json({ status: 'ok', msg: 'Task has been added successfully' })
        }
    } catch (error) {
        next(error)
    }
}

const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            createdBy: req.user.userId
        })
        tasks.forEach(async (task) => {
            if (task.status !== 'completed' && task.status !== 'cancelled') {
                if (task.completionDate < new Date() && task.status != 'delayed') {
                    await Task.findOneAndUpdate({
                        _id: task._id
                    },
                        { status: 'delayed' },
                        { new: true, runValidators: true })
                } else if (task.completionDate > new Date() && task.status != 'pending') {
                    await Task.findOneAndUpdate({
                        _id: task._id
                    },
                        { status: 'pending' },
                        { new: true, runValidators: true })
                }
            }
        })
        const { year, month, date, status, sort } = req.query
        let allTasks = []
        if (year || month || date || status || sort) {
            let tasks
            if (status) {
                tasks = await Task.find({
                    createdBy: req.user.userId,
                    status: status
                }).sort({ "completionDate": sort === 'old' ? 1 : -1 })
            } else {
                tasks = await Task.find({
                    createdBy: req.user.userId
                }).sort({ "completionDate": sort === 'old' ? 1 : -1 })
            }
            if (year || month || date) {
                tasks.forEach((task) => {
                    if (year && !month && !date) {
                        if (task.completionDate.getFullYear() === +year) {
                            allTasks.push(task)
                        }
                    } else if (!year && month && !date) {
                        if (task.completionDate.getMonth() === +month) {
                            allTasks.push(task)
                        }
                    } else if (!year && !month && date) {
                        if (task.completionDate.getDate() === +date) {
                            allTasks.push(task)
                        }
                    } else if (year && month && !date) {
                        if (task.completionDate.getFullYear() === +year && task.completionDate.getMonth() === +month) {
                            allTasks.push(task)
                        }
                    } else if (!year && month && date) {
                        if (task.completionDate.getDate() === +date && task.completionDate.getMonth() === +month) {
                            allTasks.push(task)
                        }
                    } else if (year && !month && date) {
                        if (task.completionDate.getFullYear() === +year && task.completionDate.getDate() === +date) {
                            allTasks.push(task)
                        }
                    } else if (year && month && date) {
                        if (task.completionDate.getFullYear() === +year && task.completionDate.getMonth() === +month && task.completionDate.getDate() === +date) {
                            allTasks.push(task)
                        }
                    }
                })
            } else {
                allTasks.push(...tasks)
            }
        } else {
            allTasks = await Task.find({
                createdBy: req.user.userId
            }).sort({ "completionDate": 1 })
        }
        return res.status(StatusCodes.OK).json({ status: 'ok', count: allTasks.length, allTasks })
    } catch (error) {
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
