const ulti = require("../utils");
const agents = [
  {
    agent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:60.0) Gecko/20100101 Firefox/60.0"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:60.0) Gecko/20100101 Firefox/60.0"
  },
  {
    agent: "Mozilla/5.0 (Windows NT 6.1; rv:60.0) Gecko/20100101 Firefox/60.0"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:60.0) Gecko/20100101 Firefox/60.0"
  },
  {
    agent: "Mozilla/5.0 (Windows NT 10.0; rv:60.0) Gecko/20100101 Firefox/60.0"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 6.2; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 6.2; WOW64; rv:60.0) Gecko/20100101 Firefox/60.0"
  },
  {
    agent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:60.0) Gecko/20100101 Firefox/60.0"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko"
  },
  {
    agent: "Opera/9.80 (Windows NT 6.2; Win64; x64) Presto/2.12 Version/12.16"
  },
  {
    agent: "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)"
  },
  {
    agent:
      "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0"
  },
  {
    agent: "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko"
  },
  {
    agent:
      "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1"
  },
  {
    agent:
      "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)"
  },
  { agent: "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)" },
  {
    agent:
      "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko"
  },
  { agent: "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)" },
  { agent: "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)" },
  {
    agent:
      "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)"
  },
  {
    agent:
      "Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1; 125LA; .NET CLR 2.0.50727; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022)"
  },
  {
    agent:
      "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322) "
  },
  { agent: "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0)" },
  {
    agent: "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko"
  },
  { agent: "Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1) " },
  {
    agent:
      "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko"
  },
  {
    agent:
      "Mozilla/5.0 (Linux; U; Android 2.2) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"
  },
  {
    agent:
      "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko; googleweblight) Chrome/38.0.1025.166 Mobile Safari/535.19"
  },
  {
    agent:
      "Mozilla/5.0 (Linux; Android 9; SM-G960F Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36"
  },
  {
    agent:
      "Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36"
  },
  {
    agent: "Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18"
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36 OPR/43.0.2442.991 "
  },
  {
    agent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36 OPR/56.0.3051.52"
  },
  { agent: "Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14" },
  {
    agent:
      "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36 OPR/42.0.2393.94"
  }
];
const getRandomAgents = () => {
  const ranAgent = ulti.getRandom(agents);
  return ranAgent.agent;
};
module.exports.agents = agents;
module.exports.getRandomAgents = getRandomAgents;
