import * as botkit from "botkit"
import tradeHistory from "./poloniex/tradeHistory"

let controller = botkit.slackbot({debug: true});

controller.spawn({token: process.env.TOKEN}).startRTM();

controller.hears('hello', 'direct_mention', (bot, message) => {
    bot.reply(message, 'hello');
});

controller.hears('BTC_ETH last (\\d+) minutes', 'direct_mention', (bot, message) => {
    let time = message.match[1];
    tradeHistory("BTC_ETH", time).then(prepareCryptoResponse(bot, message));
});

const prepareCryptoResponse = (bot, message) => {
    return (response) => {
        const data = response.data;
        const reducer = (acc, val, index, arr) => {
            return {
                ...acc,
                minValue: Math.min(acc.minValue, Number.parseFloat(val.rate)),
                maxValue: Math.max(acc.maxValue, Number.parseFloat(val.rate)),
                coin1Volume: acc.coin1Volume + Number.parseFloat(val.total),
                coin2Volume: acc.coin2Volume + Number.parseFloat(val.amount)
            }
        };
        let responseData = data.reduce(reducer, {
            pair: "BTC_ETH",
            minValue: 100000,
            maxValue: -100000,
            coin1Volume: 0,
            coin2Volume: 0
        });

        bot.reply(message, `Price change: ${responseData.minValue}-${responseData.maxValue}, BTC Volume: ${responseData.coin1Volume}, ETH Volume: ${responseData.coin2Volume}`)
    }
};