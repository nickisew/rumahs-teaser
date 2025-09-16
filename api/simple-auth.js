// Super simple authentication for testing
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            // Debug: log the entire request
            console.log('POST request received');
            console.log('Headers:', req.headers);
            console.log('Body:', req.body);
            
            const { username, password } = req.body || {};
            
            // Super simple check - no hashing for now
            if (username === 'admin' && password === 'Bellaboo050523!') {
                return res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    sessionToken: 'simple-session-token'
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: `Invalid credentials. Got username: "${username}", password: "${password}"`,
                    debug: {
                        receivedBody: req.body,
                        hasUsername: !!username,
                        hasPassword: !!password
                    }
                });
            }
        } catch (error) {
            console.error('Error in POST handler:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }

    if (req.method === 'GET') {
        return res.json({
            success: true,
            authenticated: false
        });
    }

    console.log('Method not allowed. Received method:', req.method);
    res.status(405).json({ 
        message: 'Method not allowed',
        receivedMethod: req.method,
        allowedMethods: ['GET', 'POST', 'OPTIONS']
    });
}
