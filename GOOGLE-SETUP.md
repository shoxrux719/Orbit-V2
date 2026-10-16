# Вход через Google для ORBIT

Вход и регистрация используют одну кнопку «Продолжить с Google».
При первом успешном входе сервер создаёт Google-профиль, а при следующих
входах открывает тот же аккаунт и его сохранённый прогресс.

1. Откройте [Google Auth Platform](https://console.cloud.google.com/auth/clients)
   в своём проекте Google Cloud. Настройте Branding и Audience.
   Если приложение находится в режиме Testing, добавьте нужные Google-аккаунты
   в Test users.
2. Создайте OAuth Client ID с типом **Web application**.
3. В **Authorized redirect URIs** добавьте точно:
   `http://127.0.0.1:3000/api/auth/google/callback`
4. Сохраните данные в `.dev.vars` в корне проекта:

   ```dotenv
   APP_ORIGIN=http://127.0.0.1:3000
   GOOGLE_CLIENT_ID=ваш-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=ваш-client-secret
   ```

5. Перезапустите `npm start`. В аккаунте станет доступна кнопка Google.
   Выберите Google-аккаунт, завершите вход и проверьте профиль ORBIT.

Адреса `localhost` и `127.0.0.1` считаются разными: используйте один адрес
и в браузере, и в APP_ORIGIN, и в redirect URI. При публикации замените
APP_ORIGIN на HTTPS-адрес сайта без завершающего слеша и добавьте соответствующий
HTTPS callback в Google Cloud. Продакшен-секрет задаётся в окружении сервера.

Секрет не нужен в браузерном JavaScript. `.dev.vars` исключён из Git.
Приложение запрашивает только `openid email profile`. Сервер проверяет
одноразовый state, nonce, подпись и срок ID token. Сессия хранится в HttpOnly
cookie; в базе хранится хеш токена сессии. Выход аннулирует сессию ORBIT.

Официальная инструкция:
[Google OAuth для web server applications](https://developers.google.com/identity/protocols/oauth2/web-server).
