'use strict';
const axios = require('axios');
const crypto = require('crypto'); // Para anonimizar IPs

let ipAddresses = [];

function anonymizeIP(ip) {
  const hash = crypto.createHash('sha256');
  hash.update(ip);
  return hash.digest('hex').slice(0, 16); // Genera un hash truncado de la IP
}

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(function (req, res){
      const stocks = req.query.stock;
      const like = req.query.like === 'true';
      const stockArray = Array.isArray(stocks) ? stocks : [stocks];
      const ip = req.ip;

      // Anonimizar IP
      const anonymizedIp = anonymizeIP(ip);

      // Lógica para obtener el precio de las acciones y manejar "likes"
      const fetchStockData = async () => {
        const stockData = await Promise.all(stockArray.map(async (stock) => {
          const response = await axios.get(`https://api.example.com/stock/${stock}`);
          const price = response.data.price;
          const likes = like && !ipAddresses.includes(anonymizedIp) ? 1 : 0;
          if (like && !ipAddresses.includes(anonymizedIp)) {
            ipAddresses.push(anonymizedIp);
          }
          return { stock, price, likes };
        }));

        return stockData;
      };

      fetchStockData()
        .then(data => res.json({ stockData: data }))
        .catch(err => res.status(500).send('Error fetching stock data'));
    });
};
