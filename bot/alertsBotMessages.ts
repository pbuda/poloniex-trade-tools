import Alert from "../alerts/alert";
import {attachAlert} from "../alerts/alerts"
import {AlertsRepository} from "../alerts/alertsRepository";
import Rate from "../support/Rate";
import {LiveSource} from "../poloniex/liveSource";

function _createAlert(alertsRepository: AlertsRepository, liveSource: LiveSource, bot, message, source: String, crypto: String, rate: Rate) {
    console.log(`Begin adding alert: ${source}_${crypto} @ ${rate.value}`);
    alertsRepository.createNew(source, crypto, rate, message.channel).then((alert: Alert) => {
        attachAlert(bot, alert, liveSource, alertsRepository).then(msg => {
            bot.reply(message, msg);
        });
    });
}

export default (controller, {alertsRepository, liveSource}) => {
    controller.hears("^alert (.{3,4}) ([0-9].[0-9]{1,8}) (.{3,4})$", 'ambient', (bot, message) => {
        let crypto = message.match[1].toUpperCase();
        let rate = message.match[2];
        let source = message.match[3].toUpperCase();
        _createAlert(alertsRepository, liveSource, bot, message, source, crypto, new Rate(rate))
    });

    controller.hears("^alert (.{3,4}) ([0-9].[0-9]{1,8})$", "ambient", (bot, message) => {
        let source = "BTC";
        let crypto = message.match[1].toUpperCase();
        let rate = message.match[2];
        _createAlert(alertsRepository, liveSource, bot, message, source, crypto, new Rate(rate))
    })
}