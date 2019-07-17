const ProxyChain = require("proxy-chain");
const ulti = require("../utils");
const ips = [
  {
    ip: "p1.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p2.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p4.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p5.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p10.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p12.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p14.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p15.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "s4.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "123.31.45.40",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p20.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p23.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "s9.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "172.245.249.126",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "42.112.30.20",
    port: "3100",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "42.112.30.23",
    port: "3101",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "42.112.30.30",
    port: "3102",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "42.112.30.66",
    port: "3103",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "149.28.133.243",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v1.vietpn.co",
    port: "3100",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v2.vietpn.co",
    port: "3101",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v3.vietpn.co",
    port: "3102",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v4.vietpn.co",
    port: "3103",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v5.vietpn.co",
    port: "3104",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v6.vietpn.co",
    port: "3105",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v7.vietpn.co",
    port: "3106",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v8.vietpn.co",
    port: "3107",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v9.vietpn.co",
    port: "3108",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v10.vietpn.co",
    port: "3109",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v11.vietpn.co",
    port: "3110",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v12.vietpn.co",
    port: "3111",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v13.vietpn.co",
    port: "3112",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v14.vietpn.co",
    port: "3113",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v15.vietpn.co",
    port: "3114",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v16.vietpn.co",
    port: "3115",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v17.vietpn.co",
    port: "3116",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v18.vietpn.co",
    port: "3117",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v19.vietpn.co",
    port: "3118",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v20.vietpn.co",
    port: "3119",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v21.vietpn.co",
    port: "3120",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v22.vietpn.co",
    port: "3121",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v23.vietpn.co",
    port: "3122",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v24.vietpn.co",
    port: "3123",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v25.vietpn.co",
    port: "3124",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v26.vietpn.co",
    port: "3125",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v27.vietpn.co",
    port: "3126",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v28.vietpn.co",
    port: "3127",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v29.vietpn.co",
    port: "3128",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v30.vietpn.co",
    port: "3129",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v31.vietpn.co",
    port: "3130",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v32.vietpn.co",
    port: "3131",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v33.vietpn.co",
    port: "3100",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p16.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p22.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p23.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p3.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p21.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "s7.vietpn.co",
    port: "8899",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "s8.vietpn.co",
    port: "8899",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "s5.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "103.216.114.117",
    port: "8899",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "p6.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v34.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "221.132.32.243",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "222.255.122.35",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "203.162.2.206",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v35.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v36.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v37.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v38.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v39.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v40.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "v41.vietpn.co",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  },
  {
    ip: "jp.cdn.vietpn.com",
    port: "1808",
    userName: "Ntung",
    pass: "844129"
  }
];
const getRandomProxy = () => {
  const ranProxie = ulti.getRandom(ips);
  const strProxy = `http://${ranProxie.userName}:${ranProxie.pass}@${
    ranProxie.ip
  }:${ranProxie.port}`;
  return strProxy;
};
const anonymizeProxy = async () => {
  const randomProxy = getRandomProxy();
  return await ProxyChain.anonymizeProxy(randomProxy);
};
module.exports.ips = ips;
module.exports.getRandomProxy = getRandomProxy;
module.exports.anonymizeProxy = anonymizeProxy;
