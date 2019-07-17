var os = require("os");
const { fork } = require("child_process");
let queues = [];
let workersWorking = [];
let maxWorkers = 2;
let isAutoMaxWorker = true;
let memoryUsageAvg = 30;
let countDone = 0;
var isProduction = process.env.NODE_ENV === "production";

exports.getWorkersWorking = () => {
  return workersWorking.length;
};
exports.getMaxWorkers = () => {
  return maxWorkers;
};
exports.getMemoryUsageAvg = () => {
  return memoryUsageAvg;
};
exports.getqueues = () => {
  return queues.length;
};

exports.CreateNew = (autoMaxWorker, maxWorks) => {
  isAutoMaxWorker = autoMaxWorker;
  if (isAutoMaxWorker) {
    maxWorkers = this.caculateMaxWorker();
  }
  if (maxWorks == undefined) {
    maxWorkers = this.caculateMaxWorker();
    isAutoMaxWorker = true;
  } else {
    maxWorkers = maxWorks;
    isAutoMaxWorker = false;
  }
};

exports.caculateMaxWorker = () => {
  const freeRam = os.freemem();
  maxWorkers = Math.floor(freeRam / 1024 / 1024 / 110); //120MB mỗi worker
  return maxWorkers;
};

exports.addQueue = ({ path, data, childHandler }) => {
  queues.push({ path, data, childHandler });
};

exports.DoTasks = async () => {
  if (workersWorking.length >= maxWorkers)
    return {
      isSuccess: false,
      message: "worker đã đạt mức tối đa cho phép"
    };
  if (queues.length == 0)
    return {
      isSuccess: false,
      message: "Không có hàng đợi"
    };

  let max = maxWorkers - workersWorking.length;
  if (max > queues.length) max = queues.length;
  var count = 0;
  while (count < max) {
    const queue = queues[queues.length - 1];
    if (this.DoTask(queue)) {
      queues.pop();
    }
    count++;
  }

  return {
    isSuccess: true,
    message: `${max} worker đang được thực hiện`
  };
};

exports.isEnoughResource = () => {
  const freeRam = os.freemem() / 1024 / 1024;

  //lượng ram < 2 lần lượng ram tiêu thụ + 60mb rành cho chronium thì không thực hiện nữa
  if (freeRam < 3 * (memoryUsageAvg + 60)) {
    return false;
  }
  return true;
};
exports.DoTask = queue => {
  if (queue == undefined) return false;

  if (!this.isEnoughResource()) {
    return false;
  }

  const { path, data, childHandler } = queue;
  let worker = null;
  // if (isProduction) {
  //   worker = fork(path);
  // } else {
  //   worker = fork(path, {
  //     silent: true,
  //     execArgv: ["--inspect=10245"]
  //   });
  // }
  worker = fork(path);

  worker.on("message", childData => {
    childHandler(childData);
    if (childData.next) {
      workersWorking = workersWorking.filter(item => {
        return item.pid != worker.pid;
      });
      worker.disconnect();
      const newWork = queues[queues.length - 1];
      if (this.DoTask(newWork)) {
        queues.pop();
      }
    }
    if (childData.memory) {
      memoryUsageAvg = (memoryUsageAvg + childData.memory) / 2;
    }
  });
  worker.send(data);
  worker.send({ isCheckMemory: true });

  workersWorking.push(worker);
  countDone++;
  return true;
};

exports.killWorkers = worker => {
  workersWorking.forEach(work => {
    work.disconnect();
  });
  workersWorking = [];
};
