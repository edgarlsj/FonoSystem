#!/bin/bash

# Script para testar a API de Prescrições
# Uso: ./test_prescricao_api.sh <paciente_id> <jwt_token>

PACIENTE_ID=${1:-6}
JWT_TOKEN=${2:-""}
API_URL="http://localhost:8080/api/v1/pacientes/$PACIENTE_ID/prescricoes"

echo "🔧 Testando API de Prescrições"
echo "================================"
echo "URL: $API_URL"
echo "Paciente ID: $PACIENTE_ID"
echo ""

# Teste 1: Requisição com todos os campos obrigatórios
echo "📤 Teste 1: POST com campos corretos"
echo "-----------------------------------"

PAYLOAD=$(cat <<'EOF'
{
  "dataPrescricao": "2026-04-14",
  "titulo": "Exercícios de Motricidade",
  "descricaoExercicios": "Descrição detalhada dos exercícios com mais de dez caracteres para passar na validação"
}
EOF
)

echo "Payload enviado:"
echo "$PAYLOAD"
echo ""
echo "Resposta:"

if [ -z "$JWT_TOKEN" ]; then
  echo "⚠️  Sem JWT Token (pode dar 401 Unauthorized)"
  curl -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    -w "\nHTTP Status: %{http_code}\n" \
    -v
else
  echo "✅ Com JWT Token"
  curl -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -d "$PAYLOAD" \
    -w "\nHTTP Status: %{http_code}\n" \
    -v
fi

echo ""
echo "================================"
echo ""

# Teste 2: Teste GET (listar prescrições)
echo "📥 Teste 2: GET /prescricoes (listar)"
echo "-----------------------------------"
curl -X GET "$API_URL" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "================================"
echo "✅ Testes concluídos!"
echo ""
echo "Próximas ações:"
echo "1. Verifique os status HTTP acima"
echo "2. Se 401 → JWT Token expirado ou inválido"
echo "3. Se 400 → Validação de dados falhando"
echo "4. Se 201 → Sucesso! ✅"
