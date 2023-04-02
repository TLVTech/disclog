import axios from "axios";

enum LogLevel {
  Info = 0,
  Warning = 1,
  Error = 2,
}

class Disclog {
  webhook_url: string;
  queue: Array<{ level: LogLevel; message: string; webhook_url?: string }>;
  processing: boolean;

  constructor(webhook_url: string) {
    this.webhook_url = webhook_url;
    this.queue = [];
    this.processing = false;
  }

  async log(level: LogLevel, message: string, webhook_url?: string) {
    if (webhook_url) {
      this.webhook_url = webhook_url;
    }

    if (!this.webhook_url) {
      throw new Error("Webhook URL is required");
    }

    this.queue.push({ level, message, webhook_url });
    if (!this.processing) {
      this.processQueue();
    }
  }

  async processQueue() {
    this.processing = true;
    while (this.queue.length > 0) {
      const { level, message, webhook_url } = this.queue.shift();
      let color: number;
      let title: string;
      switch (level) {
        case LogLevel.Info:
          color = 0x3498db; // Blue
          title = "Info";
          break;
        case LogLevel.Warning:
          color = 0xf1c40f; // Yellow
          title = "Warning";
          break;
        case LogLevel.Error:
          color = 0xe74c3c; // Red
          title = "Error";
          break;
        default:
          throw new Error("Invalid log level");
      }

      try {
        await axios.post(this.webhook_url, {
          embeds: [
            {
              type: "rich",
              title,
              description: message,
              color
            },
          ],
        });
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
    this.processing = false;
  }

  info(message: string, webhook_url?: string) {
    this.log(LogLevel.Info, message, webhook_url);
  }

  warning(message: string, webhook_url?: string) {
    this.log(LogLevel.Warning, message, webhook_url);
  }

  error(message: string, webhook_url?: string) {
    this.log(LogLevel.Error, message, webhook_url);
  }
}

export { Disclog };
