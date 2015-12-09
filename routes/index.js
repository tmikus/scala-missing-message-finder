var express = require('express');
var router = express.Router();
var configService = require("../services/config-service");
var messagesService = require("../services/messages-service");
var codeParserService = require("../services/code-parser-service");

/* GET home page. */
router.get('/', function (req, res, next)
{
    if (configService.m_isNewConfig)
    {
        res.redirect("/config");
        return;
    }


    messagesService.loadMessages();

    if (codeParserService.m_errorMessages == null)
    {
        codeParserService.parseFiles();
    }

    var missingMessages = [];
    for (var index = 0; index < codeParserService.m_errorMessages.length; index++)
    {
        var expectedMessage = codeParserService.m_errorMessages[index];

        if (messagesService.m_messages.indexOf(expectedMessage.key) === -1)
        {
            missingMessages.push(expectedMessage);
        }
    }

    res.render('index',
    {
        missingMessages: missingMessages,
        title: 'Cato messages analyser.'
    });
});

module.exports = router;
