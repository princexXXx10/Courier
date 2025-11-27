trackingInput.focus();
    });
  });

// Handle form submission
trackingForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const code = trackingInput.value.trim().toUpperCase();

  // Clear previous error
  errorMessage.textContent = '';

  // Validate input
  if (!code) {
    showError('Please enter a tracking code');
    return;
  }

  // Check if tracking code exists
  const trackingData = getTrackingData(code);

  if (!trackingData) {
    showError('Invalid tracking code. Try TRACK001, TRACK002, or TRACK003');
    shakeInput();
    return;
  }

  // Show loading screen
  loadingScreen.classList.add('active');

  // Store tracking code in sessionStorage
  sessionStorage.setItem('currentTrackingCode', code);

  // Simulate loading delay for better UX
  setTimeout(() => {
    window.location.href = 'tracking.html';
  }, 1500);
});

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.animation = 'fadeIn 0.3s ease';
}

// Shake input animation
function shakeInput() {
  const inputWrapper = trackingInput.closest('.input-wrapper');
  inputWrapper.style.animation = 'shake 0.5s ease';
  setTimeout(() => {
    inputWrapper.style.animation = '';
  }, 500);
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
document.head.appendChild(style);

// Add smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add parallax effect to floating cards
window.addEventListener('scroll', function () {
  const scrolled = window.pageYOffset;
  const floatingCards = document.querySelectorAll('.float-card');

  floatingCards.forEach((card, index) => {
    const speed = 0.1 + (index * 0.05);
    card.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// Add entrance animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card').forEach(card => {
  card.style.opacity = '0';
  observer.observe(card);
});
});
