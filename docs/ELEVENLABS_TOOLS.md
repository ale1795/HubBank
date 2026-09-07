# Catálogo Oficial de Tools REST para ElevenLabs (Banco Visionario)

Este documento detalla cada herramienta REST expuesta por el backend de Banco Visionario para ser consumida por **ElevenLabs Conversational AI / ElevenAgents**.

---

## Matriz de Tools

| Nombre del Tool | Método | Endpoint | Propósito | Confirmación Requerida |
|---|---|---|---|---|
| `get_customer_profile` | `GET` | `/api/customer/profile` | Identificar al cliente en sesión | No |
| `get_accounts` | `GET` | `/api/accounts` | Consultar cuentas y saldos | No |
| `get_transactions` | `GET` | `/api/transactions` | Consultar movimientos recientes | No |
| `get_loans` | `GET` | `/api/loans` | Consultar saldo y cuotas de préstamos | No |
| `verify_transaction` | `POST` | `/api/transactions/{id}/verify` | Obtener detalle de un movimiento en disputa | No |
| `report_fraud` | `POST` | `/api/fraud/report` | Radicar reclamo oficial por fraude | **Sí (Explícita)** |
| `block_card` | `POST` | `/api/cards/{id}/block` | Bloquear preventivamente una tarjeta | **Sí (Explícita)** |
| `validate_transfer` | `POST` | `/api/transfer/validate` | Validar fondos y cuentas antes de transferir | No |
| `execute_transfer` | `POST` | `/api/transfer/execute` | Ejecutar transferencia entre cuentas | **Sí (Explícita)** |
| `human_handoff` | `POST` | `/api/handoff` | Escalar a asesor humano con contexto | No |
| `audit_event` | `POST` | `/api/audit/event` | Registrar telemetría en auditoría | No |

---

## Detalle de Especificaciones por Tool

### 1. `get_customer_profile`
* **Descripción**: Obtiene el perfil de Juan Pérez y valida el estado de la sesión.
* **HTTP**: `GET /api/customer/profile`
* **Response**:
  ```json
  {
    "customer_id": "CUS-78921",
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@visionario.bank",
    "segment": "Cliente Visionario",
    "authenticated": true
  }
  ```

---

### 2. `get_accounts`
* **Descripción**: Consulta los saldos de Cuenta Visionario ($12,430.50), Ahorros Visionario ($8,162.35) y Depósito a Plazo ($5,000.00).
* **HTTP**: `GET /api/accounts`
* **Response**:
  ```json
  {
    "total_balance": 24592.85,
    "accounts": [
      {
        "account_id": "ACC-4829",
        "name": "Cuenta Visionario",
        "account_number_masked": "**** 4829",
        "type": "Cuenta de Cheques",
        "balance": 12430.50
      },
      {
        "account_id": "ACC-7712",
        "name": "Ahorros Visionario",
        "account_number_masked": "**** 7712",
        "type": "Cuenta de Ahorros",
        "balance": 8162.35
      }
    ]
  }
  ```

---

### 3. `get_transactions`
* **Descripción**: Obtiene los últimos movimientos de la cuenta y tarjetas.
* **HTTP**: `GET /api/transactions`
* **Response**:
  ```json
  {
    "transactions": [
      {
        "id": "TX-001",
        "merchant": "Transferencia recibida",
        "amount": 2500.00,
        "date": "Hoy",
        "status": "COMPLETED"
      },
      {
        "id": "TX-006",
        "merchant": "ATM Centro",
        "amount": -300.00,
        "date": "04/09/2026",
        "card_last4": "4829",
        "status": "COMPLETED"
      }
    ]
  }
  ```

---

### 4. `report_fraud`
* **Descripción**: Genera un reclamo formal ante la Unidad de Prevención de Fraude.
* **Confirmación requerida**: **SÍ** (Nito pregunta: "¿Quieres reportarla?" y espera "Sí").
* **HTTP**: `POST /api/fraud/report`
* **Request**:
  ```json
  {
    "customer_id": "CUS-78921",
    "transaction_id": "TX-006",
    "reason": "UNRECOGNIZED_TRANSACTION"
  }
  ```
* **Response**:
  ```json
  {
    "case_id": "FRA-20260905-00421",
    "status": "En investigación",
    "department": "Unidad de Prevención de Fraude",
    "estimated_resolution": "24-48 horas",
    "merchant": "ATM Centro",
    "amount": 300.00
  }
  ```

---

### 5. `block_card`
* **Descripción**: Bloquea preventivamente la tarjeta terminada en 4829.
* **Confirmación requerida**: **SÍ** (Nito pregunta: "¿Deseas bloquearla?" y espera confirmación).
* **HTTP**: `POST /api/cards/{card_id}/block`
* **Response**:
  ```json
  {
    "card_id": "CARD-4829",
    "last4": "4829",
    "status": "BLOCKED",
    "message": "Tu tarjeta ha sido bloqueada temporalmente para proteger tu cuenta."
  }
  ```

---

### 6. `validate_transfer` & `execute_transfer`
* **Descripción**: Valida y transfiere fondos entre cuentas.
* **Confirmación requerida**: **SÍ** (Nito confirma origen, destino y monto antes de ejecutar).
* **HTTP**: `POST /api/transfer/execute`
* **Request**:
  ```json
  {
    "source_account": "Cuenta Visionario **** 4829",
    "destination_account": "Ahorros Visionario **** 7712",
    "amount": 100.00
  }
  ```
* **Response**:
  ```json
  {
    "status": "COMPLETED",
    "reference": "TRF-8849102",
    "amount": 100.00,
    "message": "Transferencia realizada con éxito."
  }
  ```

---

### 7. `get_loans`
* **Descripción**: Consulta el saldo pendiente ($8,450.00) y cuota ($245.00) del préstamo personal.
* **HTTP**: `GET /api/loans`
* **Response**:
  ```json
  {
    "loan_id": "LOAN-8840",
    "product": "Préstamo Personal Visionario",
    "outstanding_balance": 8450.00,
    "next_payment": 245.00,
    "next_payment_date": "15/09/2026",
    "interest_rate": 8.50
  }
  ```

---

### 8. `human_handoff`
* **Descripción**: Escala la sesión con un asesor humano cuando se solicita asesoría financiera o soporte especializado.
* **HTTP**: `POST /api/handoff`
* **Request**:
  ```json
  {
    "reason": "POLICY_FINANCIAL_ADVICE_RESTRICTION",
    "conversation_summary": "Cliente Juan Pérez reportó fraude de $300 (ATM Centro), tarjeta 4829 bloqueada y solicitó estrategia de pago de préstamo.",
    "case_id": "FRA-20260905-00421"
  }
  ```
