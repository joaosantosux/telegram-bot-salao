export default async function handler(request, response) {
    // Bloco para lidar com a permissão de segurança CORS (preflight)
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*'); // Em produção, é melhor restringir para 'https://seu-site.web.app'
    response.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Se for o pedido de permissão, apenas respondemos com sucesso e paramos.
    if (request.method === 'OPTIONS') {
        return response.status(204).send('');
    }

    // Garante que só aceitamos o método 'POST'
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Apenas requisições POST são permitidas' });
    }

    // Garante que os dados chegaram no corpo da requisição
    if (!request.body) {
        console.error("ERRO CRÍTICO: O corpo da requisição (request.body) está vazio!");
        return response.status(400).json({ message: 'Corpo da requisição ausente.' });
    }

    // Extrai os dados e as chaves secretas
    const { userName, serviceName, date, time } = request.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Monta a mensagem de múltiplas linhas usando Template Literal (crase)
    const message = `*Novo Agendamento!* 🔔
  
  *Cliente:* ${userName}
  *Serviço:* ${serviceName}
  *Data:* ${date}
  *Horário:* ${time}
    `;

    // Monta a URL da API do Telegram
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // Tenta enviar a mensagem e responder
    try {
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

        // Se tudo deu certo, envia uma resposta de sucesso
        response.status(200).json({ status: 'success', message: 'Message sent' });

    } catch (error) {
        // Se algo deu errado, registra o erro e envia uma resposta de erro
        console.error("Erro no servidor da Vercel:", error.message);
        response.status(500).json({ status: 'error', message: 'Falha ao enviar mensagem' });
    }
}