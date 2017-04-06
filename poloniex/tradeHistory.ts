import axios from "axios"

const BASE_URL = "https://poloniex.com";

const _tradeHistory = (cryptoPair, time, timeUnits) => {
    console.log(`Fetching trade history for ${cryptoPair} in last ${time} ${timeUnits}`);
    let multiplier;
    switch(timeUnits) {
        case "minutes":
        case "minute":
            multiplier = 60; break;
        case "hours":
        case "hour":
            multiplier = 3600; break;
        default: multiplier = 60;
    }

    let end = Date.now() / 1000;
    let start = end - time * multiplier;
    return axios.get(`${BASE_URL}/public`, {
        params: {
            command: "returnTradeHistory",
            currencyPair: cryptoPair,
            start: start,
            end: end
        }
    })
};

export default (source, crypto, time = 5, timeUnits = "minutes") => {
    return _tradeHistory(`${source}_${crypto}`, time, timeUnits).then(response => {
        return  {
            meta: {
                source: source,
                crypto: crypto,
                time: time,
                timeUnits: timeUnits
            },
            response: response
        }
    })
}

export const limitedTradeHistory = (source, crypto) => {
    console.log(`Getting limited trade history for pair ${source}_${crypto}`);
    return axios.get(`${BASE_URL}/public`, {
        params: {
            command: "returnTradeHistory",
            currencyPair: `${source}_${crypto}`
        }
    }).then(response => {
        return {
            meta: {
                source: source,
                crypto: crypto
            },
            response: response
        }
    })
};
