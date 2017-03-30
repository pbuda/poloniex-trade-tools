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
    tradeHistory(`BTC_${crypto}`, time, timeUnit).then(prepareCryptoResponse(crypto)).then(respondWithData(bot, message));
});

controller.hears('^BTC_(.{3,4})$', 'direct_mention', (bot, message) => {
    let crypto = message.match[1].toUpperCase();
    tradeHistory(`BTC_${crypto}`).then(prepareCryptoResponse(crypto)).then(respondWithData(bot, message))
});

const formatNumber = (number:Number) => number.toFixed(8);

const prepareCryptoResponse = (crypto) => {
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
        return data.reduce(reducer, {
            pair: `BTC_${crypto}`,
            minValue: 100000,
            maxValue: -100000,
            coin1Volume: 0,
            coin2Volume: 0,
            oldest: Number.parseFloat(data[0].rate),
            latest: Number.parseFloat(data[data.length - 1].rate),
            coin1: "BTC",
            coin2: crypto
        });
    }
};

const respondWithData = (bot, message) => {
    return (data) => {
        let responseData = `Price change (min-max): ${formatNumber(data.minValue)}-${formatNumber(data.maxValue)}\n
        Price (oldest-latest): ${formatNumber(data.oldest)}-${formatNumber(data.latest)}\n
        ${data.coin1} Volume: ${formatNumber(data.coin1Volume)}\n
        ${data.coin2} Volume: ${formatNumber(data.coin2Volume)}`;

        bot.reply(message, responseData);
    }
};
