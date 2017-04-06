export type EventType = "newTrade" | "orderBookModify" | "orderBookRemove"

export type OrderBookUpdateType = "ask" | "bid"

export type TradeType = "buy" | "sell"

export interface Event<T> {
    type: EventType;
    data: T;
}

export interface TradeData {
    tradeId: number;
    rate: number;
    amount: number;
    total: number;
    type: TradeType;
}

export class TradeData2 {
    constructor(public tradeId: number, public rate: number, public amount: number, public total: number, public type: TradeType) {
    }
}

export class OrderBookData {
    constructor(public rate: number, public type: OrderBookUpdateType, amount?: number) {
    }
}

export class OrderBookEvent implements Event<OrderBookData> {
    constructor(public type: EventType, public data: OrderBookData) {
    }
}

export class TradeEvent implements Event<TradeData> {
    constructor(public type: "newTrade", public data: TradeData) {
    }
}