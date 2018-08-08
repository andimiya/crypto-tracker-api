### Running Locally

1.  Create a local SQL db
1.  Copy the `.env.example` file and rename to `.env`
1.  Update the variables in `.env` to your own SQL db credentials
1.  Copy the contents of `createTables.sql` and run the script in your SQL instance to create the tables
1.  Seed all of the crypto types. Run the `seed-Crypto_Types.sql` query in your SQL instance

Run the API Locally:

- Dependencies: `node 7.10`
- Update `.env`
- `docker run --env-file .env -p 8080:8080 -d andimiya/crypto-api`

Hosted EC2 API Endpoint:
`ec2-34-212-0-41.us-west-2.compute.amazonaws.com:8080`

Hosted Postgres RDS DB:
`cryptodb.c745jm1wgcw3.us-west-2.rds.amazonaws.com`

API Deployment:

- Build from local
  - `docker build --no-cache -t andimiya/crypto-api .`
- Push from local to Docker
  - `docker push andimiya/crypto-api`
- ssh into EC2 instance
  - `ssh ec2-user@34.212.0.41 -i ~/.ssh/AndreaWestKeyPair.pem`
- Stop the running docker container
  - Pull down the latest docker image (`docker pull andimiya/crypto-api`)
  - Run `docker run --env-file .env -p 8080:8080 -d andimiya/crypto-api`

Table Relations:

![image](https://user-images.githubusercontent.com/20802421/32694620-b92874de-c6e8-11e7-89a6-c8d395f7b39e.png)
