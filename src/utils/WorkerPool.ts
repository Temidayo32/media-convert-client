export interface WorkerTask {
  data: any; // Define your task data type appropriately
  callback: (result: any) => void;
}

interface CustomWorker extends Worker {
  task?: WorkerTask;
}

interface WorkerObj {
  worker: CustomWorker;
  busy: boolean;
  task?: WorkerTask;
}

export class WorkerPool {
  private poolSize: number;
  private workers: WorkerObj[];
  private taskQueue: WorkerTask[];

  constructor(size: number) {
    this.poolSize = size;
    this.workers = [];
    this.taskQueue = [];
    this.initializePool();
  }

  private initializePool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(`${process.env.PUBLIC_URL}/js/opencv.worker.js`);
      worker.onmessage = (e) => this.onWorkerMessage(worker, e);
      worker.onerror = (e) => this.onWorkerError(worker, e);
      this.workers.push({ worker, busy: false });
    }
  }

  private onWorkerMessage(worker: CustomWorker, e: MessageEvent): void {
    const workerObj = this.workers.find((w) => w.worker === worker);
    if (workerObj) {
      workerObj.busy = false;
    }
    const task = workerObj?.task;

    if (task && task.callback) {
      task.callback(e.data);
    }

    // Check if there are tasks in the queue
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift();
      if (nextTask) {
        this.runTask(nextTask);
      }
    }
  }

  private onWorkerError(worker: CustomWorker, e: ErrorEvent): void {
    const workerObj = this.workers.find((w) => w.worker === worker);
    if (workerObj) {
      workerObj.busy = false;
    }

    console.error('Worker error:', e);

    // Retry the task or handle the error
    const task = worker.task;
    if (task && task.callback) {
      task.callback({ error: e.message });
    }

    // Check if there are tasks in the queue
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift();
      if (nextTask) {
        this.runTask(nextTask);
      }
    }
  }

  private runTask(task: WorkerTask): void {
    const availableWorker = this.workers.find((w) => !w.busy);

    if (availableWorker) {
      availableWorker.busy = true;
      availableWorker.worker.task = task; // Store task in the worker itself
      availableWorker.worker.postMessage(task.data);
    } else {
      // Add the task to the queue if no workers are available
      this.taskQueue.push(task);
    }
  }

  public processImage(data: any, callback: (result: any) => void): void {
    const task: WorkerTask = { data, callback };
    this.runTask(task);
  }

  public terminateWorkers(): void {
    this.workers.forEach((w) => w.worker.terminate());
    this.workers = [];
  }
}
