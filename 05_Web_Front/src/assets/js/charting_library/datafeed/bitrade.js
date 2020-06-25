import store from '@/config/store.js'

let $ = require('jquery');
let WebsocketFeed = function (coin) {
  this.coin = coin;
  this.lastBar = null;
  // this.currentBar = null;
  // this.subscribe = true;
};

WebsocketFeed.prototype.onReady = function (callback) {
  console.log('=====onReady running')

  let config = {};
  config.exchanges = [];
  config.supported_resolutions = ["1", "5", "15", "30", "60", "240", "1D", "1W", "1M"];
  config.supports_group_request = false;
  config.supports_marks = false;
  config.supports_search = false;
  config.supports_time = true;
  config.supports_timescale_marks = false;

  // $("#" + window.tvWidget.id).contents().on("click", ".date-range-list>a", function () {
  //   if (window.tvWidget) {
  //     if ($(this).html() == "分时") {
  //       $(this).parent().addClass("real-op").removeClass("common-op");
  //       window.tvWidget.chart().setChartType(3);
  //     } else {
  //       $(this).parent().addClass("common-op").removeClass("real-op");
  //       window.tvWidget.chart().setChartType(1);
  //     }
  //   }
  // });

  setTimeout(function () {
    callback(config);
  }, 0);
};

WebsocketFeed.prototype.resolveSymbol = function (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
  // let data = {"name":this.coin.symbol,"exchange-traded":"","exchange-listed":"","minmov":1,"minmov2":0,"pointvalue":1,"has_intraday":true,"has_no_volume":false,"description":this.coin.symbol,"type":"bitcoin","session":"24x7","supported_resolutions":["1","5","15","30","60","240","1D","1W","1M"],"pricescale":500,"ticker":"","timezone":"Asia/Shanghai"};
  // let data = {"name":this.coin.symbol,"exchange-traded":"","exchange-listed":"","minmov":1,"volumescale":10000,"has_daily":true,"has_weekly_and_monthly":true,"has_intraday":true,"description":this.coin.symbol,"type":"bitcoin","session":"24x7","supported_resolutions":["1","5","15","30","60","240","1D","1W","1M"],"pricescale":100,"ticker":"","timezone":"Asia/Shanghai"};

  console.log('======resolveSymbol running')
  let data = {
    "name": this.coin.symbol,
    "exchange-traded": "",
    "exchange-listed": "",
    "minmov": 1,
    "volumescale": 10000,
    "has_daily": true,
    "has_weekly_and_monthly": true,
    "has_intraday": true,
    "description": this.coin.symbol,
    "type": "bitcoin",
    "session": "24x7",
    "supported_resolutions": ["1", "5", "15", "30", "60", "1D", "1W", "1M"],
    "pricescale": Math.pow(10, this.scale || 2),
    "ticker": "",
    "timezone": "Asia/Shanghai"
  };
  setTimeout(function () {
    onSymbolResolvedCallback(data);
  }, 0);
};

WebsocketFeed.prototype.getBars = function (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
  console.log('=====getBars running')
  let bars = [];
  let that = this;

  // TODO 拿store資料

  const array = store.getters.getKlineHistory

  for (let i = 0; i < array.length; i++) {
    bars = array.map(e => {
      return {
        time: parseInt(e.kTime),
        open: parseInt(e.open),
        high: parseInt(e.top),
        low: parseInt(e.low),
        close: parseInt(e.close),
        volume: parseInt(e.vol)
      }
    })
  }

  if (firstDataRequest) {
    that.lastBar = bars[bars.length - 1]
    // that.currentBar = that.lastBar;
  }

  if (bars.length) {
    onHistoryCallback(bars, {noData: false});
  } else {
    onHistoryCallback(bars, {noData: true});
  }
};

WebsocketFeed.prototype.subscribeBars = function (symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback) {
  console.log('=====subscribeBars runnning')

  // let that = this;
  // this.stompClient.subscribe('/topic/market/trade/' + symbolInfo.name, function (msg) {
  //   let resp = JSON.parse(msg.body);
  //   if (that.lastBar != null && resp.length > 0) {
  //     let price = resp[resp.length - 1].price;
  //     that.lastBar.close = price;
  //     if (price > that.lastBar.high) {
  //       that.lastBar.high = price;
  //     }
  //     if (price < that.lastBar.low) {
  //       that.lastBar.low = price;
  //     }
  //     onRealtimeCallback(that.lastBar);
  //   }
  // });
  // this.stompClient.subscribe('/topic/market/kline/' + symbolInfo.name, function (msg) {
  //   if (resolution != "1") return;
  //   if (that.currentBar != null) onRealtimeCallback(that.currentBar);
  //   let resp = JSON.parse(msg.body);
  //   that.lastBar = {
  //     time: resp.time,
  //     open: resp.openPrice,
  //     high: resp.highestPrice,
  //     low: resp.lowestPrice,
  //     close: resp.closePrice,
  //     volume: resp.volume
  //   };
  //   that.currentBar = that.lastBar;
  //   onRealtimeCallback(that.lastBar);
  // });
};

WebsocketFeed.prototype.unsubscribeBars = function (subscriberUID) {
  console.log('=====unsubscribeBars running')

  this.subscribe = false;
}

WebsocketFeed.prototype.periodLengthSeconds = function (resolution, requiredPeriodsCount) {
  let daysCount = 0;
  if (resolution === 'D') {
    daysCount = requiredPeriodsCount;
  } else if (resolution === 'M') {
    daysCount = 31 * requiredPeriodsCount;
  } else if (resolution === 'W') {
    daysCount = 7 * requiredPeriodsCount;
  } else if (resolution === 'H') {
    daysCount = requiredPeriodsCount * resolution / 24;
  } else {
    daysCount = requiredPeriodsCount * resolution / (24 * 60);
  }

  return daysCount * 24 * 60 * 60;
};

export default {WebsocketFeed}
