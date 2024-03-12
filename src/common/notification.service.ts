import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FcmService } from 'nestjs-fcm';

@Injectable()
export class FCMNotificationService {
  constructor(private readonly fcmService: FcmService) {}

  async sendNotification(
    deviceTokens,
    title,
    message,
    redirect,
    payloadData = '',
  ) {
    try {
      const payload = {
        notification: {
          title: title,
          body: message,
          // icon_url: "https://example.com/icon.png", // Remote icon URL
        },
        data: {
          redirect: redirect,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          payloadData: payloadData || '',
        },
      };
      const silent = false;
      try {
        const data = await this.fcmService.sendNotification(
          deviceTokens,
          payload,
          silent,
        );
        console.log('data', data);
        console.log('Notification sent successfully.');
        return data;
      } catch (error) {
        console.log('Error:', error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log('ERROR :', error);
    }
  }
}
