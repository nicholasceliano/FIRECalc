module Quotes {

    export var tickerInfoList = ko.observableArray<TickerInfo>([]);
    export var edit = ko.observable<boolean>(false);

    export class TickerInfo {
        symbol = ko.observable<string>("");
        name = ko.observable<string>("");
        price = ko.observable<number>(0).withCurrencyFormat(2);
        time = ko.observable<string>(null);
        volume = ko.observable<number>(0);
        userShares = ko.observable<number>(0);

        value = ko.computed<number>(function () {
            return this.price() * this.userShares();
        }, this);
        valueFormatted = ko.computed<string>(function () {
            return "$".concat(Helper.commaSeparateNumber((this.price() * this.userShares()).toFixed(2)));
        }, this);
    }

    export var pageLoaded = ko.computed<boolean>(() => {
        var loaded = false;
        for (var i = 0; i < tickerInfoList().length; i++)
            if (!loaded)
                loaded = true;
        
        return loaded;
    });

    export var totalValue = ko.computed<string>(() => {
        var total = 0;
        for (var i = 0; i < tickerInfoList().length; i++) {
            total = total + tickerInfoList()[i].value();
        }
        return "$".concat(Helper.commaSeparateNumber(total.toFixed(2)));
    });


    export function editShares() {
        edit(false);
    }

    export function saveShares() {
        edit(true);
        //Save Shares to database?
        Sockets.saveShares();
    }
}


ko.observable.fn.withCurrencyFormat = function (precision) {
    var observable = this;
    observable.formatted = ko.computed({
        read: (key) => {
            return "$".concat(Helper.commaSeparateNumber((+observable()).toFixed(precision)));
        },
        write: (value) => {
            value = parseFloat(value.replace(/[^\.\d]/g, ""));
            observable(isNaN(value) ? null : value); // Write to underlying storage 
        }
    });

    return observable;
};