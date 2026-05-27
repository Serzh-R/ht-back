export type LoginInputModel = {
   loginOrEmail: string
   password: string
}

export type LoginSuccessViewModel = {
   accessToken: string
}

export type MeViewModel = {
   email: string
   login: string
   userId: string
}

export type RegConfirmCode = {
   code: string
}

export type RegEmailResending = {
   email: string
}
