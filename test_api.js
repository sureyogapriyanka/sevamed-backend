// Using built-in fetch API (Node.js 18+)

async function testAPI() {
    try {
        // Test registration
        console.log('Testing user registration...');
        const registerResponse = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'testuser',
                password: 'testpass123',
                role: 'patient',
                name: 'Test User',
                email: 'test@example.com'
            })
        });

        const registerData = await registerResponse.json();
        console.log('Registration response:', registerData);

        // Test login
        console.log('\nTesting user login...');
        const loginResponse = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'testuser',
                password: 'testpass123'
            })
        });

        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);

    } catch (error) {
        console.error('Error testing API:', error);
    }
}

testAPI();