import type { ApiError, ApiFieldError } from '../api/types';

import { DEBUG } from '../config';

const READABLE_ERROR_MESSAGES: Record<string, string> = {
  CHAT_RESTRICTED: 'Вы не можете отправлять сообщения в этот чат: вас ограничили',
  CHAT_SEND_POLL_FORBIDDEN: 'В этом чате нельзя создавать опросы',
  CHAT_SEND_STICKERS_FORBIDDEN: 'В этом чате нельзя отправлять стикеры',
  CHAT_SEND_GIFS_FORBIDDEN: 'В этом чате нельзя отправлять GIF',
  CHAT_SEND_MEDIA_FORBIDDEN: 'В этом чате нельзя отправлять медиа',
  CHAT_LINK_EXISTS: 'Чат публичный, скрыть историю от новых участников нельзя',
  SLOWMODE_WAIT_X: 'В чате включён медленный режим: подождите перед отправкой следующего сообщения',
  USER_BANNED_IN_CHANNEL: 'Вам запрещено отправлять сообщения в группы и каналы',
  USER_IS_BLOCKED: 'Этот пользователь вас заблокировал',
  YOU_BLOCKED_USER: 'Вы заблокировали этого пользователя',
  IMAGE_PROCESS_FAILED: 'Не удалось обработать изображение',
  MEDIA_EMPTY: 'Некорректный медиафайл',
  MEDIA_GROUPED_INVALID: 'Не удалось заменить медиа в альбоме',
  MEDIA_NEW_INVALID: 'Не удалось заменить медиа',
  MESSAGE_NOT_MODIFIED: 'Сообщение не изменено: новый текст совпадает с текущим',
  MEDIA_INVALID: 'Некорректный медиафайл',
  PASSWORD_HASH_INVALID: 'Неверный пароль',
  PHOTO_EXT_INVALID: 'Неподдерживаемый формат фото',
  PHOTO_INVALID_DIMENSIONS: 'Недопустимые размеры фото',
  PHOTO_SAVE_FILE_INVALID: 'Внутренняя ошибка, попробуйте позже',
  MESSAGE_DELETE_FORBIDDEN: 'Некоторые сообщения нельзя удалить (скорее всего, это служебные сообщения)',
  MESSAGE_POLL_CLOSED: 'Опрос завершён',
  MESSAGE_EDIT_TIME_EXPIRED: 'Это сообщение больше нельзя редактировать',
  PINNED_DIALOGS_TOO_MUCH: 'Можно закрепить не более 5 чатов',
  CHANNEL_PRIVATE: 'Это закрытый канал',
  MEDIA_CAPTION_TOO_LONG: 'Слишком длинная подпись',
  ADDRESS_STREET_LINE1_INVALID: 'Указан некорректный адрес',
  ADDRESS_STREET_LINE2_INVALID: 'Указан некорректный адрес',
  ADDRESS_CITY_INVALID: 'Указан некорректный город',
  ADDRESS_COUNTRY_INVALID: 'Указана некорректная страна',
  ADDRESS_POSTCODE_INVALID: 'Указан некорректный индекс',
  ADDRESS_STATE_INVALID: 'Указан некорректный регион',
  REQ_INFO_NAME_INVALID: 'Указано некорректное имя',
  REQ_INFO_PHONE_INVALID: 'Указан некорректный телефон',
  REQ_INFO_EMAIL_INVALID: 'Указан некорректный email',
  // TODO Bring back after fixing the weird bug
  // CHANNEL_INVALID: 'Произошла ошибка. Попробуйте позже',
  LINK_NOT_MODIFIED: 'Это обсуждение уже привязано к каналу',
  MESSAGE_TOO_LONG: 'Слишком длинное сообщение',

  // Non-API errors
  // eslint-disable-next-line @stylistic/max-len
  SERVICE_WORKER_DISABLED: 'Service Worker отключён, потоковое воспроизведение медиа может не работать. Перезагрузите страницу, не удерживая клавишу Shift',
  MESSAGE_TOO_LONG_PLEASE_REMOVE_CHARACTERS: 'Сообщение слишком длинное. Удалите лишних символов: {EXTRA_CHARS_COUNT}',
  FRESH_RESET_AUTHORISATION_FORBIDDEN: 'Нельзя завершать другие сеансы, пока с входа в текущий не прошло 24 часа',

  BOTS_TOO_MUCH: 'В этом чате слишком много ботов',
  BOT_GROUPS_BLOCKED: 'Этого бота нельзя добавлять в группы',
  USERS_TOO_MUCH: 'Превышено максимальное число участников',
  USER_CHANNELS_TOO_MUCH: 'Один из пользователей состоит в слишком большом числе каналов и групп',
  USER_KICKED: 'Этот пользователь был исключён из чата',
  USER_NOT_MUTUAL_CONTACT: 'Этот пользователь не является взаимным контактом',
  USER_PRIVACY_RESTRICTED: 'Настройки приватности пользователя не позволяют это сделать',
  INVITE_HASH_EMPTY: 'Пустая ссылка-приглашение',
  INVITE_HASH_EXPIRED: 'Срок действия ссылки-приглашения истёк',
  INVITE_HASH_INVALID: 'Недействительная ссылка-приглашение',
  CHANNELS_TOO_MUCH: 'Вы вступили в слишком большое число каналов и групп',
  USER_ALREADY_PARTICIPANT: 'Вы уже участник этого чата',
  SCHEDULE_DATE_INVALID: 'Некорректная дата отправки',
  WALLPAPER_DIMENSIONS_INVALID: 'Недопустимые размеры обоев, выберите другой файл',
  ADMINS_TOO_MUCH: 'Слишком много администраторов',
  ADMIN_RANK_EMOJI_NOT_ALLOWED: 'Должность администратора не может содержать эмодзи',
  ADMIN_RANK_INVALID: 'Некорректная должность администратора',
  FRESH_CHANGE_ADMINS_FORBIDDEN: 'Вы только что стали администратором и пока не можете назначать или изменять других',
  SESSION_TOO_FRESH: 'Сеанс слишком новый, попробуйте позже',
  SESSION_IS_FRESH: 'Сеанс слишком новый, попробуйте позже',
  INPUT_USER_DEACTIVATED: 'Это действие недоступно для удалённого аккаунта',
  BOT_PRECHECKOUT_TIMEOUT: 'Время ожидания оплаты истекло',
  PROVIDER_ACCOUNT_TIMEOUT: 'Платёжный провайдер не ответил вовремя',

  STARGIFT_CONVERT_TOO_OLD: 'Этот подарок больше нельзя обменять на звёзды',
  SUBSCRIPTION_ALREADY_ACTIVE: 'Вы уже подписаны',

  PEERS_LIST_EMPTY: 'В список не добавлено ни одного чата',

  PAID_MEDIA_FORBIDDEN: 'В этом чате нельзя отправлять платные медиа',

  USER_DISALLOWED_STARGIFTS: 'Пользователь не принимает подарки',
};

