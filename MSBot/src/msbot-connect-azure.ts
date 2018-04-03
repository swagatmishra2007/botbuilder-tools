import * as program from 'commander';
import * as validurl from 'valid-url';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';

interface ConnectAzureArgs {
    bot: string;
    secret: string;
    id: string;
    name: string;
    AppId: string;
    AppPassword: string;
    endpoint: string;
}

program
    .description('Connect the bot to Azure Bot Service')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('-i, --id <id>', 'Azure Bot Service bot id')
    .option('-n, --name <name>', 'name of the azure bot service')
    .option('-a, --AppId  <appid>', 'Microsoft AppId for the Azure Bot Service')
    .option('-p, --AppPassword <password>', 'Microsoft app password for the Azure Bot Service')
    .option('-e, --endpoint <endpoint>', "endpoint for the bot using the MSA AppId")
    .action((cmd, actions) => {

    });

let args = <ConnectAzureArgs><any>program.parse(process.argv);

if (!args.bot) {
    BotConfig.LoadBotFromFolder(process.cwd())
        .then(processConnectAzureArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
} else {
    BotConfig.Load(args.bot)
        .then(processConnectAzureArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}

async function processConnectAzureArgs(config: BotConfig): Promise<BotConfig> {

    if (args.secret) {
        config.cryptoPassword = args.secret;
    }

    if (!args.id)
        throw new Error("Bad or missing id");

    if (!args.AppId)
        throw new Error("Bad or missing AppId");

    if (!args.AppPassword)
        throw new Error("Bad or missing AppPassword");

    if (!args.endpoint)
        throw new Error("missing endpoint");

    if (!validurl.isWebUri(args.endpoint)) 
        throw new Error(`${args.endpoint} is not a valid url`);

    config.connectService(<IAzureBotService>{
        type: ServiceType.AzureBotService,
        id: args.id,
        name: args.hasOwnProperty('name') ? args.name : args.id,
        appId: args.AppId,
        appPassword: config.encryptValue(args.AppPassword),
        endpoint: args.endpoint
    });

    await config.Save();
    return config;
}
