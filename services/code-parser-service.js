var configService = require("./config-service");
var fs = require("fs");
var glob = require("glob");
var path = require("path");

function createInstance()
{
    var service = {
        m_errorMessages: null,
        m_extractionFunctions: [
            function (content)
            {
                var messageKeys = [];
                var regex = /"((?:block\.|error[s]?\.)[^"]+?)"/g;
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push(matches[1]);
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /requiredNameValidation\("([^"]+?)"\)/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("block." + matches[1] + ".nameRequired");
                    messageKeys.push("error.text.maxSize");
                    messageKeys.push("error.text.invalidCharacters");
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /decimalAccountsFigures(?:\(\))?/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("error.decimal.min.outOfRange");
                    messageKeys.push("error.decimal.max.outOfRange");
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /nameValidation(?:\(\))?/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("error.text.maxSize");
                    messageKeys.push("error.text.invalidCharacters");
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /freeTextEntry\([^\)]+?\)/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("error.text.maxSize");
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /textNoLongerThan\([^\)]+?\)/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("error.text.maxSize");
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /mandatoryFreeTextEntry\([^\)]+?\)/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("error.required");
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /money(?:\([^\)]+?\)|,|\n)/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("error.money.positive.outOfRange");
                    messageKeys.push("error.money.outOfRange");
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /integer\([^\)]+?\)/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("error.integer.outOfRange");
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /optionalMoney(?:\([^\)]+?\)|,|\n)/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("error.money.positive.outOfRange");
                    messageKeys.push("error.money.outOfRange");
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /BigDecimalBox\("([^"]+?)"[^\)]+?\)/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("error." + matches[1] + ".required");
                    messageKeys.push("error.notAValidDecimal");
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /BooleanBox\("([^"]+?)"[^\)]+?\)/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("error." + matches[1] + ".required");
                    messageKeys.push("error.notAValidBoolean");
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /DateBox\("([^"]+?)"[^\)]+?\)/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("error." + matches[1] + ".required");
                    messageKeys.push("error.notAValidDate");
                }

                return messageKeys;
            },
            function (content)
            {
                var regex = /IntegerBox\("([^"]+?)"[^\)]+?\)/g;
                var messageKeys = [];
                var matches;

                while((matches = regex.exec(content)) !== null)
                {
                    messageKeys.push("error." + matches[1] + ".required");
                    messageKeys.push("error.notAValidInteger");
                }

                return messageKeys;
            }
        ],

        _getByKey: function (key)
        {
            for (var index = 0; index < service.m_errorMessages.length; index++)
            {
                if (service.m_errorMessages[index].key == key)
                {
                    return service.m_errorMessages[index];
                }
            }

            return null;
        },

        _extractMessageKeys: function (content)
        {
            var messageKeys = [];

            for (var index = 0; index < service.m_extractionFunctions.length; index++)
            {
                messageKeys = messageKeys.concat(service.m_extractionFunctions[index](content));
            }

            return messageKeys;
        },

        _findAllScalaFiles: function ()
        {
            return glob.sync("**/*.scala",
            {
                cwd: service._getRootPath(),
                ignore: [
                    "views/**/*.scala",
                    "target/**/*.scala",
                    "test/**/*.scala"
                ],
                nocase: true
            });
        },

        _getRootPath: function ()
        {
            return configService.m_config.catoFrontendPath;
        },

        _processScalaFile: function (filePath)
        {
            var fullPath = path.join(configService.m_config.catoFrontendPath, filePath);
            var content = fs.readFileSync(fullPath, "utf-8");
            var keys = service._extractMessageKeys(content);

            for (var index = 0; index < keys.length; index++)
            {
                var key = keys[index];
                var message = service._getByKey(key);

                if (message == null)
                {
                    service.m_errorMessages.push(
                    {
                        key: key,
                        paths: [filePath]
                    });
                }
                else
                {
                    message.paths.push(filePath);
                }
            }
        },

        parseFiles: function ()
        {
            service.m_errorMessages = [];

            var scalaFiles = service._findAllScalaFiles();
            for (var fileIndex = 0; fileIndex < scalaFiles.length; fileIndex++)
            {
                service._processScalaFile(scalaFiles[fileIndex]);
            }
        }
    };

    return service;
}

function getGlobalInstance()
{
    if (global.emp_code_parser_service === undefined)
    {
        global.emp_code_parser_service = createInstance();
    }

    return global.emp_code_parser_service;
}

module.exports = getGlobalInstance();