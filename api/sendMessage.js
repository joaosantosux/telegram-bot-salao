// Esta é uma função "Serverless" que a Vercel entende.
// Ela recebe um pedido (request) e envia uma resposta (response).
export default async function handler(request, response) {
    // 1. Pega os segredos do ambiente (vamos configurar isso na Vercel depois)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
  
    // 2. Pega os dados do agendamento que nosso app React vai enviar
    const { userName, serviceName, date, time } = request.body;
  
    // 3. Monta a mensagem formatada para o Telegram
    const message = `*Novo Agendamento!* 🔔
    Cliente: ${userName}
Serviço: ${serviceName}
Data: ${date}
Horário: ${time}
`;
// 4. Monta a URL da API do Telegram para enviar a mensagem
const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

try {
  // 5. Envia a mensagem para a API do Telegram
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown', // Permite usar negrito (*texto*) e outras formatações
    }),
  });

  // 6. Responde para o nosso app React que deu tudo certo
  response.status(200).json({ status: 'success', message: 'Message sent' });
} catch (error) {
  console.error("Erro ao enviar mensagem para o Telegram:", error);
  // 7. Se der erro, avisa o nosso app React
  response.status(500).json({ status: 'error', message: 'Failed to send message' });
}
}
```