if (DEBUG) {
  READABLE_ERROR_MESSAGES.CHAT_WRITE_FORBIDDEN = 'Вы не можете писать в этот чат';
  READABLE_ERROR_MESSAGES.CHAT_ADMIN_REQUIRED = 'Для этого нужно быть администратором чата';
}

export const SHIPPING_ERRORS: Record<string, ApiFieldError> = {
  ADDRESS_STREET_LINE1_INVALID: {
    field: 'streetLine1',
    message: 'Некорректный адрес',
  },
  ADDRESS_STREET_LINE2_INVALID: {
    field: 'streetLine2',
    message: 'Некорректный адрес',
  },
  ADDRESS_CITY_INVALID: {
    field: 'city',
    message: 'Некорректный город',
  },
  ADDRESS_COUNTRY_INVALID: {
    field: 'countryIso2',
    message: 'Некорректная страна',
  },
  ADDRESS_POSTCODE_INVALID: {
    field: 'postCode',
    message: 'Некорректный индекс',
  },
  ADDRESS_STATE_INVALID: {
    field: 'state',
    message: 'Некорректный регион',
  },
  REQ_INFO_NAME_INVALID: {
    field: 'fullName',
    message: 'Некорректное имя',
  },
  REQ_INFO_PHONE_INVALID: {
    field: 'phone',
    message: 'Некорректный телефон',
  },
  REQ_INFO_EMAIL_INVALID: {
    field: 'email',
    message: 'Некорректный email',
  },
};

const FINAL_PAYMENT_ERRORS = new Set([
  'BOT_PRECHECKOUT_FAILED',
  'PAYMENT_FAILED',
]);

const ERROR_CODES_WITHOUT_DIALOG = new Set([
  406,
]);

export default function getReadableErrorText(error: ApiError) {
  const { message, isSlowMode, textParams } = error;
  // Currently, Telegram API doesn't return `SLOWMODE_WAIT_X` error as described in the docs
  if (isSlowMode) {
    const extraPartIndex = message.indexOf(' (caused by');
    return extraPartIndex > 0 ? message.substring(0, extraPartIndex) : message;
  }
  let errorMessage = READABLE_ERROR_MESSAGES[message];
  if (errorMessage && textParams) {
    errorMessage = Object.keys(textParams).reduce((acc, current) => {
      return acc.replace(current, textParams[current]);
    }, errorMessage);
  }
  return errorMessage;
}

export function getShippingError(error: ApiError): ApiFieldError | undefined {
  return SHIPPING_ERRORS[error.message];
}

export function shouldClosePaymentModal(error: ApiError): boolean {
  return FINAL_PAYMENT_ERRORS.has(error.message);
}

export function shouldShowErrorDialog(error: ApiError): boolean {
  if (error.code && ERROR_CODES_WITHOUT_DIALOG.has(error.code)) return false;
  if (error.hasErrorKey && !getReadableErrorText(error)) return false;

  return true;
}
