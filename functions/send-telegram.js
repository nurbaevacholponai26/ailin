exports.handler = async (event) => {
  console.log('✅ Функция вызвана. Метод:', event.httpMethod);
  console.log('📦 Тело запроса:', event.body);
  exports.handler = async (event) => {
  // Разрешаем кросс-доменные запросы (CORS)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Обработка предварительного запроса OPTIONS (браузер иногда шлёт его)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Принимаем только POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: 'Method Not Allowed',
    };
  }

  try {
    // Данные от формы приходят в формате application/x-www-form-urlencoded
    const params = new URLSearchParams(event.body);
    const fio = params.get('fio') || '';
    const phone = params.get('phone') || '';
    const car = params.get('car') || '';
    const date_start = params.get('date_start') || '';
    const date_end = params.get('date_end') || '';

    // Формируем сообщение
    const message = `
🚖 Новая заявка с сайта

👤 ФИО: ${fio}
📞 Телефон: ${phone}
🚗 Авто: ${car}
📅 Начало: ${date_start}
📅 Конец: ${date_end}
    `;

    // Берём токен и chat_id из переменных окружения
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set');
    }

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
      throw new Error(result.description);
    }

    // Успех — редирект на главную с параметром success
    return {
      statusCode: 302,
      headers: {
        ...headers,
        Location: '/?success=1',
      },
      body: '',
    };
  } catch (error) {
    console.error('Ошибка:', error.message);
    // Ошибка — редирект на главную с параметром error
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

