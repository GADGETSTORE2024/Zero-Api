//―――――――――――――――――――――――――――――――――――――――――― ┏  Modules ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

const fetch = require("node-fetch");
const cheerio = require("cheerio");
const cookie = require("cookie");
const axios = require('axios')
const FormData = require("form-data");

//―――――――――――――――――――――――――――――――――――――――――― ┏  Api Photooxy ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

async function getBuffer(url, options){
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (err) {
		return err
	}
}

async function post(url, formdata = {}, cookies) {
  let encode = encodeURIComponent;
  let body = Object.keys(formdata)
    .map((key) => {
      let vals = formdata[key];
      let isArray = Array.isArray(vals);
      let keys = encode(key + (isArray ? "[]" : ""));
      if (!isArray) vals = [vals];
      let out = [];
      for (let valq of vals) out.push(keys + "=" + encode(valq));
      return out.join("&");
    })
    .join("&");
  return await fetch(`${url}?${body}`, {
    method: "GET",
    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      Cookie: cookies,
    },
  });
}



async function photooxy(url, text) {
    const newBuildServer = "photooxy.com"; // Ganti dengan URL build server yang baru

    const geturl = await fetch(url, {
        method: "GET",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        },
    });
    const caritoken = await geturl.text();
    let hasilcookie = geturl.headers
        .get("set-cookie")
        .split(",")
        .map((v) => cookie.parse(v))
        .reduce((a, c) => {
            return { ...a, ...c };
        }, {});
    hasilcookie = {
        __cfduid: hasilcookie.__cfduid,
        PHPSESSID: hasilcookie.PHPSESSID,
    };
    hasilcookie = Object.entries(hasilcookie)
        .map(([name, value]) => cookie.serialize(name, value))
        .join("; ");
    const $ = cheerio.load(caritoken);
    const token = $('input[name="token"]').attr("value");
    const form = new FormData();
    if (typeof text === "string") text = [text];
    for (let texts of text) form.append("text[]", texts);
    form.append("submit", "Go");
    form.append("token", token);
    form.append("build_server", newBuildServer);
    form.append("build_server_id", 2);

    const geturl2 = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            Cookie: hasilcookie,
            ...form.getHeaders(),
        },
        body: form.getBuffer(),
    });
    const caritoken2 = await geturl2.text();
    const $$ = cheerio.load(caritoken2);
    const token2 = $$("#form_value").text();
    if (!token2) throw new Error("Token Tidak Ditemukan!!");

    const prosesimage = await fetch(
        `${newBuildServer}/effect/create-image`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": hasilcookie,
            },
            body: JSON.stringify(JSON.parse(token2)),
        }
    );

    const hasil = await prosesimage.json();
    const hassil = `${newBuildServer}/${hasil.image}`;
    const result = await fetch(hassil).then(res => res.buffer());
    return result;
}

module.exports = photooxy