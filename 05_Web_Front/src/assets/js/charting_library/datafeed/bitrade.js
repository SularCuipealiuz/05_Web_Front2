import store from '@/config/store.js'

let $ = require('jquery');
let WebsocketFeed = function (coin, eventBus) {
  this.coin = coin;
  this.lastBar = null;
  // this.currentBar = null;
  // this.subscribe = true;
  this.history = {}
  this._subs = []
  this.$bus = eventBus
};


WebsocketFeed.prototype.onReady = function (callback) {
  console.log('=====onReady running')

  let config = {};
  config.exchanges = [];
  config.supported_resolutions = ["1", "3", "5", "30", "60", "240", "720", "1D"],
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
    "supported_resolutions": ["1", "3", "5", "30", "60", "240", "720", "1D"],
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

  this._subs = []
  let bars = [];
  let _this = this;

  const array = store.getters.getKlineHistory

  for (let i = 0; i < array.length; i++) {
    bars = array.map(e => {
      return {
        time: parseFloat(e.kTime),
        open: parseFloat(e.open),
        high: parseFloat(e.top),
        low: parseFloat(e.low),
        close: parseFloat(e.close),
        volume: parseFloat(e.vol)
      }
    })
  }
  if (firstDataRequest) {
    _this.lastBar = bars[bars.length - 1]
    _this.history[symbolInfo.name] = {lastBar: _this.lastBar}
    // _this.currentBar = _this.lastBar;
  }

  if (bars.length) {
    onHistoryCallback(bars, {noData: false});
  } else {
    onHistoryCallback(bars, {noData: true});
  }

  console.log('window.tvWidget', window.tvWidget)
};

WebsocketFeed.prototype.subscribeBars = function (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
  console.log('=====subscribeBars runnning')
  const _this = this

  let channel = symbolInfo.name.split(/[:/]/)
  const exchange = channel[0] === 'GDAX' ? 'Coinbase' : channel[0]
  const to = channel[2]
  const from = channel[1]

  const channelString = `0~${exchange}~${from}~${to}`

  let newSub = {
    channelString,
    subscriberUID,
    resolution,
    symbolInfo,
    lastBar: _this.history[symbolInfo.name].lastBar,
    listener: onRealtimeCallback,
  }
  this._subs.push(newSub)

  this.$bus.$on("KlineNow", function (res) {
    const sub = _this._subs.find(e => e.channelString === channelString)
    if (sub) {
      let _lastBar = updateBar(res, sub)
      sub.listener(_lastBar)
      sub.lastBar = _lastBar
    }
  })

  function updateBar(data, sub) {
    let lastBar = sub.lastBar
    let resolution = sub.resolution
    if (resolution.includes('D')) {
      // 1 day in minutes === 1440
      resolution = 1440
    } else if (resolution.includes('W')) {
      // 1 week in minutes === 10080
      resolution = 10080
    }
    let coeff = resolution * 60
    // console.log({coeff})
    let rounded = Math.floor((data.current.kTime / 1000) / coeff) * coeff
    let lastBarSec = lastBar.time / 1000
    let _lastBar

    if (rounded > lastBarSec) {
      // create a new candle, use last close as open **PERSONAL CHOICE**
      _lastBar = {
        time: rounded * 1000,
        open: lastBar.close,
        high: lastBar.close,
        low: lastBar.close,
        close: data.current_24.lastPrice,
        volume: data.current.vol
      }
    } else {
      // update lastBar candle!
      if (data.current_24.lastPrice < lastBar.low) {
        lastBar.low = data.current_24.lastPrice
      } else if (data.current_24.lastPrice > lastBar.high) {
        lastBar.high = data.current_24.lastPrice
      }

      lastBar.volume = data.current.vol
      lastBar.close = data.current_24.lastPrice
      _lastBar = lastBar
    }
    return _lastBar
  }

  // let _this = this;
  // this.stompClient.subscribe('/topic/market/trade/' + symbolInfo.name, function (msg) {
  //   let resp = JSON.parse(msg.body);
  //   if (_this.lastBar != null && resp.length > 0) {
  //     let price = resp[resp.length - 1].price;
  //     _this.lastBar.close = price;
  //     if (price > _this.lastBar.high) {
  //       _this.lastBar.high = price;
  //     }
  //     if (price < _this.lastBar.low) {
  //       _this.lastBar.low = price;
  //     }
  //     onRealtimeCallback(_this.lastBar);
  //   }
  // });
  // this.stompClient.subscribe('/topic/market/kline/' + symbolInfo.name, function (msg) {
  //   if (resolution != "1") return;
  //   if (_this.currentBar != null) onRealtimeCallback(_this.currentBar);
  //   let resp = JSON.parse(msg.body);
  //   _this.lastBar = {
  //     time: resp.time,
  //     open: resp.openPrice,
  //     high: resp.highestPrice,
  //     low: resp.lowestPrice,
  //     close: resp.closePrice,
  //     volume: resp.volume
  //   };
  //   _this.currentBar = _this.lastBar;
  //   onRealtimeCallback(_this.lastBar);
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
