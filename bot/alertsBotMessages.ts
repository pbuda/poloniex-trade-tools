import Alert from "../alerts/alert";

export default (controller, {alertsRepository}) => {
    controller.hears("^alert (.{3,4}) (.{3,4}) ([0-9].[0-9]{1,8})$", 'ambient', (bot, message) => {
        let source = message.match[1].toUpperCase();
        let crypto = message.match[2].toUpperCase();
        let rate = message.match[3];
        alertsRepository.createNew(source, crypto, rate).then((alert:Alert) => {
            bot.reply(message, `created alert for when ${crypto} price reaches ${alert.rate.formatted()} ${source}`)
        });
    });
}