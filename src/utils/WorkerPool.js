export class WorkerPool {
  constructor(size) {
    this.poolSize = size;
    this.workers = [];
    this.taskQueue = [];
    this.initializePool();
  }

  initializePool() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(`${process.env.PUBLIC_URL}/js/opencv.worker.js`);
      worker.onmessage = this.onWorkerMessage.bind(this, worker);
      worker.onerror = this.onWorkerError.bind(this, worker);
      this.workers.push({ worker, busy: false });
    }
  }

  onWorkerMessage(worker, e) {
    const workerObj = this.workers.find(w => w.worker === worker);
    if (workerObj) {
      workerObj.busy = false;
    }
    const task = worker.task;

    if (task && task.callback) {
      task.callback(e.data);
    }

    // Check if there are tasks in the queue
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift();
      this.runTask(nextTask);
    }
  }

  onWorkerError(worker, e) {
    const workerObj = this.workers.find(w => w.worker === worker);
    if (workerObj) {
      workerObj.busy = false;
    }

    console.error('Worker error:', e);

    // Retry the task or handle the error
    if (worker.task && worker.task.callback) {
      worker.task.callback({ error: e.message });
    }

    // Check if there are tasks in the queue
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift();
      this.runTask(nextTask);
    }
  }

  runTask(task) {
    const availableWorker = this.workers.find(w => !w.busy);

    if (availableWorker) {
      availableWorker.busy = true;
      availableWorker.worker.task = task; // Store task in the worker itself
      availableWorker.worker.postMessage(task.data);
    } else {
      // Add the task to the queue if no workers are available
      this.taskQueue.push(task);
    }
  }

  processImage(data, callback) {
    const task = { data, callback };
    this.runTask(task);
  }

  terminateWorkers() {
    this.workers.forEach(w => w.worker.terminate());
    this.workers = [];
  }
}
