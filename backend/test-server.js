const http = require('http');

const server = http.createServer((req, res) => {
    console.log('Request received:', req.method, req.url);
    res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify({ message: 'Test server is working!', timestamp: new Date() }));
});

const PORT = 5002;
server.listen(PORT, 'localhost', () => {
    console.log(`Test server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});