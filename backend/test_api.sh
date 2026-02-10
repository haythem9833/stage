#!/bin/bash

echo "================================"
echo "🧪 TEST COMPLET DE L'API"
echo "================================"
echo ""

API_URL="http://127.0.0.1:8000/api"

# Test 1: Login
echo "TEST 1: Login"
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cni.fr","password":"password123"}')

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

# Extraire le token
TOKEN=$(echo "$RESPONSE" | jq -r '.token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
  echo "✅ Token obtenu: ${TOKEN:0:30}..."
  echo ""
  
  # Test 2: Formations
  echo "TEST 2: GET /api/formations"
  curl -s -X GET "$API_URL/formations" \
    -H "Authorization: Bearer $TOKEN" | jq '.[] | {id, titre, duree}' 2>/dev/null || echo "Erreur"
  echo ""
  
  # Test 3: Sessions
  echo "TEST 3: GET /api/sessions"
  curl -s -X GET "$API_URL/sessions" \
    -H "Authorization: Bearer $TOKEN" | jq '.[] | {id, titre, statut}' 2>/dev/null || echo "Erreur"
  echo ""
  
  # Test 4: Profil
  echo "TEST 4: GET /api/auth/profil"
  curl -s -X GET "$API_URL/auth/profil" \
    -H "Authorization: Bearer $TOKEN" | jq . 2>/dev/null || echo "Erreur"
  
else
  echo "❌ Impossible d'obtenir un token"
  echo "Réponse: $RESPONSE"
fi
