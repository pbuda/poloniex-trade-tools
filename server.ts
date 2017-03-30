import * as botkit from "botkit"
import tradeHistory from "./poloniex/tradeHistory"

let controller = botkit.slackbot({debug: true});

controller.spawn({token: process.env.TOKEN}).startRTM();

controller.hears('hello', 'direct_mention', (bot, message) => {
    bot.reply(message, 'hello');
});

controller.hears('(.{3,4}) (.{3,4}) last (\\d+) ([minutes|hours])', 'direct_mention', (bot, message) => {
    let source = message.match[1].toUpperCase();
    let crypto = message.match[2].toUpperCase();
    let time = message.match[3];
    let timeUnit = message.match[4];
    tradeHistory(`${source}_${crypto}`, time, timeUnit).then(prepareCryptoResponse(source, crypto)).then(respondWithData(bot, message));
});

controller.hears('^(.{3,4}) (.{3,4})$', 'direct_mention', (bot, message) => {
    let source = message.match[1].toUpperCase();
    let crypto = message.match[2].toUpperCase();
    tradeHistory(`${source}_${crypto}`).then(prepareCryptoResponse(source, crypto)).then(respondWithData(bot, message))
});

const formatNumber = (number:Number) => number.toFixed(8);

const prepareCryptoResponse = (source, crypto) => {
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
            pair: `${source}_${crypto}`,
            minValue: 100000,
            maxValue: -100000,
            coin1Volume: 0,
            coin2Volume: 0,
            oldest: Number.parseFloat(data[0].rate),
            latest: Number.parseFloat(data[data.length - 1].rate),
            coin1: source,
            coin2: crypto
        });
    }
};

const respondWithData = (bot, message) => {
    return (data) => {
        let response = {
            attachments: [
                {
                    color: "good",
                    title: "Price check",
                    fields: [
                        {
                            title: "Price change (min-max)",
                            value: `${formatNumber(data.minValue)}-${formatNumber(data.maxValue)}`,
                            short: true
                        },
                        {
                            title: "Price change (oldest-latest)",
                            value: `${formatNumber(data.oldest)}-${formatNumber(data.latest)}`,
                            short: true
                        },
                        {
                            title: `${data.coin1} Volume`,
                            value: formatNumber(data.coin1Volume),
                            short: true
                        },
                        {
                            title: `${data.coin2} Volume`,
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
