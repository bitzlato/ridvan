# Ridvan

Light protecting secrets gateway to Ethereum nodes. Uses hashicorp vault to save encrypted private keys.

## Подготовка к запуску и тестовый запуск

```sh
npm i

npm run dockertest
```

## Vault policy

```hcl
path "transit/keys/ridvan_*" {
  capabilities = ["create", "read", "list"]
}

path "transit/encrypt/ridvan_*" {
  capabilities = ["create", "read", "update"]
}

path "transit/decrypt/ridvan_*" {
  capabilities = ["create", "read", "update"]
}
```

## Запуск

```bash
PORT=4444 \
TOKEN_SECRET=somesecret \
VAULT_ENDPOINT=http://localhost:8200 \
VAULT_TOKEN=changeme \
VAULT_ENCRYPTION_KEY=ridvan_address \
PG_HOST=localhost \
PG_PORT=5432 \
PG_DATABASE=postgres \
PG_USER=postgres \
PG_PASSWORD=postgres \
BUGSNAG_API_KEY=5d853b7e... \
npm run start
```

## Примеры curl-запросов

Подготовка токена

запускаем node и выполняем следующий код:

```js
console.log(require('jsonwebtoken').sign({}, 'somesecret', { expiresIn: '1d' }));
```

В console выведется TOKEN, который мы будем подставлять в заголовок запроса.

Получение состояния vault_token

```sh
curl \
    -H "Authorization: Bearer {TOKEN}" \
    -X GET \
    http://127.0.0.1:4444/vault_token
```

Генерация нового адреса

```sh
curl \
    -H "Authorization: Bearer {TOKEN}" \
    -H "Content-Type: application/json" \
    -X POST \
    -d '{"network_key":"ropsten","owner_kind":"user"}' \
    http://127.0.0.1:4444/addresses/generate
```

Добавление адреса

```sh
curl \
    -H "Authorization: Bearer {TOKEN}" \
    -H "Content-Type: application/json" \
    -X POST \
    -d '{"network_key":"ropsten","address":"0xbc68B88775B929b7e11bd6cdb213A4bd7A8eeD9d","pk":"0xe74c2b4042d0bbc27abf0ff84a69ff16690f154334a9f627d2433013a01e5030","owner_kind":"user","created_at":"2021-09-10 19:15:33.243271"}' \
    http://127.0.0.1:4444/addresses
```

Добавим воторой адрес, чтобы следующий запрос "Создание транзакции" выполнился.

```sh
curl \
    -H "Authorization: Bearer {TOKEN}" \
    -H "Content-Type: application/json" \
    -X POST \
    -d '{"network_key":"ropsten","address":"0xD80a740Bd99f2e45539CB7f015A5cd63320E3d22","pk":"0x23bec4faf7efb46c199c6a1879b942d10a7c06cb7dac3713e9d45b42f95f9541","owner_kind":"user","created_at":"2021-09-10 19:15:33.243271"}' \
    http://127.0.0.1:4444/addresses
```

Создание транзакции

```sh
curl \
    -H "Authorization: Bearer {TOKEN}" \
    -H "Content-Type: application/json" \
    -X POST \
    -d '{"network_key":"ropsten","params":{"to":"0xbc68B88775B929b7e11bd6cdb213A4bd7A8eeD9d","from":"0xD80a740Bd99f2e45539CB7f015A5cd63320E3d22","value":"10000000000000","gas":"21000"}}' \
    http://127.0.0.1:4444/transactions
```

## Список endpoint-ов

* `POST /transactions` - создаёт транзакцию, поля как в `sendrawtransaction`, поле `network_key` (обязательно), поле `node_id` ID ноды через которую надо отправить запрос (не обязательно, выбирается шлюзом автоматически). Возвращает id транзакции
* `POST /addresses/generate` - генерирует адрес в сети, сохраняет его в базе и возвращает его значение. поля:  `network_key` (обязательный, имя сети `eth-mainnet` и тп),`owner_kind` (обязательный, `user` или `system`)


## Логирование

Шлюз логирует каждый запрос и ответ в `STDOUT`

## Отладка

Используется bugsnag

## Стандарты 

https://jsonapi.org

## Ошибки

Ошибки шлюза возвращаются с соответсвующим HTTP статусом. Ошибки ноды возвращаются со статусом 201 и соответсвующей структурой данных содержащей эти ошибки.

## Планы на будущее

* `POST /addresses` - добавляет в базу уже известный адрес, поля: `network_key` (обязательный, имя сети `eth-mainnet` и тп), `address` (обязательный), `private_key` (обязательный), `owner_kind` (обязательный, `user` или `system`)
* `GET /vault_token` - возвращает `token accessor` и `ttl`

---

Ридван – ангел, хранящий Рай в исламе
