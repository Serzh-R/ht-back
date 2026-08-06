import { UserDb } from '../users/users.types'
import { EmailAdapter } from './email.adapter'

export class EmailManager {
   constructor(protected emailAdapter: EmailAdapter) {}

   async sendEmailConfirmationMessage(user: UserDb) {
      const subject = 'Подтверждение регистрации'
      const message = `<h1>Добро пожаловать!</h1>
      <p>Для завершения регистрации перейдите по ссылке ниже:</p>
      <a href="http://localhost:3004/confirm?code=${user.emailConfirmation.confirmationCode}">Подтвердить email</a>`
      await this.emailAdapter.sendEmail(user.email, subject, message)
   }

   async sendPasswordRecoveryMessage(email: string, recoveryCode: string): Promise<void> {
      const subject = 'Password recovery'

      const message = `<h1>Восстановление пароля</h1>
      <p>Для завершения восстановления пароля, пожалуйста перейдите по ссылке ниже:</p>
      <a href="http://localhost:3004/password-recovery?recoveryCode=${recoveryCode}">
         восстановить пароль
      </a>`

      await this.emailAdapter.sendEmail(email, subject, message)
   }
}
