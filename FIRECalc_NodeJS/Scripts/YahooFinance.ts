import http = require("http");
import db = require("./models/DatabaseModels");

export module YahooFinance {

    function concatTickers(tickerList: string[]): string {
        var tickerString = "",
            tickerListLength = tickerList.length;

        if (tickerListLength > 1) {
            for (var i = 0; i < tickerListLength; i++) {
                if (i < tickerListLength - 1)
                    tickerString = tickerString + tickerList[i] + ",";
                else
                    tickerString = tickerString + tickerList[i];
            }
        } else
            tickerString = tickerList[0];

        return tickerString;
    }
        
    export function updateTickerInfo(socket: Socket, stockTickerData: Array<db.DbModels.StockData>) {
        var tickerList: string[] = [];
        for (var d = 0; d < stockTickerData.length; d++) 
            tickerList.push(stockTickerData[d].symbol);

        if (tickerList.length > 0) {

            var options = {
                host: "finance.yahoo.com",
                path: "/webservice/v1/symbols/".concat(concatTickers(tickerList).concat("/quote?format=json"))
            }

            var callback = (response) => {
                var str = "",
                    respStatusCode = response.statusCode;
                response.on("data",(chunk) => {
                    str += chunk;
                });

                response.on("end",() => {
                    var quoteList: Array<Fields> = [];
                    if (respStatusCode === 200) {
                        var quoteInfo: YahooStockData = JSON.parse(str);
                        for (var i = 0; i < quoteInfo.list.meta.count; i++) {
                            for (var a = 0; a < stockTickerData.length; a++) {
                                if (stockTickerData[a].symbol === quoteInfo.list.resources[i].resource.fields.symbol)
                                    quoteInfo.list.resources[i].resource.fields.userShares = stockTickerData[i].shares;
                            }
                            quoteList.push(quoteInfo.list.resources[i].resource.fields);
                        }
                    } else {
                        console.log("Error - HttpStatus: ".concat(respStatusCode));
                    }

                    socket.emit("quoteRefresh", quoteList);
                });
            }

            http.request(options, callback).end();
        }
    }
}

class YahooStockData {
    list: List
}

class List {
    meta: Meta;
    resources: Resources[];
}

class Meta {
    type: string;
    start: number;
    count: number;
}

class Resources {
    resource: Resource;
}

class Resource {
    classname: string;
    fields: Fields;
}

class Fields {
    name: string;
    price: string;
    symbol: string;
    ts: string;
    type: string;
    utctime: string;
    volume: string;
    userShares: number;
}

