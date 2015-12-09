var configService = require("./config-service");
var fs = require("fs");
var path = require("path");

function createInstance()
{
    var service =
    {
        m_duplicatedMessages: [],
        m_messages: [],
        m_messagesMap: {},

        getMessagesFilePath: function ()
        {
            return path.join(configService.m_config.catoFrontendPath, "conf/messages");
        },

        loadMessages: function ()
        {
            service.m_duplicatedMessages = [];
            service.m_messages = [];
            service.m_messagesMap = {};

            var messagesFilePath = service.getMessagesFilePath();
            var messagesContent = fs.readFileSync(messagesFilePath, "utf-8");
            var lines = messagesContent.replace(/\r/g, "").split("\n");

            for (var lineIndex = 0; lineIndex < lines.length; lineIndex++)
            {
                var line = lines[lineIndex];
                var indexOfEqualSign = line.indexOf("=");
                if (indexOfEqualSign === -1)
                    continue;

                var key = line.substring(0, indexOfEqualSign);
                var value = line.substring(indexOfEqualSign + 1);

                if (service.m_messages.indexOf(key) !== -1)
                {
                    if (service.m_duplicatedMessages.indexOf(key) === -1)
                    {
                        service.m_duplicatedMessages.push(key);
                    }
                    continue;
                }

                service.m_messages.push(key);
                service.m_messagesMap[key] = value;
            }
        }
    };

    return service;
}

function getGlobalInstance()
{
    if (global.emp_messages_service === undefined)
    {
        global.emp_messages_service = createInstance();
    }

    return global.emp_messages_service;
}

module.exports = getGlobalInstance();
