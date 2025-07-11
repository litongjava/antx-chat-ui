import {message} from "antd";

export const showError = (error: unknown, defaultMsg: string) => {
  if (error instanceof Error) {
    message.error(error.message || defaultMsg);
  } else if (typeof error === 'string') {
    message.error(error);
  } else {
    message.error(defaultMsg);
  }
};