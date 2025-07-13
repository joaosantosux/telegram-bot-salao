export default async function handler(request, response) {
    // Garante que a requisição é do tipo POST
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Apenas requisições POST são permitidas' });
    }

    // Verifica se o corpo da requisição existe
    if (!request.body) {
        console.error("ERRO CRÍTICO: O corpo da requisição (request.body) está vazio!");
        return response.status(400).json({ message: 'Corpo da requisição ausente.' });
    }

    // Pega os dados do agendamento
    const { userName, serviceName, date, time } = request.body;

    // Pega as chaves secretas do ambiente da Vercel
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Monta a mensagem
    const message = `*Novo Agendamento!* 🔔
  
  *Cliente:* ${userName}
  *Serviço:* ${serviceName}
  *Data:* ${date}
  *Horário:* ${time}
    `;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        // Envia a mensagem para a API do Telegram
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

        if (!telegramResponse.ok) {
            const errorData = await telegramResponse.json();
            throw new Error(`Erro da API do Telegram: ${errorData.description}`);
        }

        // Responde para o app React que deu tudo certo
        response.status(200).json({ status: 'success', message: 'Message sent' });

    } catch (error) {
        console.error("Erro no servidor da Vercel:", error.message);
        response.status(500).json({ status: 'error', message: 'Falha ao enviar mensagem' });
    }
}