/**
 * MAUSAM Atmospheric Intelligence Platform
 * Accessible Form Validation & Anti-Spam Utility
 * Feature #17 & #18 Implementation
 */
(function () {
  'use strict';

  let lastSubmissionTime = 0;
  const MIN_SUBMISSION_INTERVAL_MS = 2500;

  function validateEmail(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return re.test(String(email).trim());
  }

  function sanitizeInput(str, maxLength = 500) {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, maxLength);
  }

  function checkHoneypot(formElement) {
    const honeypot = formElement.querySelector('[name="_gotcha"], [name="website_hp"], .hp-field input');
    if (honeypot && honeypot.value.trim().length > 0) {
      // Bot detected!
      return false;
    }
    return true;
  }

  function attachFormProtection(formId, onSubmitValid) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Inject honeypot if missing
    if (!form.querySelector('.hp-field')) {
      const hpDiv = document.createElement('div');
      hpDiv.className = 'hp-field';
      hpDiv.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; opacity: 0;';
      hpDiv.setAttribute('aria-hidden', 'true');
      hpDiv.innerHTML = '<input type="text" name="website_hp" tabindex="-1" autocomplete="off">';
      form.prepend(hpDiv);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Rate limit check
      const now = Date.now();
      if (now - lastSubmissionTime < MIN_SUBMISSION_INTERVAL_MS) {
        showFormStatus(form, 'Please wait a moment before submitting again.', 'warning');
        return;
      }

      // Honeypot check
      if (!checkHoneypot(form)) {
        console.warn('[MAUSAM Security] Bot submission prevented');
        showFormStatus(form, 'Verification failed. Please try again.', 'error');
        return;
      }

      // Validate inputs
      const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
      let hasError = false;
      let firstErrorEl = null;

      inputs.forEach((input) => {
        const val = input.value.trim();
        const errorSpan = form.querySelector(`#error-${input.id}`);

        if (!val) {
          hasError = true;
          if (errorSpan) errorSpan.textContent = 'This field is required.';
          input.setAttribute('aria-invalid', 'true');
          if (!firstErrorEl) firstErrorEl = input;
        } else if (input.type === 'email' && !validateEmail(val)) {
          hasError = true;
          if (errorSpan) errorSpan.textContent = 'Please enter a valid email address.';
          input.setAttribute('aria-invalid', 'true');
          if (!firstErrorEl) firstErrorEl = input;
        } else {
          if (errorSpan) errorSpan.textContent = '';
          input.removeAttribute('aria-invalid');
        }
      });

      if (hasError) {
        if (firstErrorEl) firstErrorEl.focus();
        return;
      }

      lastSubmissionTime = now;
      if (typeof onSubmitValid === 'function') {
        onSubmitValid(form);
      }
    });
  }

  function showFormStatus(form, message, type = 'info') {
    let statusEl = form.querySelector('.form-status-msg');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.className = 'form-status-msg';
      statusEl.setAttribute('role', 'alert');
      form.appendChild(statusEl);
    }

    statusEl.textContent = message;
    statusEl.style.cssText =
      type === 'error'
        ? 'color: #ef4444; font-size: 13px; margin-top: 8px;'
        : type === 'warning'
        ? 'color: #f59e0b; font-size: 13px; margin-top: 8px;'
        : 'color: #10b981; font-size: 13px; margin-top: 8px;';
  }

  window.MausamForms = {
    validateEmail: validateEmail,
    sanitizeInput: sanitizeInput,
    checkHoneypot: checkHoneypot,
    attachFormProtection: attachFormProtection,
    showFormStatus: showFormStatus,
  };
})();
