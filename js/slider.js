// ===================================
// TESTIMONIAL SLIDER FUNCTIONALITY
// ===================================

let currentSlide = 0;
const slides = document.querySelectorAll('.testimonial-slide');
const dots = document.querySelectorAll('.slider-dot');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function showSlide(index) {
  // Hide all slides
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  // Show current slide
  slides[index].classList.add('active');
  dots[index].classList.add('active');

  currentSlide = index;
}

function nextSlide() {
  let next = currentSlide + 1;
  if (next >= slides.length) {
    next = 0;
  }
  showSlide(next);
}

function prevSlide() {
  let prev = currentSlide - 1;
  if (prev < 0) {
    prev = slides.length - 1;
  }
  showSlide(prev);
}

// Event listeners
if (nextBtn) {
  nextBtn.addEventListener('click', nextSlide);
}

if (prevBtn) {
  prevBtn.addEventListener('click', prevSlide);
}

// Dot navigation
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showSlide(index);
  });
});

// Auto-advance slides every 5 seconds
setInterval(nextSlide, 5000);
