// =========================================================
// CONTACT US — Form Validation & Submission
// =========================================================

interface FieldState {
    input: HTMLInputElement | HTMLTextAreaElement;
    errorEl: HTMLElement;
}

// ---- Helpers --------------------------------------------

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showError(state: FieldState, message: string): void {
    state.input.style.borderColor = "#e53e3e";
    state.errorEl.textContent = message;
    state.errorEl.style.display = "block";
}

function clearError(state: FieldState): void {
    state.input.style.borderColor = "var(--pink)";
    state.errorEl.textContent = "";
    state.errorEl.style.display = "none";
}

function createErrorEl(): HTMLElement {
    const el = document.createElement("span");
    el.style.cssText =
        "display:none; color:#e53e3e; font-size:12px; margin-top:-24px; margin-bottom:8px; display:block;";
    el.style.display = "none";
    return el;
}

// ---- Build field state & inject error elements ----------

function setupField(
    selector: string,
    container: HTMLElement
    ): FieldState | null {
    const input = container.querySelector<
        HTMLInputElement | HTMLTextAreaElement
    >(selector);
    if (!input) return null;

    const errorEl = createErrorEl();
    input.insertAdjacentElement("afterend", errorEl);

    return { input, errorEl };
}

// ---- Validate a single field ----------------------------

function validateField(state: FieldState, isEmail = false): boolean {
    const value = state.input.value.trim();

    if (!value) {
        showError(state, "This field is required.");
        return false;
    }

    if (isEmail && !isValidEmail(value)) {
        showError(state, "Please enter a valid email address.");
        return false;
    }

    clearError(state);
    return true;
}

// ---- Success / Error banner -----------------------------

function showBanner(form: HTMLElement, success: boolean): void {
    document.querySelector(".form-banner")?.remove();

    const banner = document.createElement("div");
    banner.className = "form-banner";
    banner.style.cssText = `
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        padding: 14px 28px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 99999;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        background: ${success ? "#dcfce7" : "#fee2e2"};
        color:       ${success ? "#166534" : "#991b1b"};
        border: 1px solid ${success ? "#86efac" : "#fca5a5"};
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    banner.textContent = success
        ? "✓ Message sent! We'll get back to you soon."
        : "✗ Something went wrong. Please try again.";

    document.body.appendChild(banner);

    // Fade in
    requestAnimationFrame(() => {
        banner.style.opacity = "1";
    });

    // Fade out then remove
    setTimeout(() => {
        banner.style.opacity = "0";
        setTimeout(() => banner.remove(), 300);
    }, 4000);
}

// ---- Main init ------------------------------------------

function initContactForm(): void {
    const formSection = document.querySelector<HTMLElement>(".feedback__form");
    if (!formSection) return;

    const nameState    = setupField('input[type="text"]',    formSection);
    const emailState   = setupField('input[type="email"]',   formSection);
    // Topic is the second text input — grab it by index
    const topicInput   = formSection.querySelectorAll<HTMLInputElement>('input[type="text"]')[1];
    let topicState: FieldState | null = null;
    if (topicInput) {
        const errorEl = createErrorEl();
        topicInput.insertAdjacentElement("afterend", errorEl);
        topicState = { input: topicInput, errorEl };
    }
    const messageState = setupField("textarea", formSection);

    if (!nameState || !emailState || !topicState || !messageState) return;

    // ---- Real-time validation (on blur) -------------------
    nameState.input.addEventListener("blur", () =>
        validateField(nameState!)
    );

    emailState.input.addEventListener("blur", () =>
        validateField(emailState!, true)
    );

    // Live email check while typing (after first blur)
    let emailTouched = false;
    emailState.input.addEventListener("blur", () => { emailTouched = true; });
    emailState.input.addEventListener("input", () => {
        if (emailTouched) validateField(emailState!, true);
    });

    topicState.input.addEventListener("blur", () =>
        validateField(topicState!)
    );

    messageState.input.addEventListener("blur", () =>
        validateField(messageState!)
    );

    // ---- Submit -------------------------------------------
    const sendBtn = formSection.querySelector<HTMLButtonElement>(".btn-send");
    if (!sendBtn) return;

    sendBtn.addEventListener("click", () => {
        const valid = [
        validateField(nameState!),
        validateField(emailState!, true),
        validateField(topicState!),
        validateField(messageState!),
        ].every(Boolean);

        if (!valid) return;

        // Simulate async submission
        sendBtn.disabled = true;
        sendBtn.textContent = "SENDING…";

        setTimeout(() => {
        const success = Math.random() > 0.2; // 80 % success rate for demo

        showBanner(formSection, success);

        if (success) {
            // Reset form fields
            [nameState!, emailState!, topicState!, messageState!].forEach((s) => {
            s.input.value = "";
            clearError(s);
            });
        }

        sendBtn.disabled = false;
        sendBtn.textContent = "SEND";
        }, 1200);
    });
}

// Run after DOM is ready
document.addEventListener("DOMContentLoaded", initContactForm);