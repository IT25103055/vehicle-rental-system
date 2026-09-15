document.getElementById('registerForm').addEventListener('submit', async event => {
    event.preventDefault();
    const newUser = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        contactNumber: document.getElementById('contactNumber').value.trim(),
        drivingLicenceNumber: document.getElementById('drivingLicenceNumber').value.trim(),
        password: document.getElementById('password').value
    };
    try {
        const response = await AppAuth.apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(newUser) });
        if (!response.ok) throw new Error(await AppAuth.responseMessage(response));
        alert('Registration successful. You can now sign in.');
        window.location.href = 'login.html';
    } catch (error) {
        alert(`Registration failed: ${error.message}`);
    }
});
