import {Connection, Session} from "autobahn";
import {Event, OrderBookEvent, TradeEvent} from "./events";
import * as assert from "assert";

export interface EventReceiver {
    key(): String
    receive<T>(event: Event<T>)
}

export class LiveSource {
    private connection: Connection;
    private session: Session;
    private receivers: EventReceiver[];
    private subscriptions: Set<String>;

    constructor() {
        assert(process.env.POLONIEX_URL, "Poloniex URL for Live Source not specified: env POLONIEX_URL");
        this.receivers = [];
        this.subscriptions = new Set();
        this.connection = new Connection({url: process.env.POLONIEX_URL, realm: "realm1"});
        this.connection.onopen = (session) => {
            console.log("Session started successfully");
            this.session = session;
            this.receivers.forEach(rcv => {
                this.connect(rcv);
            });
        };
        this.connection.open();
    }

    subscribe(receiver: EventReceiver) {
        this.receivers.push(receiver);
        this.connect(receiver)
    }

    unsubscribe(receiver: EventReceiver) {
        let index = this.receivers.indexOf(receiver);
        if(index > -1) this.receivers.splice(index, 1)
    }

    private connect(receiver: EventReceiver) {
        if(!this.session) {
            console.log("Session not yet initialized, delaying");
            return;
        }

        if (!this.subscriptions.has(receiver.key())) {
            console.log(`Adding a new subscription for ${receiver.key()}`);
            this.subscriptions.add(receiver.key());
            this.session.subscribe(receiver.key(), this.notifyReceivers(receiver.key()));
        } else {
            console.log(`Subscription for ${receiver.key()} already exists`);
        }
    }

    private notifyReceivers(key: String) {
        //TODO: should take care of kwargs.key sequence too!
        return (args: any[], kwargs) => {
            args.forEach(event => {
                let specificEvent;
                switch(event.type) {
                    case "newTrade":
                        specificEvent = new TradeEvent(event.type, event.data);
                        break;
                    case "orderBookModify":
                    case "orderBookRemove":
                        specificEvent = new OrderBookEvent(event.type, event.data);
                }
                this.receivers.filter(receiver => receiver.key() === key).forEach(receiver => receiver.receive(specificEvent))
            })
        }
    }
}