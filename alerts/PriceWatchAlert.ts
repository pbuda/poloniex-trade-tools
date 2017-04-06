import {EventReceiver, LiveSource} from "../poloniex/liveSource";
import Rate from "../support/Rate";
import {Event, TradeEvent} from "../poloniex/events";

export default class PriceWatchAlert implements EventReceiver {
    private unsubscribe;

    constructor(public bot, public channelId: String, public source: String, public crypto: String, public rate: Rate, unsubscribe: (receiver: EventReceiver) => void) {
        this.unsubscribe = unsubscribe;
    }

    key(): String {
        return `${this.source}_${this.crypto}`;
    }

    receive<T>(event: Event<T>) {
        if (event instanceof TradeEvent) {
            let tradeEvent = <TradeEvent> event;
            if (tradeEvent.data.rate >= this.rate.value) {
                this.bot.say({
                    text: `<!channel> ${this.crypto} price reached ${this.rate.formatted()} ${this.source}!`,
                    channel: this.channelId
                });
                this.unsubscribe(this);
            }
        }
    }
}