## Description

Nestjs Fastify Module Scaffolding build using Nestjs, Fastify, RabbitMQ, Redis, and MongoDB

## Installation

```bash
$ npm install

# Configure env by copying env.[environtment] to .env
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run build
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## User Command CLI

```bash
# help
$ npx nestjs-command --help

# npx nestjs-command get:users
$ npx nestjs-command get:users

# npx nestjs-command create:user <name> <email> <password>
$ npx nestjs-command create:user admin admin@gmail.com password

# npx nestjs-command update:user <id> <name> <email>
$ npx nestjs-command update:user 66c72dcce77bbe79c90cf6cc admin_updated admin_updated@gmail.com
```

## License

Nest is [MIT licensed](LICENSE).
