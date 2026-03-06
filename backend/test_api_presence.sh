#!/bin/bash
# Test the presence endpoint

# 1. Get a valid token by logging in as formateur
TOKEN_RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"formateur1@cni.fr","password":"password123"}')

echo "Login response:"
echo $TOKEN_RESPONSE
echo ""

TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token // empty')
if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

echo "Token: $TOKEN"
echo ""

# 2. Test the presences batch endpoint
echo "Testing presences/batch endpoint..."
RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/formations/1/presences/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "date": "2026-03-04",
    "presences": [
      {
        "inscription_id": 1,
        "statut": "present"
      }
    ]
  }')

echo "Response:"
echo $RESPONSE | jq .

