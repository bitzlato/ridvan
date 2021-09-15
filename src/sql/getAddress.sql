/*
getAddress
*/

SELECT 
  network_key,
  address,
  key_encrypted,
  owner_kind,
  to_json(created_at)#>>'{}' AS created_at
FROM
  addresses
WHERE
  network_key = ${network_key} AND
  address = ${address}
;
