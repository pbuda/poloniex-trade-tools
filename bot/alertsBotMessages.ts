import Alert from "../alerts/alert";
import {attachAlert} from "../alerts/alerts"

export default (controller, {alertsRepository, liveSource}) => {
    controller.hears("^alert (.{3,4}) (.{3,4}) ([0-9].[0-9]{1,8})$", 'ambient', (bot, message) => {
        let source = message.match[1].toUpperCase();
        let crypto = message.match[2].toUpperCase();
        let rate = message.match[3];
        alertsRepository.createNew(source, crypto, rate, message.channel).then((alert:Alert) => {
            attachAlert(bot, alert, liveSource, alertsRepository);
            bot.reply(message, `created alert for when ${crypto} price reaches ${alert.rate.formatted()} ${source}`)
        });
    });
}