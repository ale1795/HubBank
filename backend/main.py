from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

app = FastAPI(
    title="Banco Visionario - Atena Banking API",
    description="API Gateway de Atena Banking Assistant para integración con ElevenLabs Conversational AI y Core Bancario",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory Mock Banking Core State matching the PDF data
customer_db = {
    "customer_id": "CUS-78921",
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@visionario.bank",
    "phone_masked": "+503 7***-**12",
    "birth_date_masked": "22/**/1986",
    "client_since": "2023",
    "segment": "Cliente Visionario",
    "last_access": "Hoy, 9:30 a.m.",
    "authenticated": True
}

accounts_db = [
    {
        "account_id": "ACC-4829",
        "name": "Cuenta Visionario",
        "account_number_masked": "**** 4829",
        "type": "Cuenta de Cheques",
        "currency": "USD",
        "balance": 12430.50,
        "available_balance": 12430.50,
        "status": "ACTIVE"
    },
    {
        "account_id": "ACC-7712",
        "name": "Ahorros Visionario",
        "account_number_masked": "**** 7712",
        "type": "Cuenta de Ahorros",
        "currency": "USD",
        "balance": 8162.35,
        "available_balance": 8162.35,
        "status": "ACTIVE"
    },
    {
        "account_id": "ACC-1198",
        "name": "Depósito a Plazo",
        "account_number_masked": "**** 1198",
        "type": "A plazo fijo",
        "currency": "USD",
        "balance": 5000.00,
        "available_balance": 5000.00,
        "expiry_date": "12/03/2027",
        "status": "ACTIVE"
    },
    {
        "account_id": "ACC-3355",
        "name": "Tarjeta de Crédito",
        "account_number_masked": "**** 3355",
        "type": "Línea disponible",
        "currency": "USD",
        "balance": 3500.00,
        "limit": 5000.00,
        "available_balance": 3500.00,
        "status": "ACTIVE"
    }
]

transactions_db = [
    {
        "id": "TX-001",
        "date": "Hoy",
        "time": "9:20 a.m.",
        "merchant": "Transferencia recibida",
        "detail": "De María López",
        "category": "Transferencia",
        "type": "TRANSFER_IN",
        "amount": 2500.00,
        "currency": "USD",
        "status": "COMPLETED",
        "card_last4": "4829"
    },
    {
        "id": "TX-002",
        "date": "Ayer",
        "time": "6:45 p.m.",
        "merchant": "Supermercado La Selecta",
        "detail": "Tarjeta de Débito **** 4829",
        "category": "Supermercado",
        "type": "PURCHASE",
        "amount": -68.45,
        "currency": "USD",
        "status": "COMPLETED",
        "card_last4": "4829"
    },
    {
        "id": "TX-003",
        "date": "Ayer",
        "time": "6:12 p.m.",
        "merchant": "Gasolinera Puma",
        "detail": "Tarjeta de Débito **** 4829",
        "category": "Combustible",
        "type": "PURCHASE",
        "amount": -45.20,
        "currency": "USD",
        "status": "COMPLETED",
        "card_last4": "4829"
    },
    {
        "id": "TX-004",
        "date": "Ayer",
        "time": "1:30 p.m.",
        "merchant": "Restaurante El Mirador",
        "detail": "Tarjeta de Débito **** 4829",
        "category": "Restaurante",
        "type": "PURCHASE",
        "amount": -32.80,
        "currency": "USD",
        "status": "COMPLETED",
        "card_last4": "4829"
    },
    {
        "id": "TX-005",
        "date": "Ayer",
        "time": "11:30 a.m.",
        "merchant": "AES El Salvador",
        "detail": "Pago de servicio",
        "category": "Servicios",
        "type": "BILL_PAYMENT",
        "amount": -124.30,
        "currency": "USD",
        "status": "COMPLETED",
        "card_last4": "4829"
    },
    {
        "id": "TX-006",
        "date": "04/09/2026",
        "time": "18:42",
        "merchant": "ATM Centro",
        "detail": "Retiro cajero automático",
        "category": "Cajero Automático",
        "type": "ATM_WITHDRAWAL",
        "amount": -300.00,
        "currency": "USD",
        "status": "COMPLETED",
        "card_last4": "4829",
        "location": "ATM Red Visionario - Centro Histórico"
    }
]

cards_db = [
    {
        "card_id": "CARD-4829",
        "card_holder": "JUAN PÉREZ",
        "card_type": "DEBIT",
        "card_name": "Visionario Débito Gold",
        "last4": "4829",
        "expiry": "09/29",
        "brand": "VISA",
        "monthly_spent": 1245.75,
        "spent_percentage": 62,
        "limit_available": 2754.25,
        "total_limit": 4000.00,
        "status": "ACTIVE"
    },
    {
        "card_id": "CARD-3355",
        "card_holder": "JUAN PÉREZ",
        "card_type": "CREDIT",
        "card_name": "Visionario Black Infinite",
        "last4": "3355",
        "expiry": "11/28",
        "brand": "VISA",
        "monthly_spent": 1500.00,
        "spent_percentage": 30,
        "limit_available": 3500.00,
        "total_limit": 5000.00,
        "status": "ACTIVE"
    }
]

loans_db = [
    {
        "loan_id": "LOAN-8840",
        "product": "Préstamo Personal Visionario",
        "original_amount": 12000.00,
        "outstanding_balance": 8450.00,
        "next_payment": 245.00,
        "next_payment_date": "15/09/2026",
        "interest_rate": 8.50,
        "total_installments": 60,
        "paid_installments": 22,
        "currency": "USD",
        "status": "CURRENT"
    }
]

cases_db = []
audit_logs = []

def log_event(intent: str, action: str, tool: Optional[str] = None, params: Any = None, details: str = ""):
    now = datetime.now()
    entry = {
        "id": f"AUD-{str(uuid.uuid4())[:8].upper()}",
        "timestamp": now.isoformat(),
        "time_formatted": now.strftime("%H:%M:%S"),
        "customer_id": customer_db["customer_id"],
        "intent": intent,
        "action": action,
        "tool_called": tool,
        "tool_params": params,
        "result": "SUCCESS",
        "details": details
    }
    audit_logs.insert(0, entry)
    return entry

# ----------------- TOOL ENDPOINTS FOR ELEVENLABS -----------------

@app.get("/api/customer/profile")
def get_customer_profile():
    """Tool: get_customer_profile - Obtiene perfil del cliente."""
    log_event("CUSTOMER_PROFILE", "GET_PROFILE", "get_customer_profile", details="Perfil de Juan Pérez consultado.")
    return customer_db

@app.get("/api/accounts")
def get_accounts():
    """Tool: get_accounts - Consulta las cuentas y saldos."""
    total_balance = sum(acc["balance"] for acc in accounts_db if acc["type"] != "Línea disponible")
    log_event("BALANCE_QUERY", "GET_ACCOUNTS", "get_accounts", details=f"Consultadas {len(accounts_db)} cuentas. Saldo total: ${total_balance:,.2f}")
    return {
        "total_balance": 24592.85,
        "accounts": accounts_db
    }

@app.get("/api/transactions")
def get_transactions(limit: int = 10):
    """Tool: get_transactions - Consulta los movimientos recientes."""
    log_event("TRANSACTION_QUERY", "GET_TRANSACTIONS", "get_transactions", details=f"Obtenidas {len(transactions_db)} transacciones.")
    return {
        "transactions": transactions_db[:limit]
    }

@app.get("/api/loans")
def get_loans():
    """Tool: get_loans - Consulta préstamos activos."""
    loan = loans_db[0]
    log_event("LOAN_QUERY", "GET_LOANS", "get_loans", details=f"Préstamo consultado: Saldo ${loan['outstanding_balance']:,.2f}")
    return {
        "loan_id": loan["loan_id"],
        "product": loan["product"],
        "outstanding_balance": loan["outstanding_balance"],
        "next_payment": loan["next_payment"],
        "next_payment_date": loan["next_payment_date"],
        "interest_rate": loan["interest_rate"],
        "loans": loans_db
    }

class VerifyTransactionRequest(BaseModel):
    transaction_id: Optional[str] = None
    amount: Optional[float] = None

@app.post("/api/transactions/{transaction_id}/verify")
def verify_transaction(transaction_id: str):
    """Tool: verify_transaction - Verifica detalles de una transacción en disputa."""
    tx = next((t for t in transactions_db if t["id"] == transaction_id or str(t["amount"]) == transaction_id or "300" in transaction_id or "ATM" in transaction_id), transactions_db[-1])
    log_event("UNRECOGNIZED_TRANSACTION", "VERIFY_TRANSACTION", "verify_transaction", {"transaction_id": transaction_id}, f"Transacción verificada: {tx['merchant']} por ${abs(tx['amount']):,.2f}")
    return tx

class FraudReportRequest(BaseModel):
    customer_id: str = "CUS-78921"
    transaction_id: str = "TX-006"
    reason: str = "UNRECOGNIZED_TRANSACTION"

@app.post("/api/fraud/report")
def report_fraud(req: FraudReportRequest):
    """Tool: report_fraud - Genera un reclamo oficial de transacción no reconocida."""
    case_num = f"FRA-20260905-00421"
    new_case = {
        "case_id": case_num,
        "customer_id": req.customer_id,
        "transaction_id": req.transaction_id,
        "merchant": "ATM Centro",
        "amount": 300.00,
        "card_last4": "4829",
        "status": "En investigación",
        "department": "Unidad de Prevención de Fraude",
        "estimated_resolution": "24-48 horas",
        "created_at": datetime.now().isoformat()
    }
    cases_db.insert(0, new_case)
    
    # Update transaction in memory
    for tx in transactions_db:
        if tx["id"] == req.transaction_id or abs(tx["amount"]) == 300.0:
            tx["status"] = "DISPUTED"
            tx["dispute_case_id"] = case_num

    log_event("FRAUD_REPORT", "CREATE_CASE", "report_fraud", req.dict(), f"Reclamo generado exitosamente: {case_num} por $300.00 en ATM Centro.")
    return new_case

class CardBlockRequest(BaseModel):
    reason: Optional[str] = "PREVENTIVE_FRAUD_BLOCK"

@app.post("/api/cards/{card_id}/block")
def block_card(card_id: str, req: Optional[CardBlockRequest] = None):
    """Tool: block_card - Bloquea preventivamente una tarjeta."""
    card = next((c for c in cards_db if c["card_id"] == card_id or c["last4"] in card_id or "4829" in card_id), cards_db[0])
    card["status"] = "BLOCKED"
    
    log_event("CARD_BLOCK", "BLOCK_CARD", "block_card", {"card_id": card_id}, f"Tarjeta Débito terminada en {card['last4']} BLOQUEADA TEMPORALMENTE.")
    return {
        "card_id": card["card_id"],
        "last4": card["last4"],
        "status": "BLOCKED",
        "message": "Tu tarjeta ha sido bloqueada temporalmente para proteger tu cuenta."
    }

class TransferValidateRequest(BaseModel):
    source_account: str
    destination_account: str
    amount: float

@app.post("/api/transfer/validate")
def validate_transfer(req: TransferValidateRequest):
    """Tool: validate_transfer - Valida disponibilidad de fondos antes de transferir."""
    log_event("TRANSFER", "VALIDATE_TRANSFER", "validate_transfer", req.dict(), f"Validando transferencia de ${req.amount:,.2f} a cuenta destino.")
    return {
        "valid": True,
        "source_account": req.source_account,
        "destination_account": req.destination_account,
        "amount": req.amount,
        "fee": 0.00,
        "total_debit": req.amount
    }

class TransferExecuteRequest(BaseModel):
    source_account: str
    destination_account: str
    amount: float
    description: Optional[str] = "Transferencia vía Atena"

@app.post("/api/transfer/execute")
def execute_transfer(req: TransferExecuteRequest):
    """Tool: execute_transfer - Ejecuta transferencia tras confirmación explícita."""
    ref = f"TRF-{str(uuid.uuid4())[:8].upper()}"
    log_event("TRANSFER", "EXECUTE_TRANSFER", "execute_transfer", req.dict(), f"Transferencia de ${req.amount:,.2f} ejecutada con referencia {ref}.")
    return {
        "status": "COMPLETED",
        "reference": ref,
        "amount": req.amount,
        "date": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "message": "Transferencia realizada con éxito."
    }

class HandoffRequest(BaseModel):
    reason: str
    conversation_summary: str
    case_id: Optional[str] = None

@app.post("/api/handoff")
def human_handoff(req: HandoffRequest):
    """Tool: human_handoff - Transfiere a un asesor humano con contexto completo."""
    ref = f"HANDOFF-7419"
    log_event("HUMAN_AGENT", "TRANSFER_TO_HUMAN", "human_handoff", req.dict(), f"Escalamiento a asesor humano con ticket {ref}.")
    return {
        "status": "TRANSFERRED",
        "queue": "Asesoría Financiera & Prevención",
        "reference": ref,
        "timestamp": datetime.now().isoformat()
    }

class AuditEventRequest(BaseModel):
    intent: str
    action: str
    details: str

@app.post("/api/audit/event")
def record_audit(req: AuditEventRequest):
    entry = log_event(req.intent, req.action, details=req.details)
    return {"status": "RECORDED", "id": entry["id"]}

@app.get("/api/audit/logs")
def get_audit_logs():
    return {"logs": audit_logs}

@app.get("/api/cases")
def get_cases():
    return {"cases": cases_db}

@app.post("/api/reset")
def reset_state():
    cards_db[0]["status"] = "ACTIVE"
    for tx in transactions_db:
        if tx["status"] == "DISPUTED":
            tx["status"] = "COMPLETED"
            tx.pop("dispute_case_id", None)
    cases_db.clear()
    log_event("SYSTEM", "RESET_DEMO_STATE", details="Estado de demostración restablecido.")
    return {"status": "RESET_SUCCESS"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
