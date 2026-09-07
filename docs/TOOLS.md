# Especificación Técnica de Tools REST para ElevenLabs

Esta tabla y especificación detalla cada endpoint REST expuesto por el backend de Banco Visionario para ser consumido como Tool por ElevenLabs o integraciones directas.

---

## Matriz de Tools Registrados

| Tool Name | Método | Endpoint | Autenticación | Propósito |
|---|---|---|---|---|
| `get_customer_profile` | `GET` | `/api/customer/profile` | Bearer Token | Identificar cliente y validar sesión |
| `get_accounts` | `GET` | `/api/accounts` | Bearer Token | Consultar cuentas y saldos |
| `get_transactions` | `GET` | `/api/transactions` | Bearer Token | Consultar últimos movimientos |
| `verify_transaction` | `POST` | `/api/transactions/{id}/verify` | Bearer Token | Obtener detalle específico de un movimiento |
| `report_fraud` | `POST` | `/api/fraud/report` | Bearer Token | Crear caso oficial de reclamo |
| `block_card` | `POST` | `/api/cards/{id}/block` | Bearer Token | Bloquear temporalmente una tarjeta |
| `get_loans` | `GET` | `/api/loans` | Bearer Token | Consultar estado de préstamos activos |
| `human_handoff` | `POST` | `/api/handoff` | Bearer Token | Derivar sesión a asesor humano |
| `audit_event` | `POST` | `/api/audit/event` | Bearer Token | Registrar telemetría en bitácora de auditoría |

---

## Detalle de Payloads

### 1. `POST /api/transactions/{id}/verify`
**Request Path Param**: `id` = `TX-003` o `300`  
**Response JSON**:
```json
{
  "transaction_id": "TX-003",
  "merchant": "ATM Centro",
  "amount": 300.00,
  "date": "2026-09-04",
  "time": "18:42",
  "type": "ATM_WITHDRAWAL",
  "card_last4": "4821",
  "status": "COMPLETED"
}
```

### 2. `POST /api/fraud/report`
**Request Body JSON**:
```json
{
  "customer_id": "CUS-001",
  "transaction_id": "TX-003",
  "reason": "UNRECOGNIZED_TRANSACTION"
}
```
**Response JSON**:
```json
{
  "case_id": "FRA-20260905-00421",
  "status": "INVESTIGATION",
  "department": "FRAUD_PREVENTION",
  "estimated_resolution": "24-48 hours"
}
```

### 3. `POST /api/cards/{id}/block`
**Request Path Param**: `id` = `CARD-001`  
**Response JSON**:
```json
{
  "card_id": "CARD-001",
  "last4": "4821",
  "status": "BLOCKED",
  "message": "Tu tarjeta ha sido bloqueada temporalmente para proteger tu cuenta."
}
```

### 4. `POST /api/handoff`
**Request Body JSON**:
```json
{
  "customer_id": "CUS-001",
  "reason": "CUSTOMER_REQUEST",
  "conversation_summary": "Cliente reportó retiro no reconocido de $300, tarjeta 4821 bloqueada.",
  "case_id": "FRA-20260905-00421"
}
```
**Response JSON**:
```json
{
  "status": "TRANSFERRED",
  "queue": "CUSTOMER_SERVICE",
  "reference": "HANDOFF-001"
}
```
