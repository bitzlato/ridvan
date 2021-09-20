/*
addAddress
*/

INSERT INTO public.addresses (
  network_key,
  address,
  key_encrypted,
  owner_kind,
  created_at
) VALUES (
  ${network_key},
  ${address},
  ${key_encrypted},
  ${owner_kind},
  ${created_at}
)
RETURNING
  network_key,
  address,
  key_encrypted,
  owner_kind,
  to_json(created_at)#>>'{}' AS created_at
;
