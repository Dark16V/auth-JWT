document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    

    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    

    const formData = new FormData(this);
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirm_password: formData.get('confirm_password')
    };
    

    if (data.password !== data.confirm_password) {
        errorMessage.textContent = 'Passwords do not match';
        errorMessage.style.display = 'block';
        return;
    }
    
    if (data.password.length < 6) {
        errorMessage.textContent = 'Password must be at least 6 characters';
        errorMessage.style.display = 'block';
        return;
    }
    

    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';
    
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                successMessage.textContent = 'Registration successful! Redirecting...';
                successMessage.style.display = 'block';
                setTimeout(() => {
                    window.location.href = '/me';
                }, 1500);
            }
        } else {
            const errorData = await response.json();
            errorMessage.textContent = errorData.detail || 'Registration failed';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.textContent = 'Network error. Please try again.';
        errorMessage.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
});


document.getElementById('confirm_password').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    const errorMessage = document.getElementById('errorMessage');
    
    if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = '#dc3545';
        errorMessage.textContent = 'Passwords do not match';
        errorMessage.style.display = 'block';
    } else {
        this.style.borderColor = '#ddd';
        errorMessage.style.display = 'none';
    }
});
