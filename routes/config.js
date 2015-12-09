var express = require("express");
var router = express.Router();
var config = require("../services/config-service");

/* GET home page. */
router.get("/", function (req, res, next)
{
    res.render("config",
    {
        catoFrontendPath: config.m_config.catoFrontendPath,
        isNewConfig: config.m_isNewConfig,
        title: "Application configuration"
    });
});

router.post("/", function (request, response, next)
{
    config.m_config.catoFrontendPath = request.body.catoFrontendPath;
    config.save();

    response.render("config",
    {
        catoFrontendPath: config.m_config.catoFrontendPath,
        success: true,
        title: "Application configuration"
    });
});

module.exports = router;
