module.exports = function (app)
{
    app.use('/', require('./routes/index'));
    app.use("/config", require('./routes/config'));
};