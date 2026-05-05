import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        colorScheme: 'light' | 'dark';
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        version: string;
        platform: string;
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
}

export interface UseTelegramReturn {
  tg: Window['Telegram']['WebApp'] | null;
  user: TelegramUser | null;
  themeParams: {
    bgColor?: string;
    textColor?: string;
    hintColor?: string;
    linkColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    secondaryBgColor?: string;
  };
  colorScheme: 'light' | 'dark';
  platform: string;
  isExpanded: boolean;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  setMainButtonActive: (active: boolean) => void;
  setMainButtonText: (text: string) => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  closeApp: () => void;
}

export function useTelegram(): UseTelegramReturn {
  const [tg, setTg] = useState<Window['Telegram']['WebApp'] | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [themeParams, setThemeParams] = useState<{
    bgColor?: string;
    textColor?: string;
    hintColor?: string;
    linkColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    secondaryBgColor?: string;
  }>({});
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  const [platform, setPlatform] = useState<string>('unknown');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      // Initialize
      webApp.ready();
      webApp.expand();
      
      setTg(webApp);
      setIsExpanded(true);
      
      // Extract user data
      if (webApp.initDataUnsafe?.user) {
        const tgUser = webApp.initDataUnsafe.user;
        setUser({
          id: tgUser.id,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          languageCode: tgUser.language_code,
        });
      }
      
      // Extract theme params
      const tp = webApp.themeParams;
      setThemeParams({
        bgColor: tp.bg_color,
        textColor: tp.text_color,
        hintColor: tp.hint_color,
        linkColor: tp.link_color,
        buttonColor: tp.button_color,
        buttonTextColor: tp.button_text_color,
        secondaryBgColor: tp.secondary_bg_color,
      });
      
      setColorScheme(webApp.colorScheme || 'dark');
      setPlatform(webApp.platform || 'unknown');
      
      // Handle viewport changes
      webApp.onEvent('viewportChanged', () => {
        setIsExpanded(webApp.isExpanded);
      });
    }
  }, []);

  const showMainButton = (text: string, onClick: () => void) => {
    if (tg?.MainButton) {
      tg.MainButton.setText(text);
      tg.MainButton.onClick(onClick);
      tg.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (tg?.MainButton) {
      tg.MainButton.hide();
    }
  };

  const setMainButtonActive = (active: boolean) => {
    if (tg?.MainButton) {
      active ? tg.MainButton.enable() : tg.MainButton.disable();
    }
  };

  const setMainButtonText = (text: string) => {
    if (tg?.MainButton) {
      tg.MainButton.setText(text);
    }
  };

  const showBackButton = (onClick: () => void) => {
    if (tg?.BackButton) {
      tg.BackButton.onClick(onClick);
      tg.BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (tg?.BackButton) {
      tg.BackButton.hide();
    }
  };

  const showAlert = (message: string) => {
    if (tg) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (tg) {
        tg.showConfirm(message, resolve);
      } else {
        resolve(confirm(message));
      }
    });
  };

  const closeApp = () => {
    if (tg) {
      tg.close();
    }
  };

  return {
    tg,
    user,
    themeParams,
    colorScheme,
    platform,
    isExpanded,
    showMainButton,
    hideMainButton,
    setMainButtonActive,
    setMainButtonText,
    showBackButton,
    hideBackButton,
    showAlert,
    showConfirm,
    closeApp,
  };
}
