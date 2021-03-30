import got from "got";
import * as FormData from "form-data";
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS)
        private readonly options:MailModuleOptions,
    ){}

    private async sendEmail(
        to:string,
        subject:string,
        template:string,
        emailVars:EmailVar[]
    ){
        const form = new FormData();
        form.append(
            "from",
            `Sang from Sang Eats <mailgun@${this.options.domain}>`
        );
        form.append("to", to);
        form.append("subject", subject);
        form.append("template", template);
        emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));
        try{
            await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
                headers:{
                    "Authorization":`Basic ${Buffer.from(
                        `api:${this.options.apiKey}`
                    ).toString("base64")}`
                },
                method:"POST",
                body:form
            });
        }catch(error){
            console.log(error);
        }
    }

    sendVerificationEmail(email:string, code:string){
        this.sendEmail(
            `${this.options.fromEmail}`, // temp
            "Verify Your Email",
            "verify-email",
            [
                {key:"code", value:code},
                {key:"username", value:email}
            ]
        );
    }
}