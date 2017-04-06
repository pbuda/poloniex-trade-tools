import * as botkit from "botkit"
import tradeHistoryBotMessage from "./tradeHistoryBotMessages"
import alertsBotMessages from "./alertsBotMessages"

export default (beans):any => {
    let controller = botkit.slackbot({debug: process.env.BOTKIT_SLACKBOT_DEBUG || false});

    controller.spawn({token: process.env.TOKEN}).startRTM();

    tradeHistoryBotMessage(controller);
    alertsBotMessages(controller, beans);

    return beans;
}