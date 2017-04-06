import {EventReceiver} from "../poloniex/liveSource";
import {Event, TradeEvent} from "../poloniex/events";
import Alert from "./alert";
import Rate from "../support/Rate";

export default class PriceWatchAlert implements EventReceiver {
    static rateUpAlert(bot, alert: Alert, unsubscribe: (receiver: EventReceiver) => void) {
        const rateIsHigherThanAlert = (rate: Rate, alert: Alert): Boolean => {
            return rate.value >= alert.rate.value;
        };
        return new PriceWatchAlert(bot, alert, rateIsHigherThanAlert, unsubscribe, true)
    }

    static rateDownAlert(bot, alert: Alert, unsubscribe: (receiver: EventReceiver) => void) {
        const rateIsLowerThanAlert = (rate: Rate, alert: Alert): Boolean => {
            return rate.value <= alert.rate.value;
        };

        return new PriceWatchAlert(bot, alert, rateIsLowerThanAlert, unsubscribe, false)
    }

    private bot;
    private alert;
    private compare;
    private unsubscribe;
    private upAlert;
    private processing = true;

    private constructor(bot, alert: Alert, compare: (rate: Rate, alert: Alert) => Boolean, unsubscribe: (receiver: EventReceiver) => void, upAlert: Boolean) {
        this.bot = bot;
        this.alert = alert;
        this.compare = compare;
        this.unsubscribe = unsubscribe;
        this.upAlert = upAlert;
    }

    key(): String {
        return `${this.alert.source}_${this.alert.crypto}`;
    }

    receive<T>(event: Event<T>) {
        if (event instanceof TradeEvent && this.processing) {
            let tradeEvent = <TradeEvent> event;
            if (this.compare(tradeEvent.data.rate, this.alert)) {
                this.bot.say({
                    text: this.buildMessage(),
                    channel: this.alert.channelId
                });
                this.processing = false;
                this.unsubscribe(this);
            }
        }
    }

    private buildMessage():any {
        let direction = this.upAlert ? "rose" : "fell";
        return `<!channel> ${this.alert.crypto} price ${direction} to ${this.alert.rate.formatted()} ${this.alert.source}!`;
    }
}