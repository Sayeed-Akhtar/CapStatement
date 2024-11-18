const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(bodyParser.json());

const configuration = new Configuration({
    apiKey: 'your-openai-api-key', // Replace with your OpenAI API key
});
const openai = new OpenAIApi(configuration);

let conversationContext = [];

app.post('/chat', async (req, res) => {
    const { userMessage } = req.body;

    try {
        conversationContext.push({ role: "user", content: userMessage });

        const messages = [
            { role: "system", content: "You are a helpful assistant generating a capability statement." },
            ...conversationContext,
        ];

        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages,
        });

        const assistantMessage = completion.data.choices[0].message.content;
        conversationContext.push({ role: "assistant", content: assistantMessage });

        res.json({ message: assistantMessage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/generate-pdf', (req, res) => {
    const { businessName, services, contactInfo } = req.body;

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(20).text(businessName, { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('Key Services:', { underline: true });
    doc.text(services);
    doc.moveDown();
    doc.text('Contact Information:', { underline: true });
    doc.text(contactInfo);

    doc.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
