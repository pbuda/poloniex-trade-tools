import * as botkit from "botkit"
import tradeHistory from "./poloniex/tradeHistory"

let controller = botkit.slackbot({debug: true});

controller.spawn({token: process.env.TOKEN}).startRTM();

controller.hears('hello', 'direct_mention', (bot, message) => {
    bot.reply(message, 'hello');
});

controller.hears('BTC_(.{3,4}) last (\\d+) ([minutes|hours])', 'direct_mention', (bot, message) => {
    let crypto = message.match[1].toUpperCase();
    let time = message.match[2];
    let timeUnit = message.match[3];
    tradeHistory(`BTC_${crypto}`, time, timeUnit).then(prepareCryptoResponse(crypto, bot, message));
});

const prepareCryptoResponse = (crypto, bot, message) => {
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
            pair: `BTC_${crypto}`,
            minValue: 100000,
            maxValue: -100000,
            coin1Volume: 0,
            coin2Volume: 0,
            oldest: Number.parseFloat(data[0].rate),
            latest: Number.parseFloat(data[data.length - 1].rate)
        });

        bot.reply(message, `Price change (min-max): ${responseData.minValue}-${responseData.maxValue}\n
        Price (oldest-latest): ${responseData.oldest}-${responseData.latest}\n
        BTC Volume: ${responseData.coin1Volume}\n
        ${crypto} Volume: ${responseData.coin2Volume}`)
    }
};
