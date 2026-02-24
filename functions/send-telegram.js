exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: 'Method Not Allowed',
    };
  }

  try {
    // Parse form data
    const params = new URLSearchParams(event.body);
    const fio = params.get('fio') || '';
    const phone = params.get('phone') || '';
    const car = params.get('car') || '';
    const date_start = params.get('date_start') || '';
    const date_end = params.get('date_end') || '';

    // Build message
    const message = `
🚖 Новая заявка с сайта

👤 ФИО: ${fio}
📞 Телефон: ${phone}
🚗 Авто: ${car}
📅 Начало: ${date_start}
📅 Конец: ${date_end}
    `;

    // Get secrets from environment variables
    const token = "8258852892:AAFEnFp-C9kq32zSsXqCSPcsj79igSHiaMI";
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    }

    // Send to Telegram
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      throw new Error(`Telegram error: ${result.description}`);
    }

    // Success – redirect to main page with success flag
    return {
      statusCode: 302,
      headers: {
        ...headers,
        Location: '/?success=1',
      },
      body: '',
    };
  } catch (error) {
    console.error('Error:', error.message);

    // Failure – redirect with error flag
    return {
      statusCode: 302,
      headers: {
        ...headers,
        Location: '/?error=1',
      },
      body: '',
    };
  }
};

