import axios from "axios"

const BASE_URL = "https://poloniex.com";

export default (cryptoPair, minutes) => {
    console.log("fetching trade history");
    let end = Date.now() / 1000;
    let start = end - minutes * 60;
    return axios.get(`${BASE_URL}/public`, {
        params: {
            command: "returnTradeHistory",
            currencyPair: cryptoPair,
            start: start,
            end: end
        }
    })
}