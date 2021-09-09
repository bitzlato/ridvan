# Ridvan

Light protecting secrets gateway to Ethereum nodes. Uses hashicorp vault to save encrypted private keys.

## Запуск

```bash
VAULT_HOST=172... \ 
VAULT_TOKEN=changeme \
PGDATABASE=ridvan_production \
PGHOST=172... \
PGPORT=... \ # Не обязательный
PGUSER=... \
```

## Список endpoint-ов

### Этап I

* `POST /transactions` - создаёт транзакцию, поля как в `sendrawtransaction`, поле `network_key` (обязательно), поле `node_id` ID ноды через которую надо отправить запрос (не обязательно, выбирается шлюзом автоматически). Возвращает id транзакции

### Этап II

* `POST /addresses/generate` - генерирует адрес в сети, сохраняет его в базе и возвращает его значение. поля:  `network_key` (обязательный, имя сети `eth-mainnet` и тп),`owner_kind` (обязательный, `user` или `system`)


## Логирование

Шлюз логирует каждый запрос и ответ в STDOUT

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
