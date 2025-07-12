export default async function handler(request, response) {
    // Passo 1: Garantir que a requisição é do tipo POST
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Apenas requisições POST são permitidas' });
    }

    // Passo 2: A CORREÇÃO PRINCIPAL - Verificar se o corpo da requisição existe
    // Às vezes, dependendo do ambiente, o corpo precisa ser explicitamente lido.
    // O Vercel geralmente faz isso para nós, mas esta verificação garante que funcione.
    if (!request.body) {
        console.error("ERRO CRÍTICO: O corpo da requisição (request.body) está vazio!");
        return response.status(400).json({ message: 'Corpo da requisição ausente.' });
    }

    // Se passamos pelas verificações, agora é seguro usar os dados
    const { userName, serviceName, date, time } = request.body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const message = `*Novo Agendamento!* 🔔
    Cliente: ${userName}
Serviço: ${serviceName}
Data: ${date}
Horário: ${time}
`;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const telegramResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

        response.status(200).json({ status: 'success', message: 'Message sent' });
    } catch (error) {
        console.error("Erro no servidor da Vercel:", error.message);
        response.status(500).json({ status: 'error', message: 'Falha ao enviar mensagem' });
    }
}
```