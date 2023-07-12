const express = require('express')
const router = express.Router()
const { addTask, getAllTasks, deleteTask, editTask, deleteSelectedTasks, deleteAllTasks } = require('../controllers/tasks')
const authenticateUser = require('../middleware/authentications')

router.post('/addTask', authenticateUser, addTask)
router.get('/getAllTasks', authenticateUser, getAllTasks)
router.delete('/deleteAllTasks', authenticateUser, deleteAllTasks)
router.delete('/deleteTask/:id', authenticateUser, deleteTask)
router.patch('/editTask/:id', authenticateUser, editTask)
router.delete('/deleteSelectedTasks/:id', authenticateUser, deleteSelectedTasks)

module.exports = router