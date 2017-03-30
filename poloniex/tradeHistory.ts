import axios from "axios"

const BASE_URL = "https://poloniex.com";

export default (cryptoPair, time, timeUnits) => {
    console.log(`Fetching trade history for ${cryptoPair} in last ${time} ${timeUnits}`);
    let multiplier;
    switch(timeUnits) {
        case "minutes": multiplier = 60; break;
        case "hours": multiplier = 3600; break;
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
}