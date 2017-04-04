import * as botkit from "botkit"
import tradeHistoryBotMessage from "./tradeHistoryBotMessages"

export default () => {
    let controller = botkit.slackbot({debug: true});

    controller.spawn({token: process.env.TOKEN}).startRTM();

    tradeHistoryBotMessage(controller)
}