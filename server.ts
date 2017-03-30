import * as botkit from "botkit"
import tradeHistory from "./poloniex/tradeHistory"

let controller = botkit.slackbot({debug: true});

controller.spawn({token: process.env.TOKEN}).startRTM();

controller.hears('hello', 'direct_mention', (bot, message) => {
    bot.reply(message, 'hello');
});

controller.hears('^(.{3,4}) (.{3,4}) last (\\d+) ([minutes|hours])$', 'ambient', (bot, message) => {
    let source = message.match[1].toUpperCase();
    let crypto = message.match[2].toUpperCase();
    let time = message.match[3];
    let timeUnit = message.match[4];
    tradeHistory(source, crypto, time, timeUnit).then(prepareCryptoResponse).then(respondWithData(bot, message));
});

controller.hears('^(.{3,4}) (.{3,4})$', 'ambient', (bot, message) => {
    let source = message.match[1].toUpperCase();
    let crypto = message.match[2].toUpperCase();
    tradeHistory(source, crypto).then(prepareCryptoResponse).then(respondWithData(bot, message))
});

const formatNumber = (number: Number) => number.toFixed(8);

const prepareCryptoResponse = (responseWithMeta) => {
    const data = responseWithMeta.response.data;
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
        minValue: 100000,
        maxValue: -100000,
        coin1Volume: 0,
        coin2Volume: 0,
        oldest: Number.parseFloat(data[0].rate),
        latest: Number.parseFloat(data[data.length - 1].rate),
        meta: responseWithMeta.meta
    });
};

const respondWithData = (bot, message) => {
    return (data) => {
        let meta = data.meta;
        let response = {
            attachments: [
                {
                    color: "good",
                    title: `Price check ${meta.source} - ${meta.crypto} last ${meta.time} ${meta.timeUnits}`,
                    fields: [
                        {
                            title: `Price change ${meta.source} (min-max)`,
                            value: `↑${formatNumber(data.maxValue)}\n↓${formatNumber(data.minValue)}`,
                            short: true
                        },
                        {
                            title: `Price change ${meta.source} (oldest-latest)`,
                            value: `↑${formatNumber(data.latest)}\n↓${formatNumber(data.oldest)}`,
                            short: true
                        },
                        {
                            title: `${meta.source} Volume`,
                            value: formatNumber(data.coin1Volume),
                            short: true
                        },
                        {
                            title: `${meta.crypto} Volume`,
                            value: formatNumber(data.coin2Volume),
                            short: true
                        }
                    ]
                }
            ]
        };

        bot.reply(message, response);
    }
};
