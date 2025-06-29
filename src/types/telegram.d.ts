interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  ready: () => void;
  expand: () => void;
  // Add more properties as needed from Telegram's docs
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}
export {};
