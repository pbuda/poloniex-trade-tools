export default class Rate {
    constructor(public value: number) {
    }

    formatted() {
        return Number(this.value).toFixed(8)
    }
}