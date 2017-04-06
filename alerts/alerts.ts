import PriceWatchAlert from "./PriceWatchAlert";

export const setupAlerts = ({bot, alertsRepository, liveSource}) => {
    alertsRepository.findAll().then(alerts => {
        alerts.forEach(alert => {
            attachAlert(bot, alert, liveSource);
        });
    })
};

export const attachAlert = (bot, alert, liveSource) => {
    let receiver = new PriceWatchAlert(bot, alert.channelId, alert.source, alert.crypto, alert.rate);
    liveSource.subscribe(receiver);
};
