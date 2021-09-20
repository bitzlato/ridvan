/*
getNode
*/

SELECT
  id::INTEGER,
  description,
  network_key,
  url,
  to_json(created_at)#>>'{}' AS created_at,
  to_json(updated_at)#>>'{}' AS updated_at
FROM
  nodes
WHERE
  network_key = ${network_key} AND
  (${node_id} IS NULL OR nodes.id = ${node_id})
LIMIT 1
;
