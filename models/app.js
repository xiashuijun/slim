
var mixinMongoMethods = require("../utils").mixinMongoMethods;

var Job = require('./job').Job;
var Stage = require('./stage').Stage;
var RDD = require('./rdd').RDD;
var Executor = require('./executor').Executor;

var apps = {};

function App(id) {
  this.id = id;
  this.findObj = { id: id };
  this.propsObj = {};
  this.toSyncObj = {};
  this.dirty = true;

  this.jobs = {};
  this.stages = {};
  this.rdds = {};
  this.executors = {};

  this.stageIDstoJobIDs = {};
}

mixinMongoMethods(App, "Application", "Applications");

App.prototype.fromEvent = function(e) {
  return this.set({
    name: e['App Name'],
    'time.start': this.processTime(e['Timestamp']),
    user: e['User'],
    attempt: e['App Attempt ID']
  });
};

function getApp(id) {
  if (typeof id == 'object') {
    id = id['appId'];
  }
  if (!(id in apps)) {
    apps[id] = new App(id);
  }
  return apps[id];
}

App.prototype.getJob = function(jobId) {
  if (typeof jobId == 'object') {
    jobId = jobId['Job ID'];
  }
  if (!(jobId in this.jobs)) {
    this.jobs[jobId] = new Job(this.id, jobId);
  }
  return this.jobs[jobId];
};

App.prototype.getJobByStageId = function(stageId) {
  if (!(stageId in this.stageIDstoJobIDs)) {
    throw new Error("No job found for stage " + stageId);
  }
  return this.jobs[this.stageIDstoJobIDs[stageId]];
};

App.prototype.getStage = function(stageId) {
  if (typeof stageId == 'object') {
    if ('Stage ID' in stageId) {
      stageId = stageId['Stage ID'];
    } else if ('Stage Info' in stageId) {
      stageId = stageId['Stage Info']['Stage ID'];
    } else {
      throw new Error("Invalid argument to App.getStage: " + stageId);
    }
  }
  if (!(stageId in this.stages)) {
    this.stages[stageId] = new Stage(this.id, stageId);
  }
  return this.stages[stageId];
};

App.prototype.getRDD = function(rddId) {
  if (typeof rddId == 'object') {
    rddId = rddId['RDD ID'];
  }
  if (!(rddId in this.rdds)) {
    this.rdds[rddId] = new RDD(this.id, rddId);
  }
  return this.rdds[rddId];
};

App.prototype.getExecutor = function(executorId) {
  if (typeof executorId == 'object') {
    if ('Block Manager ID' in executorId) {
      executorId = executorId['Block Manager ID'];
    }
    executorId = executorId['Executor ID'];
  }
  if (!(executorId in this.executors)) {
    this.executors[executorId] = new Executor(this.id, executorId);
  }
  return this.executors[executorId];
};

module.exports.App = App;
module.exports.getApp = getApp;
