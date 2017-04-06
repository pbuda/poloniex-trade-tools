import PriceWatchAlert from "./PriceWatchAlert";

export const setupAlerts = ({bot, alertsRepository, liveSource}) => {
    alertsRepository.findAll().then(alerts => {
        alerts.forEach(alert => {
            attachAlert(bot, alert, liveSource, alertsRepository);
        });
    })
};

export const attachAlert = (bot, alert, liveSource, alertsRepository) => {
    const unsubscribe = (receiver) => {
        alertsRepository.delete(alert).then(() => liveSource.unsubscribe(receiver))
    };
    let receiver = new PriceWatchAlert(bot, alert.channelId, alert.source, alert.crypto, alert.rate, unsubscribe);
    liveSource.subscribe(receiver);
};
