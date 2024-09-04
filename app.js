import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/feedback', (req, res) => {
    const { title, text } = req.body;
    
});

app.get('/feedback', (req, res) => {

});

app.delete('/feedback', (req, res) => {

});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});