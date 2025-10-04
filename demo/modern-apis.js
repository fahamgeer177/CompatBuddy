// Demo JavaScript file with modern Web APIs

class ModernWebFeatures {
  constructor() {
    this.initializeObservers();
    this.checkWebGPU();
    this.setupSharing();
  }

  // ResizeObserver - Good support, but needs fallback for older browsers
  initializeObservers() {
    // ResizeObserver for responsive components
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        console.log(`Element resized: ${width}x${height}`);
        this.handleResize(entry.target, width, height);
      });
    });

    // IntersectionObserver for lazy loading
    const intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadContent(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    document.querySelectorAll('.lazy-load').forEach(el => {
      intersectionObserver.observe(el);
    });

    document.querySelectorAll('.responsive-component').forEach(el => {
      resizeObserver.observe(el);
    });
  }

  // WebGPU - Very limited support, experimental
  async checkWebGPU() {
    if (navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          const device = await adapter.requestDevice();
          this.renderWithWebGPU(device);
        }
      } catch (error) {
        console.warn('WebGPU not available:', error);
        this.fallbackToWebGL();
      }
    } else {
      console.log('WebGPU not supported');
      this.fallbackToWebGL();
    }
  }

  // Web Share API - Limited support, mainly mobile
  setupSharing() {
    const shareButton = document.getElementById('share-btn');
    if (shareButton) {
      shareButton.addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({
            title: 'CompatBuddy Demo',
            text: 'Check out this awesome compatibility tool!',
            url: window.location.href
          }).catch(err => console.error('Error sharing:', err));
        } else {
          this.fallbackShare();
        }
      });
    }
  }

  handleResize(element, width, height) {
    // Responsive logic based on element dimensions
    if (width < 400) {
      element.classList.add('compact');
    } else {
      element.classList.remove('compact');
    }
  }

  loadContent(element) {
    // Lazy loading implementation
    const src = element.dataset.src;
    if (src) {
      element.src = src;
      element.classList.add('loaded');
    }
  }

  renderWithWebGPU(device) {
    console.log('Rendering with WebGPU', device);
    // WebGPU rendering code would go here
  }

  fallbackToWebGL() {
    console.log('Falling back to WebGL');
    const canvas = document.getElementById('graphics-canvas');
    if (canvas) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) {
        // WebGL rendering fallback
        this.renderWithWebGL(gl);
      } else {
        // Canvas 2D fallback
        const ctx = canvas.getContext('2d');
        this.renderWith2D(ctx);
      }
    }
  }

  renderWithWebGL(gl) {
    // WebGL rendering implementation
    console.log('Using WebGL fallback');
  }

  renderWith2D(ctx) {
    // Canvas 2D rendering implementation
    console.log('Using Canvas 2D fallback');
  }

  fallbackShare() {
    // Manual sharing fallback
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showNotification('Link copied to clipboard!');
      }).catch(() => {
        this.manualCopyFallback(url);
      });
    } else {
      this.manualCopyFallback(url);
    }
  }

  manualCopyFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      this.showNotification('Link copied!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    document.body.removeChild(textArea);
  }

  showNotification(message) {
    // Simple notification display
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ModernWebFeatures();
});