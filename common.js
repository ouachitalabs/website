// Time-based theme switching
function setThemeBasedOnTime() {
  const now = new Date();
  const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const hour = centralTime.getHours();

  // Dark mode from 6 PM (18) to 6 AM (6)
  const isDarkTime = hour >= 18 || hour < 6;

  document.documentElement.setAttribute('data-theme', isDarkTime ? 'dark' : 'light');
}

// Mobile menu functions
function toggleMobileMenu() {
  const mobileNav = document.getElementById('mobileNav');
  mobileNav.classList.toggle('active');
}

function closeMobileMenu() {
  const mobileNav = document.getElementById('mobileNav');
  mobileNav.classList.remove('active');
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
}

// Email copy functionality
function initEmailCopy() {
  document.querySelectorAll('.email-copy').forEach(button => {
    button.addEventListener('click', async function () {
      const email = this.dataset.email;
      const emailSpan = this.querySelector('.email');
      const originalText = emailSpan.textContent;

      try {
        await navigator.clipboard.writeText(email);
        emailSpan.textContent = 'Copied!';
        this.style.background = 'var(--primary-blue)';
        this.style.color = 'var(--surface-primary)';

        setTimeout(() => {
          emailSpan.textContent = originalText;
          this.style.background = '';
          this.style.color = '';
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        emailSpan.textContent = 'Copied!';
        setTimeout(() => {
          emailSpan.textContent = originalText;
        }, 2000);
      }
    });
  });
}

// Initialize all common functionality
function initCommonFeatures() {
  // Set theme on page load
  setThemeBasedOnTime();
  
  // Update theme every minute to catch time changes
  setInterval(setThemeBasedOnTime, 60000);
  
  // Initialize other features
  initSmoothScrolling();
  initEmailCopy();
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCommonFeatures);
} else {
  initCommonFeatures();
}