/*
addNode
*/

INSERT INTO public.nodes (
  description,
  network_key,
  url
) VALUES (
  ${description},
  ${network_key},
  ${url}
)
RETURNING
  id,
  description,
  network_key,
  url,
  to_json(created_at)#>>'{}' AS created_at,
  to_json(updated_at)#>>'{}' AS updated_at
;
