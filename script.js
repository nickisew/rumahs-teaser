// Waitlist Form Handler with Backend Integration
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const waitlistForm = document.getElementById('waitlistForm');
    const successMessage = document.getElementById('successMessage');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById('email').value;
        const facebook = document.getElementById('facebook').value;
        
        // Clear any existing validation messages
        clearValidationMessage();
        
        // Validate Facebook URL format if provided
        let normalizedFacebook = '';
        if (facebook && facebook.trim() !== '') {
            if (!isValidFacebookUrl(facebook)) {
                showValidationMessage('facebook-error', 'Please enter a valid Facebook profile URL (e.g., facebook.com/username)');
                document.getElementById('facebook').classList.add('error');
                return;
            }
            normalizedFacebook = normalizeFacebookUrl(facebook);
        }
        
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        try {
            // Send to backend
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    facebook: normalizedFacebook
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Check if entry is complete or incomplete
                if (result.status === 'incomplete') {
                    // Store email for when they want to add Facebook
                    sessionStorage.setItem('incompleteEmail', email);
                    // Show Facebook requirement message
                    showIncompleteEntryMessage();
                } else {
                    // Show normal success message
                    waitlistForm.style.display = 'none';
                    successMessage.style.display = 'flex';
                    // Clear any stored email
                    sessionStorage.removeItem('incompleteEmail');
                }
                
                // Reset form and clear any stored data
                form.reset();
                // Reset email field styling if it was read-only
                const emailField = document.getElementById('email');
                emailField.readOnly = false;
                emailField.style.backgroundColor = '';
                
                console.log('Successfully added to waitlist:', result);
            } else {
                // Show error message
                alert(result.message || 'Error joining waitlist. Please try again.');
            }
            
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Network error. Please check your connection and try again.');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});

// Show the waitlist form
function showForm() {
    document.getElementById('waitlistForm').style.display = 'flex';
}

// Show the waitlist form with focus on Facebook field
function showFormWithFocus() {
    hideForm();
    document.getElementById('waitlistForm').style.display = 'flex';
    
    // Pre-fill email if we have an incomplete entry
    const storedEmail = sessionStorage.getItem('incompleteEmail');
    if (storedEmail) {
        document.getElementById('email').value = storedEmail;
        document.getElementById('email').readOnly = true; // Make email read-only
        document.getElementById('email').style.backgroundColor = '#f3f4f6'; // Visual indicator
    }
    
    // Focus on Facebook field after a short delay to ensure form is visible
    setTimeout(() => {
        document.getElementById('facebook').focus();
    }, 100);
}

// Show incomplete entry message
function showIncompleteEntryMessage() {
    document.getElementById('waitlistForm').style.display = 'none';
    document.getElementById('incompleteMessage').style.display = 'flex';
}

// Hide the form and go back to main view
function hideForm() {
    document.getElementById('waitlistForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('incompleteMessage').style.display = 'none';
}

// Validate and normalize Facebook URL
function isValidFacebookUrl(url) {
    if (!url || url.trim() === '') {
        return false;
    }
    
    // Normalize the URL - add https:// if missing
    let normalizedUrl = url.trim();
    
    // If it starts with facebook.com or fb.com, add https://
    if (normalizedUrl.startsWith('facebook.com/') || normalizedUrl.startsWith('fb.com/')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    // If it starts with www.facebook.com or www.fb.com, add https://
    else if (normalizedUrl.startsWith('www.facebook.com/') || normalizedUrl.startsWith('www.fb.com/')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    // If it doesn't have a protocol, try adding https://
    else if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    
    try {
        const urlObj = new URL(normalizedUrl);
        return urlObj.hostname.includes('facebook.com') || 
               urlObj.hostname.includes('fb.com');
    } catch {
        return false;
    }
}

// Normalize Facebook URL for submission
function normalizeFacebookUrl(url) {
    if (!url || url.trim() === '') {
        return url;
    }
    
    let normalizedUrl = url.trim();
    
    // If it starts with facebook.com or fb.com, add https://
    if (normalizedUrl.startsWith('facebook.com/') || normalizedUrl.startsWith('fb.com/')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    // If it starts with www.facebook.com or www.fb.com, add https://
    else if (normalizedUrl.startsWith('www.facebook.com/') || normalizedUrl.startsWith('www.fb.com/')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    // If it doesn't have a protocol, try adding https://
    else if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    
    return normalizedUrl;
}

// Basic analytics tracking
function trackEvent(eventName, data) {
    console.log('Event:', eventName, data);
    
    // Track form views
    if (eventName === 'form_view') {
        // You can send analytics to your backend here
        console.log('Form viewed at:', new Date().toISOString());
    }
}

// Track form view when page loads
trackEvent('form_view', { timestamp: new Date().toISOString() });

// Validation message helper functions
function showValidationMessage(elementId, customMessage) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        if (customMessage) {
            messageElement.textContent = customMessage;
        }
        messageElement.style.display = 'block';
    }
}

function clearValidationMessage() {
    const messageElement = document.getElementById('facebook-error');
    const inputElement = document.getElementById('facebook');
    
    if (messageElement) {
        messageElement.style.display = 'none';
    }
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

// Clear validation message when user starts typing
document.getElementById('facebook').addEventListener('input', function() {
    clearValidationMessage();
});

// Slideshow functionality
let currentSlideIndex = 0;
let slideInterval;

function showSlide(n) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.nav-dot');
    
    if (n >= slides.length) {
        currentSlideIndex = 0;
    }
    if (n < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Show current slide
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

function currentSlide(n) {
    currentSlideIndex = n - 1;
    showSlide(currentSlideIndex);
    resetSlideInterval();
}

function nextSlide() {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
}

function nextSlideManual() {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
    resetSlideInterval();
}

function previousSlide() {
    currentSlideIndex--;
    showSlide(currentSlideIndex);
    resetSlideInterval();
}

function resetSlideInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 4000); // Change slide every 4 seconds
}

// Initialize slideshow when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Start the slideshow
    resetSlideInterval();
    
    // Pause slideshow on hover
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        slideshowContainer.addEventListener('mouseleave', () => {
            resetSlideInterval();
        });
    }
});
