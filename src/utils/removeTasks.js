import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase_config';

//for recentTasks.jsx
export const handleRemoveTask = async (user, jobId, setTasks) => {
    try {
        const userId = user.uid;
        const taskRef = doc(db, 'tasks', jobId);

        const taskDoc = await getDoc(taskRef);
        if (taskDoc.exists()) {
            const taskData = taskDoc.data();

            if (taskData.userId === userId) {
                await deleteDoc(taskRef);
                setTasks((prevTasks) => prevTasks.filter((task) => task.jobId !== jobId));
            } else {
                console.error('User does not have permission to delete this task.');
            }
        } else {
            console.error('Task document does not exist.');
        }
    } catch (err) {
        console.error('Error removing task:', err);
    }
};
