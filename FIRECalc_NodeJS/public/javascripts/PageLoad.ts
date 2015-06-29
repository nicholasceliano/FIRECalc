module PageLoad {

    export function openSocketConn() {
        Sockets.connect();
    }

    function buildTickerInfoList(tickerSymbolsArray: Array<any>) {//TODO: add class for array
        for (var i = 0; i < tickerSymbolsArray.length; i++) {
            var tickerInfo = new Quotes.TickerInfo();
            tickerInfo.symbol(tickerSymbolsArray[i].symbol);
            tickerInfo.userShares(tickerSymbolsArray[i].shares);
            Quotes.tickerInfoList.push(tickerInfo);
        }
    }

    export function applyKnockout(tickerSymbols: string) {
        //Populate Models

        //Checks if data is coming from database
        if (tickerSymbols.length === 2)
            return;

        var tickerSymbolsArray: Array<any> = JSON.parse(tickerSymbols.replace(/&quot;/g, '"'));
        buildTickerInfoList(tickerSymbolsArray);
        
        //Apply Models to the View
        function viewModel() {
            var self = this;
            self.tickerInfoList = Quotes.tickerInfoList;
            self.totals = Quotes.totalValue;
            self.pageLoaded = Quotes.pageLoaded;
        }

        //Bind to Page
        ko.applyBindings(new viewModel());
    }
}