import PriceWatchAlert from "./PriceWatchAlert";
import {limitedTradeHistory} from "../poloniex/tradeHistory"
import Alert from "./alert";
import Rate from "../support/Rate";

export const setupAlerts = ({bot, alertsRepository, liveSource}) => {
    alertsRepository.findAll().then(alerts => {
        alerts.forEach(alert => {
            attachAlert(bot, alert, liveSource, alertsRepository);
        });
    })
};

export const attachAlert = (bot, alert: Alert, liveSource, alertsRepository) => {
    return limitedTradeHistory(alert.source, alert.crypto).then(data => {
        const unsubscribe = (receiver) => {
            alertsRepository.delete(alert).then(() => liveSource.unsubscribe(receiver))
        };
        if (data.response.data.length == 0) {
            console.log(`No trades for ${alert.source}_${alert.crypto} pair - unable to determine direction`);
            return `No trades for ${alert.source}_${alert.crypto} pair - unable to determine direction`;
        } else {
            let latestTrade = data.response.data[0];
            let receiver;
            let message;
            let percentage;
            if (latestTrade.rate >= alert.rate.value) {
                percentage = `${Number(latestTrade.rate / alert.rate.value * 100 - 100).toFixed(2)}%`;
                receiver = PriceWatchAlert.rateDownAlert(bot, alert, unsubscribe);
                message = `created alert for ${alert.crypto} fall to ${alert.rate.value} ${alert.source} (latest price: ${new Rate(latestTrade.rate).formatted()}, fall by ${percentage}`
            } else {
                percentage = `${Number(alert.rate.value / latestTrade.rate * 100 - 100).toFixed(2)}%`;
                receiver = PriceWatchAlert.rateUpAlert(bot, alert, unsubscribe);
                message = `created alert for ${alert.crypto} rise to ${alert.rate.value} ${alert.source} (latest price: ${new Rate(latestTrade.rate).formatted()}, rise by ${percentage}`
            }
            liveSource.subscribe(receiver);
            return message;
        }
    });
};
