module.exports = {
  publish: (queue, msg) => {
    console.log("RabbitMQ stub:", queue, msg);
  }
};
