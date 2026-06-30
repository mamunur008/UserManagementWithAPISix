#!/usr/bin/env bash
set -euo pipefail
LOGIN=$(curl -s -X POST http://localhost:9080/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin@local.test","password":"Admin@12345"}')
echo "$LOGIN"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
SESSION=$(echo "$LOGIN" | sed -n 's/.*"sessionId":"\([^"]*\)".*/\1/p')
curl -s http://localhost:9080/api/me -H "Authorization: Bearer $TOKEN" -H "X-Session-Id: $SESSION" | jq .
curl -s http://localhost:9080/api/users -H "Authorization: Bearer $TOKEN" -H "X-Session-Id: $SESSION" | jq .
