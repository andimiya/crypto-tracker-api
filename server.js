const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
const db = require('./db');
const request = require('request');
const rp = require('request-promise');

app.use(express.static("public"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, Access-Control-Allow-Header, Access-Control-Allow-Origin, Access-Control-Allow-Methods");
  res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT, DELETE");
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/api/binance-kline', (req, res) => {
  rp(`https://api.binance.com/api/v1/klines?symbol=${req.query.symbol}&interval=1d`)
    .then((body) => {

      let dataArray = body.replace(/['"]+/g, '');

      dataArray = dataArray.split(',');

      // for (let i = 0; i < dataArray.length; i++) {

      // dataArray.map((body) => {
      //   return console.log(typeof body, 'body')
      // })

      const insertQuery = 'INSERT INTO binance_kline (open_time, open, high, low, close, volume, close_time, quote_asset_volume, number_of_trades, taker_buy_base_asset_volume, taker_buy_quote_asset_volume, ignore ) VALUES ($1)';

      const values = dataArray[0];
      console.log(dataArray[0], 'data array');

      db.query(insertQuery, [values], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json({ data: result.rows });
      })
      // }
    })
    .catch((err) => {
      console.log(err, 'err')
    })
})

app.get('/api/currencies', (req, res) => {
  db.query('SELECT * FROM crypto_types', (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    } else {
      res.json({ data: result.rows });
    }
  });
});

app.get('/api/coinmarket', (req, res) => {
  request(`https://api.coinmarketcap.com/v1/ticker/`, (error, response, body) => {
    res.json(JSON.parse(body));
  });
});

app.get('/api/historical-exchange', (req, res) => {
  request(`https://min-api.cryptocompare.com/data/pricehistorical?fsym=${req.query.symbol}&tsyms=USD&ts=${req.query.purchased_at}`, (error, response, body) => {
    res.json(JSON.parse(body));
  });
});

app.get('/api/crypto-types', (req, res) => {
  const cryptoQuery = 'SELECT DISTINCT crypto_types.name, crypto_types.symbol FROM transactions INNER JOIN crypto_types ON transactions.crypto_type_id = crypto_types.id WHERE user_id = $1';
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: 'User ID required as query param' });
  }
  const values = [user_id];
  db.query(cryptoQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    else {
      res.json({ data: result.rows });
    }
  });
});

app.get('/api/users', (req, res) => {
  const cryptoQuery = 'SELECT * FROM Users WHERE email = $1';
  const { email } = req.query;
  const values = [email];

  if (!email) {
    return res.status(400).json({ error: 'Email required as query param' });
  }
  db.query(cryptoQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: result.rows });
  });
});

app.get('/api/transactions', (req, res) => {
  const cryptoQuery = 'SELECT crypto_types.id AS crypto_name, transactions.id AS transaction_id, usd_invested, coin_purchased, exchange_rate, updated_at, purchased_at, crypto_types.name FROM crypto_types LEFT OUTER JOIN transactions ON crypto_types.id = transactions.crypto_type_id WHERE user_id = $1';
  const { user_id } = req.query;
  const values = [user_id];

  if (!user_id) {
    return res.status(400).json({ error: 'User ID required as query param' });
  }
  db.query(cryptoQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: result.rows });
  });
});

app.get('/api/crypto-types/sums', (req, res) => {
  const cryptoQuery = 'SELECT crypto_types.name, SUM(usd_invested) AS usd_invested, SUM(coin_purchased) AS coin_purchased FROM Transactions INNER JOIN crypto_types ON transactions.crypto_type_id = crypto_types.id GROUP BY crypto_types.name';
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID required as query param' });
  }
  db.query(cryptoQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: result.rows });
  });
});

app.post('/api/new-user', (req, res) => {
  const insertQuery = 'INSERT INTO Users (first_name, last_name, email) VALUES ($1, $2, $3) RETURNING id, email';
  const { first_name, last_name, email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' })
  }
  const values = [first_name, last_name, email];
  db.query(insertQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ data: result.rows });
  });
});

app.post('/api/transactions', (req, res) => {
  const insertQuery = 'INSERT INTO Transactions (crypto_type_id, user_id, usd_invested, coin_purchased, exchange_rate, purchased_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, usd_invested, purchased_at';
  const { crypto_id, user_id, usd_invested, coin_purchased, exchange_rate, purchased_at } = req.body;
  if (!crypto_id || !user_id || !usd_invested || !coin_purchased || !exchange_rate) {
    return res.status(400).json({ error: 'Entries required' })
  }
  const values = [crypto_id, user_id, usd_invested, coin_purchased, exchange_rate, purchased_at];
  db.query(insertQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ data: result.rows, status: 200 });
  });
});

app.delete('/api/transactions', (req, res) => {
  const deleteQuery = 'DELETE FROM Transactions WHERE user_id = $1 AND id = $2';
  const { user_id, id } = req.body;

  if (!user_id || !id) {
    return res.status(400).json({ error: 'User ID required as query param' });
  }
  const values = [user_id, id];

  db.query(deleteQuery, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ data: result, status: 200 });
  });
})

app.listen(PORT, function () {
  console.log('Server started on', PORT);
})

module.exports = app;
