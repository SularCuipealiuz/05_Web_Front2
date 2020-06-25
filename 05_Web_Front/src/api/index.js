import request from "@/config/request";

// function jsonToFormData(json) {
//   let formData = new FormData();
//   for (let key in json) {
//     formData.append(key, json[key]);
//   }
//   return formData;
// }

// 登入
export function login(data) {
  return request({
    url: "/User/login",
    method: "post",
    data
  });
}

// 秒交易玩法
export function tradeInfo(id) {
  return request({
    url: `/trade/info/${id}`,
    method: "get"
  });
}