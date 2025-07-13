// ==========================================================
// INÍCIO DO ARQUIVO: telegram-bot-salao/api/sendMessage.js
// COPIE TUDO ABAIXO E COLE NO SEU ARQUIVO
// ==========================================================

export default async function handler(request, response) {
    // BLOCO 1: Lida com o pedido de permissão de segurança (CORS)
    // O navegador envia um pedido 'OPTIONS' antes do 'POST' real.
    // Precisamos responder a ele que o nosso site tem permissão.
    if (request.method === 'OPTIONS') {
        response.setHeader('Access-Control-Allow-Credentials', 'true');
        response.setHeader('Access-Control-Allow-Origin', '*'); // Permite qualquer origem
        response.setHeader('Access-Control-Allow-Methods', 'POST');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return response.status(204).send('');
    }

    // BLOCO 2: Garante que só aceitamos o método 'POST'
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Apenas requisições POST são permitidas' });
    }

    // BLOCO 3: Garante que os dados chegaram
    if (!request.body) {
        console.error("ERRO CRÍTICO: O corpo da requisição (request.body) está vazio!");
        return response.status(400).json({ message: 'Corpo da requisição ausente.' });
    }

    // BLOCO 4: Extrai os dados e as chaves secretas
    const { userName, serviceName, date, time } = request.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // BLOCO 5: Monta a mensagem de múltiplas linhas (usando a crase `)
    const message = `*Novo Agendamento!* 🔔
  
  *Cliente:* ${userName}
  *Serviço:* ${serviceName}
  *Data:* ${date}
  *Horário:* ${time}
    `;

    // BLOCO 6: Prepara e envia a mensagem para a API do Telegram
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

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

// ==========================================================
// FIM DO ARQUIVO
// ==========================================================