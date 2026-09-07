# Guion Ejecutivo de Demostración (Executive Demo Script)

Este guion está diseñado para realizar presentaciones ante **Junta Directiva, Gerencia General, Comité de Innovación y Tecnología**.

---

## Mensaje Central
> *"En lugar de obligar al cliente a navegar por múltiples menús de la banca digital, el cliente simplemente conversa con su banco."*

---

## Estructura de la Demostración (Paso a Paso)

### Acto 1: Introducción y Propuesta de Valor (1 min)
1. **Presentador**: Abre la pantalla principal de **AI Banking Hub (Banco Visionario)**.
2. **Explicación**: *"Observen la banca digital de Guillermo. Tiene sus saldos, tarjetas, préstamos y movimientos. Pero en lugar de buscar cómo reportar un fraude en configuraciones o menús, Guillermo simplemente le hablará a Nito."*

---

### Acto 2: Reporte Conversacional y Autenticación (2 min)
1. **Acción**: Haz clic en el botón **🎙️ Hablar con Nito** o **🎬 DEMO MODE**.
2. **Cliente**: *"Tengo una transacción que no reconozco."*
3. **Nito**: *"Claro, Guillermo. Te ayudo a revisarla. Primero voy a verificar tu identidad para proteger tu cuenta."*
4. **Visualización en Pantalla**:
   - Se despliega el widget animado **Verificación de Identidad**:
     - ✓ Cliente identificado: Guillermo Calderón
     - ✓ Fecha de nacimiento validada
     - ✓ Tarjeta terminada en 4821
     - ✓ Código OTP validado (749210)
5. **Nito**: *"Perfecto, Guillermo. Tu identidad ha sido verificada. Voy a consultar tus últimos movimientos. ¿Cuál de estas transacciones no reconoces?"*

---

### Acto 3: Selección de Transacción y Transición Multi-Agente (2 min)
1. **Visualización**: Aparece la lista de movimientos con el **Retiro ATM Centro por $300.00**.
2. **Cliente**: *"El retiro de $300 en ATM Centro."*
3. **Transición Multi-Agente**:
   - La interfaz transiciona visualmente de **Nito Banking Assistant** a **Nito Fraud Agent** (aura ámbar/dorada).
4. **Nito Fraud Agent**:
   - Muestra la investigación paso a paso:
     - ✓ Transacción identificada
     - ✓ Cliente autenticado
     - ✓ Transacción marcada como sospechosa
5. **Nito Fraud Agent**: *"Por seguridad, ¿quieres que bloquee temporalmente la tarjeta terminada en 4821?"*
6. **Cliente**: *"Sí, bloquear tarjeta."*
7. **Efecto en Vivo**:
   - En el Dashboard de la banca, la tarjeta de crédito pasa instantáneamente a estado **🔒 BLOQUEADA TEMPORALMENTE**.
   - Se genera el caso oficial de reclamo: **FRA-20260905-00421** asignado a la **Unidad de Prevención de Fraude** con tiempo estimado de 24-48 horas.

---

### Acto 4: Cambio de Intención y Guardrail Financiero (1.5 min)
1. **Cliente**: *"También quiero saber cuánto debo de mi préstamo."*
2. **Nito Loans Agent**:
   - Transiciona al agente especialista en créditos (aura esmeralda).
   - *"Claro, Guillermo. Tienes un saldo pendiente de $8,450.00 con una próxima cuota de $245.00 el 15/09/2026 a una tasa de 8.50%."*
3. **Cliente**: *"¿Cuánto debería pagar para salir más rápido de la deuda?"*
4. **Nito**:
   - **Activación de Guardrail**: *"Puedo mostrarte tu saldo, cuotas y condiciones actuales, pero para recomendarte una estrategia de pago personalizada necesito derivarte con un asesor financiero."*
   - Despliega la tarjeta de **Human Handoff** con todo el contexto transferido (cliente verificado, caso FRA-00421, tarjeta bloqueada, consulta de crédito).

---

### Acto 5: Auditoría y Telemetría en Vivo (1 min)
1. **Acción**: Haz clic en la pestaña **Auditoría IA** en la barra lateral.
2. **Explicación al Comité**:
   - *"Cada una de las decisiones tomadas por Nito fue auditada de manera inmutable: la autenticación, la detección de intents, la invocación de herramientas REST y el bloqueo del plástico."*

---

## Conclusión
> *"Hemos presenciado el ciclo completo: VOZ → ENTENDER → AUTENTICAR → LLAMAR TOOL → CORE BANCARIO → EJECUTAR ACCIÓN → AUDITORÍA → RESPUESTA HABLADA."*
