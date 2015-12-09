var extend = require("extend");
var fs = require("fs");
var path = require("path");

function createInstance()
{
    var service = {
        m_config: {
            catoFrontendPath: ""
        },
        m_isNewConfig: false,
        m_configPath: path.join(__dirname, "../config.json"),

        load: function ()
        {
            if (!fs.existsSync(service.m_configPath))
            {
                console.log("Config file not present. Creating new config file.");
                service.save();
                service.m_isNewConfig = true;
            }
            else
            {
                var stringifiedConfig = fs.readFileSync(service.m_configPath, "utf-8");

                var parsedConfig = null;
                try
                {
                    parsedConfig = JSON.parse(stringifiedConfig);
                }
                catch (ex)
                {
                    console.error("Could not load config file.");
                }

                if (parsedConfig != null)
                {
                    extend(true, service.m_config, parsedConfig);
                    console.log("Config loaded successfully.");
                }
            }
        },

        save: function ()
        {
            var stringifiedConfig = JSON.stringify(service.m_config, null, "    ");
            fs.writeFileSync(service.m_configPath, stringifiedConfig);
            console.log("Saved config file.");

            service.m_isNewConfig = false;
        }
    };

    return service;
}

function getGlobalInstance()
{
    if (global.emp_config_service === undefined)
    {
        global.emp_config_service = createInstance();
        global.emp_config_service.load();
    }

    return global.emp_config_service;
}

module.exports = getGlobalInstance();
