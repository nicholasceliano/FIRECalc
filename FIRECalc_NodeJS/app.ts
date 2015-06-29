import express = require("express");
import http = require("http");
import path = require("path");
var sql = require("mssql");
import db = require("./Scripts/models/DatabaseModels");
import quote = require("./Scripts/YahooFinance");

var app = express();

// all environments
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express.favicon());
app.use(express.logger("dev"));
app.use(express.json());
app.use(express.urlencoded());
//app.use(express.methodOverride());
app.use(app.router);

import stylus = require("stylus");
app.use(stylus.middleware(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));

// development only
if ("development" === app.get("env")) {
    app.use(express.errorHandler());
}

var server = http.createServer(app).listen(app.get("port"), () => {
    console.log("Express server listening on port " + app.get("port"));
});
var io = require("socket.io")(server);


var stockData: Array<db.DbModels.StockData> = [];

var config = {
    user: "stUser",
    password: "stocktracker",
    server: "localhost", // You can use "localhost\\instance" to connect to named instance 
    database: "stocktracker"
}

var connection = new sql.Connection(config, (errConn) => {
    if (errConn)
        console.log("Error: Connection - ".concat(errConn));
    
    var request = new sql.Request(connection); // or: var request = connection.request(); 
    request.query("select * from stocks", (errReq, rows) => {
        if (errReq)
            console.log("Error: Query - ".concat(errReq));
        
        for (var i = 0; i < rows.length; i++) {
            stockData.push(<db.DbModels.StockData>{
                symbol: rows[i].symbol,
                shares: rows[i].shares
            });
        }
    });
});
//maybe build a chart? and store data in database?

//Routes
app.get("/", (req: express.Request, res: express.Response) => {
    res.render("index", { title: "Blank", tickerSymbols: JSON.stringify(stockData) });
});
app.get("/users", (req: express.Request, res: express.Response) => {
    res.send("respond with a resource");
});


//create items for # of tickers
io.on("connection", (socket) => {
    quote.YahooFinance.updateTickerInfo(socket, stockData);

    var pollInterval = 5000;//in ms
    setInterval(() => {
        quote.YahooFinance.updateTickerInfo(socket, stockData);
    }, pollInterval);

    socket.on("saveQuotes", (data) => {
        console.log(data);
    });
});
