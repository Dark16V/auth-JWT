document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    const formData = new FormData(this);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    if (!data.email || !data.password) {
        errorMessage.textContent = 'Please fill in all fields';
        errorMessage.style.display = 'block';
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                successMessage.textContent = 'Login successful! Redirecting...';
                successMessage.style.display = 'block';
                setTimeout(() => {
                    window.location.href = '/me';
                }, 1500);
            }
        } else {
            const errorData = await response.json();
            errorMessage.textContent = errorData.detail || 'Login failed';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.textContent = 'Network error. Please try again.';
        errorMessage.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});
