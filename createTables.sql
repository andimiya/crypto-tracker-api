START TRANSACTION;

CREATE TABLE Users (
  id serial primary key,
  first_name text default null,
  last_name text default null,
  email text not null UNIQUE
);

CREATE TABLE Crypto_Types (
  id serial primary key,
  symbol text not null,
  name text not null
);

CREATE TABLE Transactions (
  id serial primary key,
  crypto_type_id integer references Crypto_Types(id),
  user_id integer references Users(id),
  usd_invested float8 not null,
  coin_purchased float8 not null,
  exchange_rate float8 not null,
  created_at timestamp,
  updated_at timestamp,
  purchased_at timestamp
);

CREATE TABLE binance_kline (
  id serial primary key,
  open_time bigint,
  open float,
  high float,
  low float,
  close float,
  volume float,
  close_time bigint,
  quote_asset_volume float,
  number_of_trades float,
  taker_buy_base_asset_volume float,
  taker_buy_quote_asset_volume float,
  ignore float
);

-- CREATE TABLE binance_kline (
--   id serial primary key,
--   crypto_type_id integer references Crypto_Types(id),
--   date timestamp,
--   high float8,
--   low float8,
--   close float8,
--   mid float8,
--   pred_sell float8,
--   pred_buy float8,
--   high_close_percent decimal(5,4),
--   sell_percent integer,
--   buy_percent integer,
--   decision integer,
--   daily_high_low decimal(5,4),
--   close_spread decimal(5,4),
--   high_close float8
-- );

COMMIT;