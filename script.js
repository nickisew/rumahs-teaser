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
        
        // Clear any existing validation messages
        clearValidationMessage();
        
        // Check if Facebook URL is empty or missing
        if (!facebook || facebook.trim() === '') {
            showValidationMessage('facebook-error');
            document.getElementById('facebook').classList.add('error');
            return;
        }
        
        // Validate Facebook URL format
        if (!isValidFacebookUrl(facebook)) {
            showValidationMessage('facebook-error', 'Please enter a valid Facebook profile URL (e.g., facebook.com/username)');
            document.getElementById('facebook').classList.add('error');
            return;
        }
        
        // Normalize the Facebook URL before sending
        const normalizedFacebook = normalizeFacebookUrl(facebook);
        
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
                    facebook: normalizedFacebook,
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
