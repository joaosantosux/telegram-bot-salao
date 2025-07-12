export default async function handler(request, response) {
    // 1. Pega os segredos do ambiente
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 2. Pega os dados do agendamento do corpo da requisição
    const { userName, serviceName, date, time } = request.body;

    // 3. Monta a mensagem
    const message = `*Novo Agendamento!* 🔔
    Cliente: ${userName}
Serviço: ${serviceName}
Data: ${date}
Horário: ${time}
`;

    // 4. Monta a URL da API do Telegram
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        // 5. Envia a mensagem para a API do Telegram
        const telegramResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        // Verifica se a resposta do Telegram foi bem-sucedida
        if (!telegramResponse.ok) {
            // Se não foi, joga um erro para ser pego pelo catch
            const errorData = await telegramResponse.json();
            throw new Error(`Telegram API error: ${errorData.description}`);
        }

        // 6. Responde para o nosso app React que deu tudo certo
        response.status(200).json({ status: 'success', message: 'Message sent' });

    } catch (error) {
        // 7. Se der erro, loga o erro e avisa o nosso app React
        console.error("Erro no servidor da Vercel:", error.message);
        response.status(500).json({ status: 'error', message: 'Failed to send message' });
    }
}
```