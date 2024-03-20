import { Injectable } from '@nestjs/common';
import { Payment } from 'src/gateways/gate.interface';
import { Bot } from '../bot.service';
import { Format3Dot } from 'src/shards/helpers/format3Dot';
import * as moment from 'moment-timezone';
import axios from 'axios';

@Injectable()
export class DiscordBot extends Bot {
  async sendMessage(payment: Payment) {
    let content = `🔊 +${Format3Dot(payment.amount)} ${payment.content}`;
    content += `\r\n💰 Số tiền: *${Format3Dot(payment.amount)}*`;
    content += `\r\n📇 Nội dung: **${payment.content}**`;
    content += `\r\n💳 Tài khoản: ${payment.account_receiver} (${payment.gate})`;
    content += `\r\n📅 Thời gian: ${moment
      .tz(payment.date, 'Asia/Ho_Chi_Minh')
      .format('HH:mm DD/MM/YYYY')}`;
      content += `\r\n🗃 Transaction id: ${payment.transaction_id}`;
      content += `\r\n---`;

    let message = {
      "content": content,
      "tts": false,
      "embeds": [
        {
          "title": "💳 (" + payment.gate + ") - " + payment.account_receiver,
          "description": "\n",
          "color": 2326507,
          "fields": [
            {
              "name": "📅 Thời gian",
              "value": moment.tz(payment.date, 'Asia/Ho_Chi_Minh').format('HH:mm DD/MM/YYYY')
            },
            {
              "name": "💰 Số tiền:",
              "value": Format3Dot(payment.amount),
              "inline": true
            },
            {
              "name": "📇 Nội dung: ",
              "value": "```" + payment.content + "```"
            }
          ],
          "footer": {
            "text": "🗃 Transaction id: " + payment.transaction_id
          }
        }
      ],
      "components": [],
      "actions": {}
    }
    await axios.post(
      `https://discord.com/api/webhooks/${this.botConfig.chat_chanel_id}/${this.botConfig.token}`, message
    );
  }
}