import {Inject, Injectable} from "@nestjs/common";
import {Context, Markup, Telegraf} from "telegraf";
import {Ctx, InjectBot} from "nestjs-telegraf";
import {SceneContext} from "telegraf/typings/scenes";
import IChatService from "../../../types/services/IChatService";
import {IPollService} from "../../../types/services/IPollService";
import {ChatDocument} from "../../../models/types/chat";
import {PollDocument} from "../../../models/types/poll";
import {ChatService} from "../../../services/chat.service";
import {PollService} from "../../../services/poll.service";

@Injectable()
export class KeyboardService {

    constructor(@InjectBot() private readonly bot: Telegraf<Context>,
                @Inject(ChatService) private readonly chatService: IChatService<ChatDocument>,
                @Inject(PollService) private readonly pollService: IPollService<PollDocument>) {}

    async showChatKeyboard(@Ctx() context: Context, id: number){
        const chatList = await this.chatService.getChatList(id);
        let buttons = chatList.map(el =>
            Markup.button.callback(el.title, `showchats:${JSON.stringify({chatId: el.chatId})}`));

        if(buttons.length === 0)
            return "Нет доступных чатов. Сначала добавьте бота в чат, в который вы хотите публиковать опросы. " +
                "Вы также должны обладать правами администратора."

        await context.reply(
            'Выберите чат',
            Markup.inlineKeyboard(buttons, {
                columns: 4
            })
        );
    }

    async showPollKeyboard(@Ctx() context: SceneContext, chatId: number){
        const polls = await this.pollService.getPollList(chatId);

        let buttons = polls.map(el =>
            Markup.button.callback(el.command, `showpoll:${JSON.stringify({id: el._id})}`));

        if(buttons.length === 0)
            return "Для этого чата нет созданных опросов. Отправьте /newpoll, чтобы создать новый опрос.";

        await context.reply(
            'Выберите опрос',
            Markup.inlineKeyboard(buttons, {
                columns: 3
            })
        );
    }

    async showPollSettingsKeyboard(@Ctx() context: Context) {
        // TODO Enum
        await context.reply("Выберите дополнительные настройки", Markup.inlineKeyboard([
                Markup.button.callback("📌 Закрепить", `polloption:pinPool`),
                Markup.button.callback("🗓 Доп. текст опроса", 'polloption:addTimeToTitle'),
                Markup.button.callback("Сохранить", 'polloption:save'),
                Markup.button.callback("Отмена", 'polloption:cancel'),
            ], {
                columns:2
            }));
    }

    async hideKeyboard(@Ctx() context: Context) {
        await context.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } } as any);
    }
}
