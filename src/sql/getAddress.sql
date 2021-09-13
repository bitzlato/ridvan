/*
getAddress
*/

SELECT 
  network_key,
  address,
  key_encrypted,
  owner_kind,
  created_at
FROM
  addresses
WHERE
  address = ${address}
;
