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
  open_time bigint UNIQUE,
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

COMMIT;