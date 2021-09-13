/*
getNode
*/

SELECT
  id,
  description,
  network_key,
  url,
  created_at,
  updated_at
FROM
  nodes
WHERE
  network_key = ${network_key} AND
  (${node_id} IS NULL OR nodes.id = ${node_id})
LIMIT 1
;
