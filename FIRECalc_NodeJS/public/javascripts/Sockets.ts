module Sockets {
    var socket:any;

    function loadSocketConnections() {
        socket.on("quoteRefresh", (data) => {
            for (var i = 0; i < data.length; i++) {
                var d = data[i],
                    q = Quotes.tickerInfoList();
                for (var a = 0; a < q.length; a++) {
                    if (d.symbol === q[a].symbol()) {
                        q[a].name(d.name);
                        q[a].price(d.price);
                        q[a].time(new Date(d.utctime).toLocaleString());
                        q[a].userShares(d.userShares);
                        q[a].volume(d.volume);
                    }
                }
            }
        });
    }

    export function connect() {
        socket = io.connect("http://localhost:1337");
        loadSocketConnections();
    }

    export function saveShares() {
        //foreach symbol and shares
        socket.emit("saveQuotes", { my: "data" });
    }
}