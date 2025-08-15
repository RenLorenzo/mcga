// Landing page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Animate floating elements
  animateFloatingElements();
  
  // Add click handler for the CTA button
  document.getElementById('startTestBtn').addEventListener('click', function() {
    // Add loading state
    this.classList.add('loading');
    this.querySelector('.btn-text').textContent = 'Preparing Test...';
    this.querySelector('.btn-icon').textContent = '⏳';
    
    // Simulate loading time
    setTimeout(() => {
      // Navigate to test page
      window.location.href = 'test.html';
    }, 1500);
  });
  
  // Add hover effects
  addHoverEffects();
});

function animateFloatingElements() {
  const elements = document.querySelectorAll('.floating-elements .element');
  
  elements.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.5}s`;
    element.style.animationDuration = `${3 + index * 0.5}s`;
  });
}

function addHoverEffects() {
  const features = document.querySelectorAll('.feature');
  
  features.forEach(feature => {
    feature.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
    });
    
    feature.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
}

// Add some interactive effects
document.addEventListener('mousemove', function(e) {
  const elements = document.querySelectorAll('.floating-elements .element');
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;
  
  elements.forEach((element, index) => {
    const speed = (index + 1) * 0.5;
    const x = (mouseX - 0.5) * speed * 20;
    const y = (mouseY - 0.5) * speed * 20;
    
    element.style.transform = `translate(${x}px, ${y}px)`;
  });
}); 