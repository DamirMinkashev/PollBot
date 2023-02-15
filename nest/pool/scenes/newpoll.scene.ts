import {Action, Command, Ctx, Hears, Message, On, Scene, SceneEnter, Sender, Wizard, WizardStep} from "nestjs-telegraf";
import {SceneContext} from "telegraf/typings/scenes";
import {Inject} from "@nestjs/common";
import {KeyboardService} from "../services/keyboard.service";
import {CallbackWithData, SceneContextUpdate} from "../../../types/common";
import {Update} from "telegraf/typings/core/types/typegram";
import {QueryTypeEnum} from "../../../app/queries/QueryTypeEnum";
import {NewPollState} from "../../../types/newpoll/enums";
import {Poll} from "../../../models/types/pool";
import {Context, Markup, Scenes} from "telegraf";

@Scene('newpoll')
export class NewPollScene {

    private chatId: number | null = null;

    private state: NewPollState = NewPollState.NONE;

    private pool: Partial<Omit<Poll, '_chat'>> = {};

    constructor(@Inject(KeyboardService) private readonly keyboardService: KeyboardService) {}

    @SceneEnter()
    async onSceneEnter(@Ctx() context: SceneContext,
                       @Sender('id') id: number) {
        return this.keyboardService.showChatKeyboard(context, id);
    }

    @Action(/showchats/)
    async onChooseChat(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>>){
        console.log('newpoll scene', 'callback_query onChooseChat')
        const { data } = context.update.callback_query;
        const json = data.substring(data.indexOf(':') + 1);
        const { chatId } = JSON.parse(json);
        this.chatId = chatId;

        await context.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } } as any);
        this.state = NewPollState.SET_NAME;
        return context.scene.enter('createpoll');
    }

    // @WizardStep(1)
    // step1(@Ctx() ctx: Scenes.WizardContext) {
    //     return 'step 1';
    // }

    //
    // @Command('/done')
    // async onDone(@Ctx() context: SceneContext) {
    //     console.log('newpoll scene', '/done')
    //     const count = this.pool.answers?.length;
    //
    //     if(count && count < 2) {
    //         return "Вариантов ответов должно быть минимум два. Задайте варианты ответов."
    //     }
    //
    //     this.state = NewPollState.DONE;
    //
    //     context.reply("Выберите настройки", Markup.inlineKeyboard([
    //         Markup.button.callback("📌 Закрепить", JSON.stringify({type: QueryTypeEnum.CHOOSE_OPTION, key: "pinPool", value: true})),
    //         Markup.button.callback("🥷🏻 Анонимно", JSON.stringify({type: QueryTypeEnum.CHOOSE_OPTION, key: "isAnonymous", value: true})),
    //         Markup.button.callback("☑ Несколько ответов", JSON.stringify({type: QueryTypeEnum.CHOOSE_OPTION, key: "allowsMultipleAnswers", value: true})),
    //         Markup.button.callback("🗓 Добавить дату", JSON.stringify({type: QueryTypeEnum.CHOOSE_OPTION, key: "addTimeToTitle", value: true})),
    //         Markup.button.callback("📌 ☑ 🗓 По умолчанию", JSON.stringify({type: QueryTypeEnum.CHOOSE_OPTION, default: true})),
    //     ], {
    //         columns:2
    //     }));
    // }


    async onAnswer(@Ctx() context: SceneContext) {
        console.log('newpoll scene', 'text onAnswer')
        console.log('11111');
        // switch (this.state) {
        //     case NewPollState.SET_NAME:
        //         this.pool.command = text;
        //         this.state = NewPollState.SET_QUESTION;
        //         return "Пришлите вопрос опроса";
        //     case NewPollState.SET_QUESTION:
        //         this.pool.question = text;
        //         this.state = NewPollState.SET_ANSWER;
        //         return "Пришлите как минимум два варианта ответа. Если вы хотите закончить, пришлите /done";
        //     case NewPollState.SET_ANSWER:
        //         this.pool.answers = this.pool.answers || [];
        //         if(this.pool.answers.length >= 10) {
        //             return "Достигнуто максимальное количество ответов. Пришлите /done"
        //         }
        //         this.pool.answers.push(text);
        //         return "Задайте варианты ответов. Если вы хотите закончить, пришлите /done";
        // }
    }
}
