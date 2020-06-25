import Vue from "vue";

const WSS_URL = process.env.WS_HOST;

let Socket = null;

export function createSocket() {
  Socket = new WebSocket(WSS_URL);
  Socket.onerror = onerrorWS;
  Socket.onclose = oncloseWS;

  Socket.binaryType = "blob";
  return Socket;
}

export function onerrorWS() {
  // eslint-disable-next-line no-undef
  Socket.close();
  createSocket();
}

export function oncloseWS() {
  console.log("已斷開");
}

export function getWebSocket() {
  return Socket;
}