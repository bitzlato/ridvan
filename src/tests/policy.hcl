path "transit/keys/ridvan_*" {
  capabilities = ["create", "read", "list"]
}

path "transit/encrypt/ridvan_*" {
  capabilities = ["create", "read", "update"]
}

path "transit/decrypt/ridvan_*" {
  capabilities = ["create", "read", "update"]
}
