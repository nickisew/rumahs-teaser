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
        const willingToPay = document.getElementById('willingToPay').checked;
        
        // Validate Facebook URL
        if (!isValidFacebookUrl(facebook)) {
            alert('Please enter a valid Facebook profile URL (e.g., https://facebook.com/username)');
            return;
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
                    facebook: facebook,
                    willingToPay: willingToPay
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                waitlistForm.style.display = 'none';
                successMessage.style.display = 'flex';
                
                // Reset form
                form.reset();
                
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

// Hide the form and go back to main view
function hideForm() {
    document.getElementById('waitlistForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

// Validate Facebook URL
function isValidFacebookUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('facebook.com') || 
               urlObj.hostname.includes('fb.com');
    } catch {
        return false;
    }
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
